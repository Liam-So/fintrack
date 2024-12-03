from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import get_config

db = SQLAlchemy()

def create_app(config_class=None):
  app = Flask(__name__)

  # load config
  if config_class is None:
    config_class = get_config()
  
  app.config.from_object(config_class)

  if app.config.get('SQLALCHEMY_DATABASE_URI'):
    db.init_app(app)
    Migrate(app, db)

  CORS(app)

  routes_config = app.config.get('ROUTES_CONFIG', {})
  print(routes_config)
    
  if routes_config.get('enable_trial_routes'):
    from app.api.routes import trial_routes
    app.register_blueprint(trial_routes.trial_bp, url_prefix='/api/trial')
  
  if routes_config.get('enable_user_routes'):
    from app.api.routes import user_routes
    app.register_blueprint(user_routes.user_bp, url_prefix='/api/user')
  
  if routes_config.get('enable_transaction_routes'):
    from app.api.routes import transaction_routes
    app.register_blueprint(transaction_routes.transaction_bp, url_prefix='/api/transactions')
  
  if routes_config.get('enable_extraction_routes'):
    from app.api.routes import extraction_routes
    app.register_blueprint(extraction_routes.extraction_bp, url_prefix='/api/extraction')

  return app