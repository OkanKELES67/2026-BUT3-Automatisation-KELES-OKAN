using System.Net;
using Storm.Api;
using Storm.Api.CQRS;
using Storm.Api.CQRS.Extensions;
using Storm.Api.SourceGenerators.ActionMethods;
using TaskList.Api.Dtos;
using TaskList.Api.Repositories;

namespace TaskList.Api.Actions.Tasks;

public class DeleteTaskParameter
{
	public required Guid Id { get; init; }
}

[Summary("Delete a task")]
[HttpError(HttpStatusCode.NotFound, Description = "No task with this identifier")]
public class DeleteTaskCommand(IServiceProvider services) : BaseAction<DeleteTaskParameter, Unit>(services)
{
	protected override async Task<Unit> Action(DeleteTaskParameter parameter)
	{
		await Resolve<TaskRepository>()
			.Delete(parameter.Id)
			.NotFoundIfFalse(TaskErrors.TASK_NOT_FOUND, "Task not found.");

		return Unit.Default;
	}
}