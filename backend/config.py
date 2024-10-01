class Config:
    DEBUG = False
    # Add other configuration variables as needed

class DevelopmentConfig(Config):
    DEBUG = True

config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig,
    # Add production config eventually...
}