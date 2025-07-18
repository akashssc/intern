from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from models import db
from werkzeug.security import check_password_hash
import re
import os
import time
from werkzeug.utils import secure_filename
from PIL import Image
from models.post import Post

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_user():
    user_id = get_jwt_identity()
    return User.query.get(user_id)

auth_bp = Blueprint('auth', __name__)
 
# Helper: sanitize input
sanitize = lambda s: re.sub(r'[^\w@.\-]', '', s) if isinstance(s, str) else s

@auth_bp.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = sanitize(data.get('username', '').strip())
    email = sanitize(data.get('email', '').strip())
    password = data.get('password', '')

    # Validate required fields
    if not username or not email or not password:
        return jsonify({'msg': 'All fields are required.'}), 400

    # Password complexity
    if not User.is_password_complex(password):
        return jsonify({'msg': 'Password does not meet complexity requirements.'}), 400

    # Uniqueness
    if User.query.filter_by(username=username).first():
        return jsonify({'msg': 'Username already exists.'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'Email already exists.'}), 400

    # Create user
    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'msg': 'User created successfully.'}), 201

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    identifier = sanitize(data.get('username', '') or data.get('email', ''))
    password = data.get('password', '')

    # Find user by username or email
    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
    if not user or not user.check_password(password):
        return jsonify({'msg': 'Invalid credentials.'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({'token': access_token, 'user': {'id': user.id, 'username': user.username, 'email': user.email}}), 200 

@auth_bp.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user = get_user()
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    profile = {k: getattr(user, k) for k in ['id', 'username', 'email', 'title', 'location', 'bio', 'skills', 'experience', 'education', 'phone', 'linkedin', 'github', 'twitter', 'avatar']}
    return jsonify(profile), 200

@auth_bp.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user = get_user()
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    data = request.get_json()
    try:
        for field in ['title', 'location', 'bio', 'skills', 'experience', 'education', 'phone', 'linkedin', 'github', 'twitter']:
            if field in data:
                setattr(user, field, data[field])
        db.session.commit()
    except ValueError as e:
        return jsonify({'msg': str(e)}), 400
    profile = {k: getattr(user, k) for k in ['id', 'username', 'email', 'title', 'location', 'bio', 'skills', 'experience', 'education', 'phone', 'linkedin', 'github', 'twitter', 'avatar']}
    return jsonify(profile), 200

@auth_bp.route('/api/profile/image', methods=['POST'])
@jwt_required()
def upload_profile_image():
    user = get_user()
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    if 'image' not in request.files:
        return jsonify({'msg': 'No file part'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400
    if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg'}):
        return jsonify({'msg': 'Invalid file type'}), 400
    filename = secure_filename(f"{user.id}_{int(time.time())}.{file.filename.rsplit('.', 1)[1].lower()}")
    # Save to the same uploads directory as main.py
    upload_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file.save(os.path.join(upload_folder, filename))
    user.avatar = filename
    db.session.commit()
    profile = {k: getattr(user, k) for k in ['id', 'username', 'email', 'title', 'location', 'bio', 'skills', 'experience', 'education', 'phone', 'linkedin', 'github', 'twitter', 'avatar']}
    print(f"[DEBUG] Uploaded avatar filename: {filename}")
    print(f"[DEBUG] Returned profile: {profile}")
    return jsonify({'url': f'/uploads/{filename}', 'profile': profile}), 200 

@auth_bp.route('/api/debug/all-data', methods=['GET'])
@jwt_required()
def debug_all_data():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    # For demo: only allow user with username 'admin' to access
    if not user or user.username != 'admin':
        return jsonify({'msg': 'Unauthorized'}), 403
    users = User.query.all()
    posts = Post.query.all()
    return jsonify({
        'users': [
            {
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'title': u.title,
                'location': u.location,
                'bio': u.bio,
                'skills': u.skills,
                'experience': u.experience,
                'education': u.education,
                'phone': u.phone,
                'linkedin': u.linkedin,
                'github': u.github,
                'twitter': u.twitter,
                'avatar': u.avatar
            } for u in users
        ],
        'posts': [
            {
                'id': p.id,
                'user_id': p.user_id,
                'title': p.title,
                'content': p.content,
                'media_url': p.media_url,
                'created_at': p.created_at,
                'updated_at': p.updated_at
            } for p in posts
        ]
    }), 200 