namespace api.Adapters
{
    public class WellKnown
    {
        public string Ontologies {get;set;}

        public List<string> GetOntologies() => Ontologies.Split(",").ToList();

    }
}