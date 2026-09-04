using Storm.Api.Databases.Migrations.Models;

namespace TaskList.Api.Migrations;

internal class AppMigrationModule() : BaseMigrationModule("TaskList")
{
	public override List<IMigration> Operations { get; } =
	[
		new Migration001(),
	];
}