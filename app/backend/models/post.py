from models import db
from datetime import datetime
from sqlalchemy.dialects.mysql import VARCHAR

class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    media_url = db.Column(db.String(255), nullable=True)
    category = db.Column(db.String(64), index=True, nullable=True)
    visibility = db.Column(db.String(16), index=True, nullable=True)  # e.g., 'Public', 'Private'
    tags = db.Column(db.String(255), nullable=True)  # Comma-separated tags
    likes_count = db.Column(db.Integer, default=0, index=True)
    views_count = db.Column(db.Integer, default=0, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('posts', lazy=True))

# Add index with key length for MySQL
from sqlalchemy.schema import Index
Index('ix_posts_content', Post.content, mysql_length=255)
