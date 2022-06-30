using adt_ontology_index.Models.Ontologies;

namespace adt_ontology_index.Adapters
{
  public class OntologyAdapter
  {
    private readonly ILogger<OntologyAdapter> _logger;
    private readonly GitHubAdapter _gitHubAdapter;

    public OntologyAdapter(ILogger<OntologyAdapter> logger, GitHubAdapter gitHubAdapter)
    {
      _logger = logger;
      _gitHubAdapter = gitHubAdapter;
    }


    public async Task<List<Ontology>> GetOntologies()
    {

      var ontologies = new List<Ontology>();
      try
      {
        var ontologyRepositories = await _gitHubAdapter.GetDigitalTwinOntologyRepositories();

        foreach (var repo in ontologyRepositories)
        {
          ontologies.Add(new Ontology
          {
            Name = repo.Name,
            Description = repo.Description,
            GitHubUrl = repo.HtmlUrl,
            Owner = repo.Owner.Login
          });
        }

      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error getting ontologies");
      }

      return ontologies;
    }

    public async Task<Dictionary<string, string>> GetModelsForOntology(Ontology o) => await _gitHubAdapter.GetOntologyModels(o.Name, o.Owner);

    internal async Task<OntologyDetails> GetOntologyDetails(string ontologyName)
    {
      var ontology = await _gitHubAdapter.GetDigitalTwinOntologyRepository(ontologyName);

      var ontologyDetails = new OntologyDetails
      {
        Name = ontology.Name,
        Description = ontology.Description,
        GitHubUrl = ontology.HtmlUrl,
        Owner = ontology.Owner.Login,
        ReadmeMd = await _gitHubAdapter.GetDigitalTwinOntologyReadme(ontologyName)
      };

       return ontologyDetails;
    }
  }
}