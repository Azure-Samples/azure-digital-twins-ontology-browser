using System.Text.Json.Serialization;
using Azure.Search.Documents.Indexes;

namespace adt_ontology_index.Models.DigitalTwins.Search
{
  public class SearchableDigitalTwinContent
  {

    [JsonPropertyName("name")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    [SearchableField(IsKey = false, IsFilterable = true, IsSortable = false)]
    public string Name { get; set; }

    [JsonPropertyName("displayName")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    [SearchableField(IsKey = false, IsFilterable = true, IsSortable = false)]
    public string DisplayName { get; set; }

    [JsonPropertyName("description")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    [SearchableField(IsKey = false, IsFilterable = true, IsSortable = false)]
    public string Description { get; set; }

    [JsonPropertyName("comment")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    [SearchableField(IsKey = false, IsFilterable = true, IsSortable = false)]
    public string Comment { get; set; }

    [JsonPropertyName("units")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    [SearchableField(IsKey = false, IsFilterable = true, IsSortable = false)]
    public string Units { get; set; }

    [JsonPropertyName("extends")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    [SearchableField(IsKey = false, IsFilterable = true, IsSortable = false)]
    public string Extends { get; set; }
  }
}