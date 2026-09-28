from mcr.microsoft.com/dotnet/sdk:10.0 as build

workdir /app

copy . ./

RUN dotnet restore src/TaskList.Api/TaskList.Api.csproj

run dotnet publish src/TaskList.Api/TaskList.Api.csproj -c Release -o  out 

from  mcr.microsoft.com/dotnet/aspnet:10.0 as finale

copy --from=build /app/out ./out

run apt-get update 
run apt-get install -y curl

user $APP_UID


expose 8080

HEALTHCHECK --interval=5m --timeout=3s \
  CMD curl -f http://localhost|| exit 1

env ASPNETCORE_URLS=http://+:8080


entrypoint ["dotnet", "out/TaskList.Api.dll"]