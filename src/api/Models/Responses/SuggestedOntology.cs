using adt_ontology_index.Models.Ontologies;

namespace adt_ontology_index.Models.Responses
{
  public class SuggestedOntology : Ontology
  {

    public SuggestedOntology(Ontology ontology)
    {
      Name = $"{ontology.Owner}/{ontology.Name}";
      Description = ontology.Description;
      GitHubUrl = ontology.GitHubUrl;
      Owner = ontology.Owner;
    }

    public int SuggestedModelCount => SuggestedModels.Count();

    public Dictionary<string, SuggestedModel> SuggestedModels { get; set; } = new Dictionary<string, SuggestedModel>();
  }
}