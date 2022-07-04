using System.Text.Json;
using System.Text.Json.Serialization;

namespace adt_ontology_index.Models.DigitalTwins
{
  internal class LocalizedStringConverter : JsonConverter<LocalizedString>
  {
    public override bool CanConvert(Type typeToConvert)
    {
      return true;
    }

    public override LocalizedString Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
      if (reader.TokenType == JsonTokenType.String) return new LocalizedString { En = reader.GetString() };
      var obj = JsonSerializer.Deserialize<JsonElement>(ref reader, options);

      if(obj.ValueKind == JsonValueKind.Object)
      {
        var en = obj.GetProperty("en");
        if(en.ValueKind == JsonValueKind.String)
        {
          return new LocalizedString { En = en.GetString() };
        }
        else if(en.ValueKind == JsonValueKind.Array)
        {
          return new LocalizedString { En = string.Join(",",en.EnumerateArray().Select(s => s)) };
        }
      }

      return new LocalizedString { En = string.Empty };
    }

    public override void Write(Utf8JsonWriter writer, LocalizedString value, JsonSerializerOptions options)
    {
      try
      {
        writer.WriteStartObject();
        writer.WriteString("en", value?.En ?? "");
        writer.WriteEndObject();
        writer.Flush();
      }
      catch(Exception ex)
      {
        Console.WriteLine(ex.Message);
      }
    }
  }
}