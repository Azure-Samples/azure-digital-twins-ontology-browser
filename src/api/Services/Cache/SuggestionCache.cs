using adt_ontology_index.Models.Responses;

namespace adt_ontology_index.Services.Cache
{
  public class FieldSuggestionCache
  {
    private readonly ILogger<FieldSuggestionCache> _logger;

    private readonly Dictionary<string, SuggestModelsResponse> _fieldSuggestions = new Dictionary<string, SuggestModelsResponse>();

    public FieldSuggestionCache(ILogger<FieldSuggestionCache> logger)
    {
      _logger = logger;
    }

    public bool IsSuggestionCached (string fieldName) => _fieldSuggestions.ContainsKey(fieldName.ToLower());

    public SuggestModelsResponse Get(string fieldName)
    {
      if (!IsSuggestionCached(fieldName.ToLower()))
      {
        _logger.LogWarning($"Suggestion for field {fieldName.ToLower()} is not cached");
        return null;
      }
      return _fieldSuggestions[fieldName.ToLower()];
    }

    public void Cache(string fieldName, SuggestModelsResponse response)
    {
      if(!IsSuggestionCached(fieldName))
      {
        _fieldSuggestions.Add(fieldName.ToLower(), response);
        return;
      }

      _fieldSuggestions[fieldName.ToLower()] = response;
    }
  }
}