using System.Reflection;
using System.Text.Json.Serialization;
using adt_ontology_index;
using adt_ontology_index.Adapters;
using adt_ontology_index.Services;
using adt_ontology_index.Services.Cache;
using adt_ontology_index.Services.Indexes;
using adt_ontology_index.Services.Indexes.Cloud;
using Azure;
using Azure.Search.Documents.Indexes;
using Microsoft.OpenApi.Models;
using Octokit;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

builder.Services.AddLogging();
builder.Services.AddTransient<AzureKeyCredential>(s => new AzureKeyCredential(builder.Configuration.GetValue<string>("SearchToken")));
builder.Services.AddTransient<SearchEndpoint>(s => new SearchEndpoint(builder.Configuration.GetValue<string>("SearchEndpoint")));
builder.Services.AddTransient<SearchIndexClient>(s => new SearchIndexClient(s.GetRequiredService<SearchEndpoint>().Uri, s.GetRequiredService<AzureKeyCredential>()));
builder.Services.AddTransient<SearchClientProvider>();
builder.Services.AddTransient<ModelIndexerProvider>();
builder.Services.AddTransient<Credentials>(s =>
{
  var token = builder.Configuration.GetValue<string>("GitHubToken");
  return new Credentials(token);
});
builder.Services.AddTransient<GitHubClient>((s) => new GitHubClient(new ProductHeaderValue(Assembly.GetEntryAssembly().GetName().Name)) { Credentials = s.GetRequiredService<Credentials>() });
builder.Services.AddSingleton<GitHubAdapter>();
builder.Services.AddSingleton<FieldSuggestionCache>();
builder.Services.AddSingleton<OntologyAdapter>();
builder.Services.AddSingleton<OntologyIndexer>();
builder.Services.AddSingleton<IndexService>();

builder.Services.AddControllers().AddJsonOptions(x =>
{
  x.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen((o) =>
{
  o.UseInlineDefinitionsForEnums();
  o.SwaggerDoc("v1", new OpenApiInfo { Title = "Azure Digital Twins Ontology Index", Version = "v1", Description = "This API provides access to the ontology index." });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI((o) =>
{
  o.DocumentTitle = "Azure Digital Twins Ontology Index";
});

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

await Task.WhenAll(app.Services.GetService<IndexService>().Index(), app.RunAsync());
