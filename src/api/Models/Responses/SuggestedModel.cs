namespace adt_ontology_index.Models.Responses
{
  public class SuggestedModel {

    public string Dtdl {get;set;}
    public double? Weighting {get;set;}
    public string Id { get; internal set; }

    public string Locator { get; internal set; }
  }
}