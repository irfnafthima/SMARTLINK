import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "smartlink-production-secret-key-2024")
    
    # Database Configuration
    DB_USER = os.getenv("MYSQL_USER", "smartlink_user")
    DB_PASSWORD = os.getenv("MYSQL_PASSWORD", "smartlink_pass")
    DB_HOST = os.getenv("DB_HOST", "db")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("MYSQL_DATABASE", "smartlink_db")
    
    # Base URL for shortened links
    BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")
    
    # Default to MySQL, fallback to SQLite if DB_HOST is localhost and MySQL isn't reachable or explicitly set
    if os.getenv("DATABASE_URL"):
        SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    elif os.getenv("USE_SQLITE", "false").lower() in ("true", "1", "yes"):
        SQLALCHEMY_DATABASE_URI = "sqlite:///smartlink.db"
    else:
        SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
    }


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_ENGINE_OPTIONS = {}


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}
