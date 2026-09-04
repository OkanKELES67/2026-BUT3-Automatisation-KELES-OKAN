using System.Net;
using Storm.Api.CQRS.Exceptions;
using Storm.Api.CQRS.Extensions;
using Storm.Api.Extensions;
using TaskList.Api.Dtos;
using TaskList.Api.Entities;

namespace TaskList.Api.Actions.Tasks;

internal static class TaskTitle
{
	public static string Normalize(string title)
	{
		title = title.Trim().NullIfEmpty().BadRequestIfNull(TaskErrors.TITLE_REQUIRED, "Title is required.");
		if (title.Length > TaskEntity.TITLE_MAX_LENGTH)
		{
			throw new DomainHttpCodeException(HttpStatusCode.BadRequest,
				TaskErrors.TITLE_TOO_LONG,
				$"Title must be {TaskEntity.TITLE_MAX_LENGTH} characters or fewer.");
		}

		return title;
	}
}