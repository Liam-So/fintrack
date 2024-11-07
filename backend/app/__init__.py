import os

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://liam.so:password@localhost:5432/fintrack')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    Migrate(app, db)

    CORS(app)

    from app.api.routes import user_routes, transaction_routes, extraction_routes, trial_routes

    app.register_blueprint(user_routes.user_bp, url_prefix='/api/user')
    app.register_blueprint(transaction_routes.transaction_bp, url_prefix='/api/transactions')
    app.register_blueprint(extraction_routes.extraction_bp, url_prefix='/api/extraction')
    app.register_blueprint(trial_routes.trial_bp, url_prefix='/api/trial')

    return app