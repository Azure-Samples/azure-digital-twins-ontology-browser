using Azure;
using Azure.Search.Documents;

namespace adt_ontology_index.Services.Indexes.Cloud
{
  public class SearchClientProvider
  {
    private readonly AzureKeyCredential _credential;
    private readonly SearchEndpoint _endpoint;

    public SearchClientProvider(AzureKeyCredential credential, SearchEndpoint Endpoint)
    {
      _credential = credential;
      _endpoint = Endpoint;
    }

    public SearchClient Get(string indexName) => new SearchClient(_endpoint.Uri, indexName, _credential);

  }
}