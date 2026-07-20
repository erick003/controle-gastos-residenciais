using GastosResidenciais.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Configura o banco de dados SQLite para persistência local dos cadastros.
// O arquivo gastos.db permanece no disco e é reutilizado após fechar a aplicação.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=gastos.db"));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Configuração de CORS para permitir requisições do frontend em desenvolvimento
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:7123", "http://127.0.0.1:7123", "http://localhost:5173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configuração do Swagger/OpenAPI para testar a API depois
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configura o pipeline de requisições HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();
app.UseCors("FrontendPolicy");

app.UseAuthorization();

app.MapControllers();


// --- CRIAR O BANCO AUTOMATICAMENTE ---
// Garante que as tabelas existam na primeira execução sem exigir migrations manuais.
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
    }
    catch (Exception)
    {
    }
}
// -------------------------------------------------------------

app.Run();

