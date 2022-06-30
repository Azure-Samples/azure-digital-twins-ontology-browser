using adt_ontology_index.Models.Indexes;
using adt_ontology_index.Models.Ontologies;
using adt_ontology_index.Services.Indexes.Cloud;
using adt_ontology_index.Services.Indexes.Face;
using Azure.Search.Documents.Indexes;

namespace adt_ontology_index.Services.Indexes
{
  public class ModelIndexerProvider
  {
    private readonly ILogger<ModelIndexerProvider> _logger;
    private readonly IServiceProvider _serviceProvider;

    public ModelIndexerProvider(ILogger<ModelIndexerProvider> logger, IServiceProvider serviceProvider)
    {
      _logger = logger;
      _serviceProvider = serviceProvider;
    }

    public IModelIndexer NewModelIndexer(Ontology ontology, IndexState state = null)
    {
      return CreateCloudModelIndexer(_logger, ontology, state);
    }

    private IModelIndexer CreateCloudModelIndexer(ILogger<ModelIndexerProvider> logger, Ontology ontology, IndexState state)
    {
      var logFactory = _serviceProvider.GetService<ILoggerFactory>();
      var searchClientProvider = _serviceProvider.GetService<SearchClientProvider>();
      var indexClient = _serviceProvider.GetService<SearchIndexClient>();
      var clientName = ontology.Owner + "-" + ontology.Name;
      return new CloudModelIndexer(logFactory.CreateLogger<CloudModelIndexer>(), ontology, searchClientProvider.Get(clientName.ToLower()), indexClient, state);
    }

  }
}