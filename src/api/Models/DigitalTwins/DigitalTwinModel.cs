using System.Text.Json;
using System.Text.Json.Serialization;
using adt_ontology_index.Models.DigitalTwins;
using Azure.Search.Documents.Indexes;

namespace adt_ontology_index.Model.DigitalTwins
{
     public class DigitalTwinModel
    {
        [JsonPropertyName("@id")]      
        [FieldBuilderIgnore]
        public string dtId { get; set; }

        [JsonPropertyName("id")]
        [SearchableField(IsKey = true, IsFilterable = true, IsSortable = true)]
        public string Id => dtId;
        
        [JsonPropertyName("@type")]
        public string Type { get; set; } = "Interface";
        
        [JsonPropertyName("displayName")]     
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public LocalizedString DisplayName {get;set;}

        [JsonPropertyName("description")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public LocalizedString Description {get;set;}

        [JsonPropertyName("contents")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public List<DigitalTwinModelPropertyContent> Contents {get;set;}= new List<DigitalTwinModelPropertyContent>();

        [JsonPropertyName("@extends")]     
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public JsonElement Extends {get;set;}
        
    }
}