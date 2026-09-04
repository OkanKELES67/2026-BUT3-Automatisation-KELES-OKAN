using System.Net;
using System.Text.Json.Serialization;
using Storm.Api.CQRS;
using Storm.Api.CQRS.Extensions;
using Storm.Api.SourceGenerators.ActionMethods;
using TaskList.Api.Dtos;
using TaskList.Api.Entities;
using TaskList.Api.Repositories;

namespace TaskList.Api.Actions.Tasks;

/// <summary>Omitted fields are left unchanged.</summary>
public class UpdateTaskBody
{
	[JsonPropertyName("title")]
	public string? Title { get; init; }

	[JsonPropertyName("isCompleted")]
	public bool? IsCompleted { get; init; }
}

public class UpdateTaskParameter
{
	public required Guid Id { get; init; }

	public required UpdateTaskBody Body { get; init; }
}

[Summary("Update a task's title and/or completion state")]
[HttpError(HttpStatusCode.BadRequest, Description = "Title is empty or too long")]
[HttpError(HttpStatusCode.NotFound, Description = "No task with this identifier")]
public class UpdateTaskCommand(IServiceProvider services) : BaseAction<UpdateTaskParameter, TaskDto>(services)
{
	protected override async Task<TaskDto> Action(UpdateTaskParameter parameter)
	{
		TaskRepository repository = Resolve<TaskRepository>();
		TaskEntity entity = await repository
			.GetById(parameter.Id)
			.NotFoundIfNull(TaskErrors.TASK_NOT_FOUND, "Task not found.");

		if (parameter.Body.Title is not null)
		{
			entity.Title = TaskTitle.Normalize(parameter.Body.Title);
		}

		if (parameter.Body.IsCompleted is { } isCompleted && isCompleted != entity.IsCompleted)
		{
			entity.IsCompleted = isCompleted;
			entity.CompletedAt = isCompleted ? Resolve<TimeProvider>().GetUtcNow().UtcDateTime : null;
		}

		await repository.Update(entity);

		return TaskDto.FromEntity(entity);
	}
}