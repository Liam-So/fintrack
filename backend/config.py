class Config:
    DEBUG = False
    # Add other configuration variables as needed

class DevelopmentConfig(Config):
    DEBUG = True
    SQL_ALCHEMY_DATABASE_URI = 'postgresql://username:password@localhost:5432/fintrack'

config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig,
    # Add production config eventually...
}