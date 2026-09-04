using ServiceStack.DataAnnotations;
using Storm.Api.Databases.Models;

namespace TaskList.Api.Entities;

[Alias("tasks")]
public class TaskEntity : BaseGuidEntity
{
	public const int TITLE_MAX_LENGTH = 400;

	[Required]
	[StringLength(TITLE_MAX_LENGTH)]
	public required string Title { get; set; }

	public bool IsCompleted { get; set; }

	public DateTime? CompletedAt { get; set; }
}