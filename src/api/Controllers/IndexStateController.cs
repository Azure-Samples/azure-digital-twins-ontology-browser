using adt_ontology_index.Models.Indexes;
using adt_ontology_index.Services;
using Microsoft.AspNetCore.Mvc;

namespace adt_ontology_index.Controllers
{
  [ApiController]
  [Route("[controller]")]
  
  public class IndexStateController : ControllerBase
  {
    private readonly ILogger<IndexStateController> _logger;
    private readonly IndexService _indexService;

    public IndexStateController(ILogger<IndexStateController> logger, IndexService indexService)
    {
      _logger = logger;
      _indexService = indexService;
    }

    [HttpGet("ReIndex")]
    [ProducesResponseType(200)]
    [Produces("application/json")]
    public Task ReIndex() => _indexService.ReIndex();

    [HttpGet]    
    [ProducesResponseType(200)]
    [Produces("application/json")]
    public IndexState IndexStatus() => _indexService.IndexStatus();
  }

}