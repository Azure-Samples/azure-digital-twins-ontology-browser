using System.Text.Json.Nodes;
using System.Web;
using adt_ontology_index.Models.DigitalTwins.Search;
using adt_ontology_index.Models.Indexes;
using adt_ontology_index.Models.Ontologies;
using adt_ontology_index.Models.Responses;
using adt_ontology_index.Services.Indexes.Face;
namespace adt_ontology_index
{
  public class OntologyIndexer
  {
    private readonly ILogger<OntologyIndexer> _logger;
    public Dictionary<string, IModelIndexer> _indices { get; } = new Dictionary<string, IModelIndexer>();
    public OntologyIndexer(ILogger<OntologyIndexer> logger)
    {
      _logger = logger;
    }

    public void IndexOntology(Ontology o, Dictionary<string, string> models)
    {
      var indexName = $"{o.Owner}/{o.Name}";
      var index = GetIndex(indexName);
      foreach (var model in models)
      {
        _logger.LogInformation($"\t\t {model.Key}");
        index.IndexModel(model.Value);

      }
    }

    public void IndexOntology(Ontology o, IModelIndexer m, Dictionary<string, string> models)
    {
      foreach (var model in models)
      {
        _logger.LogInformation($"\t\t {model.Key}");
        m.IndexModel(model.Value);
      }
    }

    public void AddIndex(Ontology o, IModelIndexer m)
    {
      var indexName = $"{o.Owner}/{o.Name}";

      if (!_indices.ContainsKey(indexName))
        _indices.Add(indexName, m);
      else
        _indices[indexName] = m;
    }
 

    public SuggestModelsResponse SuggestModels(JsonObject message, bool includeModelDefinitions, bool includeValues)
    {

      var response = new SuggestModelsResponse
      {
        FieldNames = new[] { message.ToString() }
      };

      var searchTerms = message.Select(s => s.Key).ToList();

      if (includeValues)
        searchTerms.AddRange(message.Select(s => s.Value.ToString()));

      return ExecuteSearch(response, includeModelDefinitions, searchTerms.ToArray());
    }

    public List<SearchableDigitalTwinModel> GetAllModels(string ontologyName){
      var index = GetIndex(ontologyName);
      return index.GetAllModels();
    }

    public SuggestModelsResponse SuggestModels(string something, bool includeModelDefinitions, bool useCache = true)
    {
      var response = new SuggestModelsResponse
      {
        FieldNames = new[] { something }
      };

      return ExecuteSearch(response, includeModelDefinitions, something);
    }

    private SuggestModelsResponse ExecuteSearch(SuggestModelsResponse response, bool includeModelDefinitions, params string[] terms)
    {
      Parallel.ForEach(_indices, (kvp) =>
      {
        var index = kvp.Value;
        ProcessResults(index, index.Search(terms), response, includeModelDefinitions);
      });       

      return response;
    }

    private void ProcessResults(IModelIndexer index, IEnumerable<ModelScoreDoc> results, SuggestModelsResponse response, bool includeModelDefinitions)
    {
      if (results == null || !results.Any()) return;

      var suggestedOntology = index.GetSuggestedOntology();

      foreach (var result in results)
        ProcessResult(index, result, suggestedOntology, includeModelDefinitions);

      if (suggestedOntology.SuggestedModels.Any())
        response.SuggestedOntologies.Add(suggestedOntology);
    }

    private void ProcessResult(IModelIndexer index, ModelScoreDoc result, SuggestedOntology suggestedOntology, bool includeModelDefinitions)
    {
      if (result == null) return;
      var id = result.Id;
      if (string.IsNullOrWhiteSpace(id)) return;
      var dtmi = index.GetDtmi(id);
      var model = index.GetModel(dtmi);
      if (model == null) return;
      if (!suggestedOntology.SuggestedModels.ContainsKey(dtmi))
        suggestedOntology.SuggestedModels.Add(dtmi, new SuggestedModel
        {
          Dtdl = includeModelDefinitions ? model : string.Empty,
          Id = dtmi,
          Weighting = result.Score,
          Locator = $"/ModelIndex/Dtdl?ontology={HttpUtility.UrlEncode(suggestedOntology.Name)}&id={HttpUtility.UrlEncode(dtmi)}"
        });
    }

    public string GetModel(string ontology, string modelId)
    {
      var index = GetIndex(ontology);
      return index.GetModel(modelId);
    }

    private IModelIndexer GetIndex(Ontology ontology) => GetIndex(ontology.Name);

    private IModelIndexer GetIndex(string ontologyName)
    {
      var key = _indices.Keys.FirstOrDefault(k => k.Equals(ontologyName, StringComparison.InvariantCultureIgnoreCase));
      if (_indices.ContainsKey(key))
      {
        return _indices[key];
      }
      throw new Exception($"No index found for {ontologyName}");
    }
  }
}