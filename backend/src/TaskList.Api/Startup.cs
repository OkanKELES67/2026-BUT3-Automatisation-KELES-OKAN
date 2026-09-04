using Storm.Api.Databases.Repositories;
using Storm.Api.Launchers;
using TaskList.Api.Entities;
using TaskList.Api.Migrations;
using TaskList.Api.Repositories;

namespace TaskList.Api;

public class Startup : BaseStartup
{
	public Startup(IConfiguration configuration, IWebHostEnvironment environment)
		: base(configuration, environment)
	{
		UseMigrationModules(new AppMigrationModule());

		WaitForMigrationsBeforeStarting = true;
	}

	public override void ConfigureServices(IServiceCollection services)
	{
		base.ConfigureServices(services);

		RegisterConsoleLogger(services, LogLevel.Information);

		services.AddRepository<TaskEntity, TaskRepository>();
	}
}