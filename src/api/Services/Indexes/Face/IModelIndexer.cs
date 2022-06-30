using adt_ontology_index.Models.DigitalTwins.Search;
using adt_ontology_index.Models.Indexes;
using adt_ontology_index.Models.Responses;

namespace adt_ontology_index.Services.Indexes.Face
{
    public interface IModelIndexer
    {
         int IndexedDocs();

         int IndexModels(string[] jsonDefinitions);

         void IndexModel(string json);

         string GetModel(string id);

         string GetDtmi(string id);

         List<ModelScoreDoc> Search(params string[] terms);

         SuggestedOntology GetSuggestedOntology();
        List<SearchableDigitalTwinModel> GetAllModels();
  }
}