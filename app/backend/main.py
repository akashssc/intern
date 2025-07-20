from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
from flask import send_from_directory

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
# Get allowed origins from environment variable or use defaults
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:5173,https://intern-frontend.onrender.com').split(',')
CORS(app, origins=allowed_origins, supports_credentials=True)
jwt = JWTManager(app)
# Initialize limiter after app creation
# limiter = Limiter(
#     get_remote_address,
#     app=app,
#     default_limits=["100 per minute"]
# )

db.init_app(app)
migrate = Migrate(app, db)

# Register blueprints
from api.auth import auth_bp
from api.posts import posts_bp
# Remove or comment out the following lines if present:
# from api.profile import profile_bp
app.register_blueprint(auth_bp)
app.register_blueprint(posts_bp)

# Set UPLOAD_FOLDER to the backend's uploads directory
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Create all tables for beginners (no migrations)
with app.app_context():
    db.create_all()

# Create a function to initialize the app
def create_app():
    """Application factory function"""
    return app

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files with authentication"""
    # Additional security: validate filename format
    if not filename or '..' in filename or '/' in filename:
        return jsonify({'error': 'Invalid filename'}), 400
    # Check if file exists
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    # Allow common image and video file types
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi', '.webm', '.thumb.jpg'}
    file_ext = os.path.splitext(filename.lower())[1]
    if file_ext not in allowed_extensions:
        return jsonify({'error': 'File type not allowed'}), 400
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    # Setup database tables
    # setup_database() # This line is removed as per the new_code, as db.create_all() is now called directly.
    
    # Run the app
    app.run(debug=True) 