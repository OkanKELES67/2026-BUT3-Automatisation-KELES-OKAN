using System.Net;
using System.Text.Json.Serialization;
using Storm.Api.CQRS;
using Storm.Api.Databases;
using Storm.Api.SourceGenerators.ActionMethods;
using TaskList.Api.Dtos;
using TaskList.Api.Entities;
using TaskList.Api.Repositories;

namespace TaskList.Api.Actions.Tasks;

public class CreateTaskBody
{
	[JsonPropertyName("title")]
	public required string Title { get; init; }
}

public class CreateTaskParameter
{
	public required CreateTaskBody Body { get; init; }
}

[Summary("Create a task")]
[HttpError(HttpStatusCode.BadRequest, Description = "Title is missing or too long")]
public class CreateTaskCommand(IServiceProvider services) : BaseAction<CreateTaskParameter, TaskDto>(services)
{
	protected override async Task<TaskDto> Action(CreateTaskParameter parameter)
	{
		TaskEntity entity = await Resolve<TaskRepository>().Create(new TaskEntity
		{
			Title = TaskTitle.Normalize(parameter.Body.Title),
		});

		return TaskDto.FromEntity(entity);
	}
}