import os
from typing import Dict, Any

class FeatureFlag:
  DEMO_MODE = "DEMO_MODE"
  DATABASE_ENABLED = "DATABASE_ENABLED"


class FeatureFlagService:
  def __init__(self):
    self._flags: Dict[str, bool] = {}
    self._load_flags()

  def _load_flags(self):
    self._flags = {
      FeatureFlag.DEMO_MODE: os.getenv('FEATURE_DEMO_MODE', 'false').lower() == 'true',
      FeatureFlag.DATABASE_ENABLED: os.getenv('FEATURE_DATABASE_ENABLED', 'true').lower() == 'true'
    }

  def is_enabled(self, flag: str) -> bool:
    return self._flags.get(flag, False)

  @property
  def flags(self) -> Dict[str, bool]:
    return self._flags.copy()
  

class Config:
  DEBUG = False
  SQLALCHEMY_TRACK_MODIFICATIONS = False

  # Feature flags instance
  feature_service = FeatureFlagService()

  @property
  def SQLALCHEMY_DATABASE_URI(self) -> str:
    if self.feature_service.is_enabled(FeatureFlag.DATABASE_ENABLED):
      return os.getenv('DATABASE_URL', 'postgresql://liam.so:password@localhost:5432/fintrack')
    return ""
    
  @property
  def ROUTES_CONFIG(self) -> Dict[str, bool]:
    """Define which routes should be enabled based on feature flags"""
    is_demo = self.feature_service.is_enabled(FeatureFlag.DEMO_MODE)
    return {
        'enable_user_routes': not is_demo,
        'enable_transaction_routes': not is_demo,
        # always enable the following routes
        'enable_extraction_routes': True,
        'enable_trial_routes': True 
    }

class DevelopmentConfig(Config):
  DEBUG = True
  ENV = 'development'

class DemoConfig(Config):
  DEBUG = True
  ENV = 'demo'
  
  def __init__(self):
    os.environ['FEATURE_DEMO_MODE'] = 'true'
    os.environ['FEATURE_DATABASE_ENABLED'] = 'false'
    super().__init__()


config = {
    'dev': DevelopmentConfig,
    'demo': DemoConfig,
    'default': DevelopmentConfig
}

def get_config():
  env = os.getenv('FLASK_ENV', 'default')
  return config[env]()
    