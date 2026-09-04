using System.Text.Json.Serialization;
using TaskList.Api.Entities;

namespace TaskList.Api.Dtos;

public class TaskDto
{
	[JsonPropertyName("id")]
	public required Guid Id { get; init; }

	[JsonPropertyName("title")]
	public required string Title { get; init; }

	[JsonPropertyName("isCompleted")]
	public required bool IsCompleted { get; init; }

	[JsonPropertyName("createdAt")]
	public required DateTime CreatedAt { get; init; }

	[JsonPropertyName("completedAt")]
	public DateTime? CompletedAt { get; init; }

	public static TaskDto FromEntity(TaskEntity entity)
	{
		return new()
		{
			Id = entity.Id,
			Title = entity.Title,
			IsCompleted = entity.IsCompleted,
			CreatedAt = AsUtc(entity.EntityCreatedDate),
			CompletedAt = entity.CompletedAt is { } completedAt ? AsUtc(completedAt) : null,
		};
	}

	private static DateTime AsUtc(DateTime value)
	{
		if (value.Kind is DateTimeKind.Unspecified)
		{
			return DateTime.SpecifyKind(value, DateTimeKind.Utc);
		}
		return value;
	}
}