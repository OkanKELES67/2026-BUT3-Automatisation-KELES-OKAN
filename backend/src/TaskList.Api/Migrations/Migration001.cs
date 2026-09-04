using System.Data;
using ServiceStack.OrmLite;
using Storm.Api.Databases.Migrations.Models;
using TaskList.Api.Entities;

namespace TaskList.Api.Migrations;

internal class Migration001() : BaseMigration(1)
{
	public override async Task Apply(IDbConnection db)
	{
		db.CreateTable<TaskEntity>();
		db.CreateIndex<TaskEntity>(x => x.EntityCreatedDate, "idx_tasks_entity_created_date", false);

		if (await db.CountAsync<TaskEntity>() == 0)
		{
			await db.InsertAllAsync(new List<TaskEntity>
			{
				new()
				{
					Title = "Cours 1",
					IsCompleted = true,
					CompletedAt = new DateTime(2026, 9, 7, 13, 0, 0, DateTimeKind.Utc),
				},
				new()
				{
					Title = "Cours 2",
				},
				new()
				{
					Title = "Cours 3",
				},
				new()
				{
					Title = "Cours 4",
				},
			});
		}
	}
}