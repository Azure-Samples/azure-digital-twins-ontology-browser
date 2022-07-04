using System.Text.Json;
using System.Text.Json.Serialization;

namespace adt_ontology_index.Model.DigitalTwins
{
  public interface IDigitalTwinModelContent
  {
    public interface IDigitalTwinModelContent
    {
      [JsonPropertyName("@type")]

      public string Type { get; set; }

      [JsonPropertyName("name")]
      public string Name { get; set; }
      public string Description { get; set; }

      public JsonElement Schema { get; set; }
    }
  }
}