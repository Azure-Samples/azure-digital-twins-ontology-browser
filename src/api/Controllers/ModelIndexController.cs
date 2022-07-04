using System.Text.Json;
using System.Text.Json.Nodes;
using adt_ontology_index.Models.DigitalTwins.Search;
using adt_ontology_index.Models.Ontologies;
using adt_ontology_index.Models.Responses;
using adt_ontology_index.Services;
using Microsoft.AspNetCore.Mvc;

namespace adt_ontology_index.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class ModelIndexController : ControllerBase
  {
    private readonly ILogger<ModelIndexController> _logger;
    private readonly IndexService _indexService;
    public ModelIndexController(ILogger<ModelIndexController> logger, IndexService indexService)
    {
      _logger = logger;
      _indexService = indexService;
      _logger = logger;
    }

    [HttpGet]    
    [ProducesResponseType(200)]
    [Produces("application/json")]
    public SuggestModelsResponse Search([FromQuery] string fieldNames, [FromQuery] bool includeModelDefinitions = false, [FromQuery] bool useCache = true) => _indexService.SuggestModelsForField(fieldNames, includeModelDefinitions, useCache);

    [HttpPost]    
    [ProducesResponseType(200)]
    [Produces("application/json")]
    public SuggestModelsResponse Search([FromBody] JsonObject message, [FromQuery] bool includeModelDefinitions = false, [FromQuery] bool useCache = true, [FromQuery] bool includeValues = false) => _indexService.SuggestModelsForObject(message, includeModelDefinitions, useCache, includeValues);


    [HttpGet("Dtdl")]    
    [ProducesResponseType(200)]
    [Produces("application/json")]
    public JsonDocument Dtdl([FromQuery] string ontology,[FromQuery]string id)  => _indexService.GetModelDtdl(ontology, id);

    [HttpGet("OntologyDetails")]    
    [ProducesResponseType(200)]
    [Produces("application/json")]
    public async Task<OntologyDetails> OntologyDetails([FromQuery] string ontology)  => await _indexService.GetOntologyDetails(ontology);

    [HttpGet("OntologyModels")]    
    [ProducesResponseType(200)]
    [Produces("application/json")]
    public List<SearchableDigitalTwinModel> OntologyModels([FromQuery] string ontology)  => _indexService.GetOntologyModels(ontology);


  }
}