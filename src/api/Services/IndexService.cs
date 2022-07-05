using System.Text.Json;
using System.Text.Json.Nodes;
using System.Web;
using adt_ontology_index.Adapters;
using adt_ontology_index.Models.Ontologies;
using adt_ontology_index.Models.Responses;
using adt_ontology_index.Models.Indexes;
using adt_ontology_index.Services.Cache;
using adt_ontology_index.Services.Indexes;
using adt_ontology_index.Models.DigitalTwins.Search;

namespace adt_ontology_index.Services
{
  public class IndexService
  {
    private ILogger<IndexService> _logger;
    private OntologyAdapter _ontologyAdapter;
    private OntologyIndexer _ontologyIndexer;
    private readonly FieldSuggestionCache _fieldCache;
    private readonly ModelIndexerProvider _modelIndexProvider;
    private IndexState _indexStatus = new IndexState();

    public IndexService(ILogger<IndexService> logger, OntologyAdapter ontologyAdapter, OntologyIndexer ontologyIndexer, FieldSuggestionCache fieldSuggestionCache, ModelIndexerProvider modelIndexProvider)
    {
      _logger = logger;
      _ontologyAdapter = ontologyAdapter;
      _ontologyIndexer = ontologyIndexer;
      _fieldCache = fieldSuggestionCache;
      _modelIndexProvider = modelIndexProvider;
    }

    internal async Task ReIndex()
    {

      if (_indexStatus.IndexStatus == IndexStatuses.Clearing || _indexStatus.IndexStatus == IndexStatuses.Indexing)
        throw new Exception($"Already {_indexStatus.IndexStatus.ToString()} index.... try again later");

      _indexStatus.IndexStatus = IndexStatuses.Clearing;
      var ontologies = await _ontologyAdapter.GetOntologies();

      try
      {
        Parallel.ForEach(ontologies, (ontology) => ClearOntologyIndex(ontology));
      }
      finally
      {
        _indexStatus.IndexStatus = IndexStatuses.NotIndexed;
      }
      await Index(ontologies);

    }

    internal async Task<OntologyDetails> GetOntologyDetails(string ontology)
    {
        return await _ontologyAdapter.GetOntologyDetails(ontology);
    }

    private void ClearOntologyIndex(Ontology ontology)
    {
      var state = _indexStatus.OntologyIndexes.FirstOrDefault(x => x.IndexName == $"{ontology.Owner}/{ontology.Name}");

      if (state != null)
      {
        state.IndexStatus = IndexStatuses.Clearing;
        state.ModelCount = 0;
        state.IndexedModelCount = 0;
      }

      var indexDirectory = Path.Combine("_ontology_data", "indexes", ontology.Owner, ontology.Name);
      var modelDirectory = Path.Combine("_ontology_data", "models", ontology.Owner, ontology.Name);

      if (Directory.Exists(indexDirectory))
        Directory.Delete(indexDirectory, true);

      if (Directory.Exists(modelDirectory))
        Directory.Delete(modelDirectory, true);

      if (state != null)
        state.IndexStatus = IndexStatuses.NotIndexed;
    }

    internal JsonDocument GetModelDtdl(string ontology, string id)
    {
      if (_indexStatus.IndexStatus != IndexStatuses.Indexed)
        throw new Exception("Ontologies are not yet indexed... try again later");

      var ontologyName = HttpUtility.UrlDecode(ontology);
      var modelId = HttpUtility.UrlDecode(id);
      var modelIndex = _ontologyIndexer._indices.FirstOrDefault(i => i.Key.Equals(ontologyName, StringComparison.OrdinalIgnoreCase));
      if (modelIndex.Key == null)
        return null;
      var model = _ontologyIndexer.GetModel(modelIndex.Key, modelId);
      return JsonDocument.Parse(model);
    }

    internal async Task Index(List<Ontology> ontologies = null)
    {
      if (_indexStatus.IndexStatus == IndexStatuses.Clearing || _indexStatus.IndexStatus == IndexStatuses.Indexing)
        throw new Exception("Ontologies are already being indexed... try again later");

      _indexStatus.IndexStatus = IndexStatuses.Indexing;

      if (ontologies == null)
        ontologies = await _ontologyAdapter.GetOntologies();

      _indexStatus.OntologyIndexes.Clear();

      var ontologyModels = new Dictionary<string, Dictionary<string, string>>();

      foreach (var ontology in ontologies)
      {
        var state = new IndexState
        {
          IndexName = $"{ontology.Owner}/{ontology.Name}",
          IndexStatus = IndexStatuses.NotIndexed,
          ModelCount = 0
        };
        _indexStatus.OntologyIndexes.Add(state);

      }

      _logger.LogInformation("ReIndexing ontologies");

     
      foreach (var ontology in ontologies)
        await IndexOntology(ontology, ontologyModels);

      _logger.LogInformation("ReIndexing complete");

      _indexStatus.IndexStatus = IndexStatuses.Indexed;
    }

    private async Task IndexOntology(Ontology ontology, Dictionary<string, Dictionary<string, string>> ontologyModels)
    {
      var state = _indexStatus.OntologyIndexes.First(x => x.IndexName == $"{ontology.Owner}/{ontology.Name}");
      state.IndexStatus = IndexStatuses.LoadingModel;
      var models = await _ontologyAdapter.GetModelsForOntology(ontology);
      state.ModelCount = models.Count;
      state.IndexStatus = IndexStatuses.Indexing;

      if(state.ModelCount == 0)
      {
        state.IndexStatus = IndexStatuses.NotIndexed;
        _indexStatus.OntologyIndexes.Remove(state);
        _logger.LogWarning("No Models Indexed for ontology " + ontology.Name);
        return;
      }

      var index = _modelIndexProvider.NewModelIndexer(ontology, state);
      _ontologyIndexer.AddIndex(ontology, index);

      state.IndexStatus = IndexStatuses.Indexing;
      _logger.LogInformation($"\tReIndexing ontology {ontology.Name}");

      var indexCount = index.IndexedDocs();

      state.IndexedModelCount = index.IndexModels(models.Select(m => m.Value).ToArray());

      indexCount = index.IndexedDocs();

      if(state.IndexedModelCount == 0)
      {
        state.IndexStatus = IndexStatuses.NotIndexed;
        _indexStatus.OntologyIndexes.Remove(state);
        _logger.LogWarning("No Models Indexed for ontology " + ontology.Name);
        return;
      }

      state.ModelCount = indexCount;
      _indexStatus.ModelCount += indexCount;
      state.IndexedModelCount = indexCount;

      state.IndexStatus = IndexStatuses.Indexed;
    }

    internal SuggestModelsResponse SuggestModelsForObject(JsonObject message, bool includeModelDefinitions, bool useCache, bool includeValues = false)
    {
      return _ontologyIndexer.SuggestModels(message, includeModelDefinitions, includeValues);
    }

    internal IndexState IndexStatus() => _indexStatus;

    internal SuggestModelsResponse SuggestModelsForField(string something, bool includeModelDefinitions, bool useCache = true)
    {

      if (IndexStatus().IndexStatus != IndexStatuses.Indexed)
        return new SuggestModelsResponse
        {
          Error = "Index not ready"
        };

      if (useCache && _fieldCache.IsSuggestionCached(something))
        return _fieldCache.Get(something);

      var response = _ontologyIndexer.SuggestModels(something, includeModelDefinitions);

      _fieldCache.Cache(something, response);

      return response;
    }

    internal List<SearchableDigitalTwinModel> GetOntologyModels(string ontology) => _ontologyIndexer.GetAllModels(ontology);
  }

  
    

}