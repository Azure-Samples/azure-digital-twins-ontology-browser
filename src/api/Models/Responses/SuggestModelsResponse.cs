namespace adt_ontology_index.Models.Responses
{
  public class SuggestModelsResponse
  {
    public string[] FieldNames { get; set; }

    public List<SuggestedOntology> SuggestedOntologies { get; set; } = new List<SuggestedOntology>();
    public string Error { get; internal set; }
  }
}