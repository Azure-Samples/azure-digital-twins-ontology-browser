namespace adt_ontology_index.Models.Indexes
{
    public class IndexState
    {
        public IndexStatuses IndexStatus { get; set; }

        public string IndexName {get; internal set;} = "AllOntologies";

        public int ModelCount { get; set; }
        public int IndexedModelCount { get; set; }

        public List<IndexState> OntologyIndexes { get; set; } = new List<IndexState>();
    }
}