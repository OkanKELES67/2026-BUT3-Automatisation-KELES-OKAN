using Microsoft.AspNetCore.Mvc;
using Storm.Api.Controllers;
using Storm.Api.Dtos;
using Storm.Api.SourceGenerators.ActionMethods;
using TaskList.Api.Actions.Tasks;
using TaskList.Api.Dtos;

namespace TaskList.Api.Controllers;

[ApiController]
public partial class TasksController(IServiceProvider services) : BaseController(services)
{
	[HttpGet("api/v1/tasks")]
	[WithAction<ListTasksQuery>]
	[Tags("Tasks")]
	public partial Task<ActionResult<Response<List<TaskDto>>>> ListTasks();

	[HttpPost("api/v1/tasks")]
	[WithAction<CreateTaskCommand>]
	[Tags("Tasks")]
	public partial Task<ActionResult<Response<TaskDto>>> CreateTask([FromBody] CreateTaskBody body);

	[HttpPut("api/v1/tasks/{id:guid}")]
	[WithAction<UpdateTaskCommand>]
	[Tags("Tasks")]
	public partial Task<ActionResult<Response<TaskDto>>> UpdateTask(
		[FromRoute] Guid id,
		[FromBody] UpdateTaskBody body);

	[HttpDelete("api/v1/tasks/{id:guid}")]
	[WithAction<DeleteTaskCommand>]
	[Tags("Tasks")]
	public partial Task<ActionResult<Response>> DeleteTask([FromRoute] Guid id);
}