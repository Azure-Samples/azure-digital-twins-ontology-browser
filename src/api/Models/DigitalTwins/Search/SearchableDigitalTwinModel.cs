using System.Text.Json;
using System.Text.Json.Serialization;
using adt_ontology_index.Model.DigitalTwins;
using Azure.Search.Documents.Indexes;

namespace adt_ontology_index.Models.DigitalTwins.Search
{
  public class SearchableDigitalTwinModel
  {
    [JsonPropertyName("dtKey")]
    [SearchableField(IsKey = true, IsFilterable = true, IsSortable = true)]
    public string dtKey { get; set; }

    [JsonPropertyName("dtId")]
    [SearchableField(IsKey = false, IsFilterable = true, IsSortable = true)]
    public string DtId { get; set; }

    [JsonPropertyName("displayName")]
    [SearchableField(IsKey = false, IsFilterable = true, IsSortable = false)]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string DisplayName { get; set; }

    [JsonPropertyName("comment")]
    [SearchableField(IsKey = false, IsFilterable = true, IsSortable = false)]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string Comment { get; set; }

    [JsonPropertyName("description")]
    [SearchableField(IsKey = false, IsFilterable = true, IsSortable = false)]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string Description { get; set; }

    [JsonPropertyName("extends")]
    [SearchableField(IsKey = false, IsFilterable = true, IsSortable = false)]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string Extends { get; set; }

    [JsonPropertyName("contents")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public List<SearchableDigitalTwinContent> Contents { get; set; } = new List<SearchableDigitalTwinContent>();

    [JsonPropertyName("Dtdl")]
    [SearchableField(IsKey = false, IsFilterable = true, IsSortable = false)]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string Dtdl { get; set; }

    public static SearchableDigitalTwinModel FromModel(string json)
    {
      var model = JsonSerializer.Deserialize<DigitalTwinModel>(json);
      var searchable = new SearchableDigitalTwinModel
      {
        dtKey = model?.dtId?.Replace(":", "-").Replace(";", "_") ?? Guid.NewGuid().ToString(),
        DtId = model.Id,
        DisplayName = model.DisplayName?.En,
        Description = model.Description?.En,
        Contents = model.Contents.Select(c => new SearchableDigitalTwinContent
        {
          Name = c.Name,
          DisplayName = c.DisplayName?.En,
          Description = c.Description?.En,
          Comment = c.Comment?.En,
          Units = c.Unit
        }).ToList(),
        Dtdl = json
      };

      if(model.Extends.ValueKind == JsonValueKind.Null || model.Extends.ValueKind == JsonValueKind.Undefined)
        return searchable;

      searchable.Extends = JsonSerializer.Serialize(model.Extends);
      return searchable;
    }
  }
}