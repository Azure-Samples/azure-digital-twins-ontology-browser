using adt_ontology_index.Models.Indexes;
using adt_ontology_index.Models.Ontologies;
using adt_ontology_index.Models.Responses;

namespace adt_ontology_index.Services.Indexes
{
  public abstract class ModelIndexer
  {
    protected ILogger _logger;
    protected readonly IndexState _state;
    protected readonly Ontology _ontology;
    protected readonly string _name;
    protected Dictionary<string, string> _ontologyModels = new Dictionary<string, string>();

    protected ModelIndexer(ILogger logger, Ontology ontology, IndexState state = null)
    {
      _logger = logger;
      _state = state ?? new IndexState();
      _ontology = ontology;
      _name = $"{ontology.Owner}-{ontology.Name}".ToLower();
    }

    public SuggestedOntology GetSuggestedOntology() => new SuggestedOntology(_ontology);

    public string ModelIdFileSafe(string id)
    {
      foreach (char c in System.IO.Path.GetInvalidFileNameChars())
      {
        id = id.Replace(c.ToString(), "_");
      }
      return id;
    }

    public string GetDtmi(string id)
    {
      if (id.EndsWith("\\Content"))
        id = id.Split("\\")[0].TrimEnd(';');
      return id;
    }
  }
}