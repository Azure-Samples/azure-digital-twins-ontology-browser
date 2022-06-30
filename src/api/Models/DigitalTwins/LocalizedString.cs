using System.Text.Json.Serialization;
using Azure.Search.Documents.Indexes;

namespace adt_ontology_index.Models.DigitalTwins
{
    [JsonConverter(typeof(LocalizedStringConverter))]
    public class LocalizedString
    {
        [JsonPropertyName("en")]
        [SearchableField(IsKey = false, IsFilterable = true, IsSortable = false)]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public string En {get;set;}
    }
}