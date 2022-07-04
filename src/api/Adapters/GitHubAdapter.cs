using System.IO.Compression;
using Octokit;

namespace adt_ontology_index.Adapters
{
  public class GitHubAdapter
  {
    private ILogger<GitHubAdapter> _logger;
    private GitHubClient _client;

    private static List<string> KnownRepositories = new List<string>
    {
      "digitaltwinconsortium/ManufacturingDTDLOntologies",
      "digitaltwinconsortium/XMPro-dtdl-data-models"
    };
    

    public GitHubAdapter(ILogger<GitHubAdapter> logger, GitHubClient client)
    {
      _logger = logger;
      _client = client;
    }

    public async Task<Repository> GetDigitalTwinOntologyRepository(string name)
    {
      var owner = name.Split('/')[0];
      var repo = name.Split('/')[1];
      var repository = await _client.Repository.Get(owner, repo);
      return repository;
    }

    public async Task<string> GetDigitalTwinOntologyReadme(string repoName)
    {
      var owner = repoName.Split('/')[0];
      var repo = repoName.Split('/')[1];

      var archiveBytes = await _client.Repository.Content.GetArchive(owner, repo, ArchiveFormat.Zipball);
      var zip = new ZipArchive(new MemoryStream(archiveBytes));
      var readme = string.Empty;
      var readmeEntry = zip.Entries.FirstOrDefault(r => r.Name.Equals("README.md", StringComparison.OrdinalIgnoreCase));
      if (readmeEntry == null) return string.Empty;

      using (var stream = readmeEntry.Open())
      {
        using (var reader = new StreamReader(stream))
        {
          readme = reader.ReadToEnd();
        }
      }

      return readme;
    }

    public async Task<List<Repository>> GetDigitalTwinOntologyRepositories()
    {
      var request = new SearchRepositoriesRequest("opendigitaltwins-");
      var result = await _client.Search.SearchRepo(request);
      var ontologies = new List<Repository>();

      foreach (var repo in result.Items)
        await AddRepository(ontologies, repo);

      foreach (var repo in KnownRepositories)
      {
        var owner = repo.Split("/")[0];
        var name = repo.Split("/")[1];
        var repository = await _client.Repository.Get(owner, name);
        await AddRepository(ontologies, repository, true);
      }

      return ontologies;
    }

    private async Task AddRepository(List<Repository> ontologies, Repository repo, bool knownOntology = false)
    {
      try
      {
        IReadOnlyList<RepositoryContent> contents = await _client.Repository.Content.GetAllContents(repo.Owner.Login, repo.Name);

        if (knownOntology || contents.Any(c => c.Name.Equals("ontology", StringComparison.OrdinalIgnoreCase) || contents.Any(c => c.Name.Equals("ontologies", StringComparison.OrdinalIgnoreCase))) || contents.Any(c => c.Name.Equals("models", StringComparison.OrdinalIgnoreCase)))
          ontologies.Add(repo);
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, $"Error getting contents for {repo.Owner.Login}/{repo.Name}");
      }
    }

    public async Task<Dictionary<string, string>> GetOntologyModels(string repoName, string repoOwner)
    {
      var models = new Dictionary<string, string>();
      if (string.IsNullOrWhiteSpace(repoOwner))
        return models;

      try
      {

        _logger.LogInformation($"Loading DTDL for {repoOwner}/{repoName}");

        var archiveBytes = await _client.Repository.Content.GetArchive(repoOwner, repoName, ArchiveFormat.Zipball);
        var zip = new ZipArchive(new MemoryStream(archiveBytes));

        foreach (var file in zip.Entries)
        {
          if (file.Name.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
          {
            var key = $"{file.FullName}";
            _logger.LogInformation($"Adding {key}");
            var modelId = file.Name.Split("/")[0];
            using var stream = file.Open();
            var model = await new StreamReader(stream).ReadToEndAsync();
            if (!model.Contains("dtmi:")) continue;
            models.Add(key, model);
          }
        }

      }
      catch (Exception ex)
      {
        if (!ex.Message.Contains("Validation Failed"))
          _logger.LogError(ex, "Error getting ontology models");
      }
      return models;
    }

    private async Task<List<RepositoryContent>> GetRepositoryContents(string owner, string repo, string path = "")
    {

      var contents = new List<RepositoryContent>();

      try
      {
        var result = string.IsNullOrWhiteSpace(path) ? await _client.Repository.Content.GetAllContents(owner, repo) : await _client.Repository.Content.GetAllContents(owner, repo, path);

        contents.AddRange(result);

        foreach (var item in result)
        {
          if (item.Type == ContentType.Dir)
            contents.AddRange(await GetRepositoryContents(owner, repo, item.Path));
        }
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, $"Error getting contents for {owner}/{repo}");
      }

      return contents;


    }


  }
}