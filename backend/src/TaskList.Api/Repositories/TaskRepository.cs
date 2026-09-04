using Storm.Api.Databases.Repositories;
using TaskList.Api.Entities;

namespace TaskList.Api.Repositories;

public class TaskRepository(IServiceProvider services) : BaseGuidRepository<TaskEntity>(services);