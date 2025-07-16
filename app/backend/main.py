from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Load environment variables
load_dotenv()

# Import models and db from models package
from models import db
from models.user import User
# from models.profile import Profile, Skill, Experience, Education

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change this in production!

# Initialize extensions
CORS(app)
jwt = JWTManager(app)
limiter = Limiter(get_remote_address, app=app, default_limits=["100 per minute"])

db.init_app(app)
migrate = Migrate(app, db)

# Register blueprints
from api.auth import auth_bp
app.register_blueprint(auth_bp)

def setup_database():
    """Setup database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

# Create a function to initialize the app
def create_app():
    """Application factory function"""
    return app

if __name__ == '__main__':
    # Setup database tables
    setup_database()
    
    # Run the app
    app.run(debug=True) 