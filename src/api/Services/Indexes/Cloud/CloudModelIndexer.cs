using System.Text.RegularExpressions;
using adt_ontology_index.Models.DigitalTwins.Search;
using adt_ontology_index.Models.Indexes;
using adt_ontology_index.Models.Ontologies;
using adt_ontology_index.Services.Indexes.Face;
using Azure.Search.Documents;
using Azure.Search.Documents.Indexes;
using Azure.Search.Documents.Indexes.Models;
using Azure.Search.Documents.Models;

namespace adt_ontology_index.Services.Indexes.Cloud
{
  public class CloudModelIndexer : ModelIndexer, IModelIndexer
  {
    private readonly SearchClient _searchClient;
    private readonly SearchIndexClient _indexClient;

    public CloudModelIndexer(ILogger<CloudModelIndexer> logger, Ontology ontology, SearchClient client, SearchIndexClient indexClient, IndexState state = null)
      : base(logger, ontology, state)
    {
      _searchClient = client;
      _indexClient = indexClient;
    }

    public string GetModel(string id)
    {
      if (string.IsNullOrWhiteSpace(id))
        return null;
      try
      {
        id = GetDtmi(id).Replace(":", "-").Replace(";", "_");
        var model = _searchClient.GetDocument<SearchableDigitalTwinModel>(id);
        return Regex.Unescape(model.Value.Dtdl);
      }
      catch (Exception ex)
      {
        _logger.LogDebug(ex, "Error getting model");
        _logger.LogError($"Failed to Parse {ex.Message}:{id}");
      }
      return null;
    }

    public int IndexedDocs()
    {
      try
      {
        return (int)_searchClient.GetDocumentCount();
      }
      catch
      {
        return 0;
      }
    }

    public void IndexModel(string json) => IndexModels(new string[] { json });
    public int IndexModels(string[] jsonDefinitions)
    {
      var index = new SearchIndex(_name)
      {
        Fields = new FieldBuilder().Build(typeof(SearchableDigitalTwinModel))
      };

      if (IndexedDocs() > 0)
        _indexClient.DeleteIndex(_name);
      _indexClient.CreateOrUpdateIndex(index);

      var batch = IndexDocumentsBatch.Create<SearchableDigitalTwinModel>();

      Parallel.ForEach(jsonDefinitions, json =>
      {
        try
        {
          var searchableModel = SearchableDigitalTwinModel.FromModel(json);
          if (string.IsNullOrWhiteSpace(searchableModel.DtId)) return;
          _logger.LogInformation("Indexing model {id}", searchableModel.DtId);
          batch.Actions.Add(IndexDocumentsAction.MergeOrUpload(searchableModel));
        }
        catch (Exception e)
        {
          _logger.LogError($"Failed to Parse {e}:{json}");
        }
      });

      if (batch.Actions.Any())
        _searchClient.IndexDocuments(batch);

      return batch.Actions.Count;
    }

    public List<ModelScoreDoc> Search(params string[] terms)
    {
      var results = new List<ModelScoreDoc>();

      foreach (var term in terms)
        results.AddRange(SearchSingleTerm(term));

      return results;
    }


    private List<ModelScoreDoc> SearchSingleTerm(string term)
    {
      var results = new List<ModelScoreDoc>();
      var response = _searchClient.Search<SearchableDigitalTwinModel>("+" + term + "+", DefaultSearchOptions);
      foreach (var result in response.Value.GetResults())
      {
        var doc = result.Document;
        Console.WriteLine($"{doc.DtId}: {doc.DisplayName}");
        results.Add(new ModelScoreDoc
        {
          Id = doc.DtId,
          Score = result.Score
        });
      }

      return results;
    }

    public List<SearchableDigitalTwinModel> GetAllModels()
    {
      var results = new List<SearchableDigitalTwinModel>();
      var response = _searchClient.Search<SearchableDigitalTwinModel>("*", DefaultSearchOptions);

      foreach (var result in response.Value.GetResults())
      {
        var doc = result.Document;
        results.Add(doc);
      }

      return results;
    }

    private SearchOptions DefaultSearchOptions => new SearchOptions
    {
      Size = 10000,
      IncludeTotalCount = true
    };
  }
}