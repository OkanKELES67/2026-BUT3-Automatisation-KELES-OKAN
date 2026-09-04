using ServiceStack.OrmLite;
using Storm.Api.CQRS;
using Storm.Api.Databases.Extensions;
using Storm.Api.Extensions;
using Storm.Api.SourceGenerators.ActionMethods;
using TaskList.Api.Dtos;
using TaskList.Api.Entities;

namespace TaskList.Api.Actions.Tasks;

public class ListTasksParameter;

[Summary("List all tasks, newest first")]
public class ListTasksQuery(IServiceProvider services)
	: BaseAction<ListTasksParameter, List<TaskDto>>(services)
{
	protected override Task<List<TaskDto>> Action(ListTasksParameter parameter)
	{
		return UseReadConnection(db =>
			{
				return db.From<TaskEntity>()
					.OrderByDescending(x => x.EntityCreatedDate)
					.ThenByDescending(x => x.Id)
					.AsSelectAsync(db);
			})
			.ConvertAll(TaskDto.FromEntity);
	}
}