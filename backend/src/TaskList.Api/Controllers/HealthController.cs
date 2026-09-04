using Microsoft.AspNetCore.Mvc;
using Storm.Api.Controllers;
using Storm.Api.Dtos;
using Storm.Api.SourceGenerators.ActionMethods;
using TaskList.Api.Actions.Health;

namespace TaskList.Api.Controllers;

[ApiController]
public partial class HealthController(IServiceProvider services) : BaseController(services)
{
	[HttpGet("api/v1/health")]
	[WithAction<HealthQuery>]
	[Tags("Health")]
	public partial Task<ActionResult<Response<HealthDto>>> GetHealth();
}