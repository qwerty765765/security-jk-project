from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, passes, incidents

# Создание таблиц в БД
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Security JK API", version="1.0.0")

# Настройка CORS - максимально открытая для тестирования
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем все источники
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы
    allow_headers=["*"],  # Разрешаем все заголовки
)

# Подключение роутов
app.include_router(auth.router)
app.include_router(passes.router)
app.include_router(incidents.router)

@app.get("/")
def root():
    return {"message": "Security JK API is running", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Добавляем явную обработку OPTIONS запросов
@app.options("/{path:path}")
async def options_handler():
    return {}
