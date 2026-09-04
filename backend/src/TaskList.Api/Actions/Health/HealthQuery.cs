using ServiceStack.OrmLite;
using Storm.Api.CQRS;
using Storm.Api.SourceGenerators.ActionMethods;

namespace TaskList.Api.Actions.Health;

public class HealthParameter;

public class HealthDto
{
	public required string Status { get; init; }
}

[Summary("Report whether the API can reach its database")]
public class HealthQuery(IServiceProvider services) : BaseAction<HealthParameter, HealthDto>(services)
{
	protected override async Task<HealthDto> Action(HealthParameter parameter)
	{
		await UseReadConnection(db => db.SqlScalarAsync<int>("SELECT 1"));

		return new HealthDto { Status = "Healthy" };
	}
}