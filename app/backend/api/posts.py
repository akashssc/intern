from flask import Blueprint, request, jsonify, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.post import Post
from models.user import User
import os
import time
from werkzeug.utils import secure_filename

posts_bp = Blueprint('posts', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'webm'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_media_url(filename):
    if not filename:
        return None
    return url_for('static', filename=f'../uploads/{filename}', _external=True).replace('/static/../', '/uploads/')

@posts_bp.route('/api/posts', methods=['POST'])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    title = request.form.get('title', '').strip()
    content = request.form.get('content', '').strip()
    if not title or not content:
        return jsonify({'msg': 'Title and content are required.'}), 400

    media_url = None
    if 'media' in request.files:
        file = request.files['media']
        if file and allowed_file(file.filename):
            file.seek(0, os.SEEK_END)
            file_length = file.tell()
            file.seek(0)
            if file_length > MAX_FILE_SIZE:
                return jsonify({'msg': 'File too large (max 10MB).'}), 400
            filename = secure_filename(f"{user.id}_{int(time.time())}_" + file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            media_url = filename
        elif file.filename:
            return jsonify({'msg': 'Invalid media file type.'}), 400

    post = Post(user_id=user.id, title=title, content=content, media_url=media_url)
    db.session.add(post)
    db.session.commit()

    return jsonify({
        'id': post.id,
        'user_id': post.user_id,
        'title': post.title,
        'content': post.content,
        'media_url': get_media_url(post.media_url),
        'created_at': post.created_at,
        'updated_at': post.updated_at
    }), 201

@posts_bp.route('/api/posts', methods=['GET'])
@jwt_required()
def get_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    result = []
    for post in posts:
        result.append({
            'id': post.id,
            'user_id': post.user_id,
            'username': post.user.username if post.user else None,
            'title': post.title,
            'content': post.content,
            'media_url': get_media_url(post.media_url),
            'created_at': post.created_at,
            'updated_at': post.updated_at
        })
    return jsonify(result), 200

@posts_bp.route('/api/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    user_id = get_jwt_identity()
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'msg': 'Post not found'}), 404
    if post.user_id != int(user_id):
        return jsonify({'msg': 'Unauthorized'}), 403
    # Optionally delete media file
    if post.media_url:
        media_path = os.path.join(UPLOAD_FOLDER, post.media_url)
        if os.path.exists(media_path):
            os.remove(media_path)
    db.session.delete(post)
    db.session.commit()
    return jsonify({'msg': 'Post deleted'}), 200 