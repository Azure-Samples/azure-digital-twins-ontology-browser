using System.Text.Json;
using System.Text.Json.Serialization;
using adt_ontology_index.Models.DigitalTwins;
using Azure.Search.Documents.Indexes;

namespace adt_ontology_index.Model.DigitalTwins
{
  public class DigitalTwinModelPropertyContent : IDigitalTwinModelContent
  {
    [JsonPropertyName("@type")]
    public JsonElement Type { get; set; }

    [JsonPropertyName("name")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string Name { get; set; }

    [JsonPropertyName("displayName")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public LocalizedString DisplayName { get; set; } = new LocalizedString { En = "" };

    [JsonPropertyName("Unit")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string Unit { get; set; }

    [JsonPropertyName("description")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public LocalizedString Description { get; set; } = new LocalizedString { En = "" };

    [JsonPropertyName("comment")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public LocalizedString Comment { get; set; } = new LocalizedString { En = "" };

    [JsonPropertyName("schema")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public JsonElement Schema { get; set; }
  }
}