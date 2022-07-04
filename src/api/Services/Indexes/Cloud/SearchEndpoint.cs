namespace adt_ontology_index.Services.Indexes.Cloud
{
    public class SearchEndpoint
    {
        public Uri Uri {get;}

        public SearchEndpoint(string url){
            Uri = new Uri(url);
        }
    }
}