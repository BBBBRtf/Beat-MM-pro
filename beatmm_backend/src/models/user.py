from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from enum import Enum

db = SQLAlchemy()

class UserRole(Enum):
    USER = 'user'
    ADMIN = 'admin'
    SUPER_ADMIN = 'super_admin'

class NotificationType(Enum):
    INFO = 'info'
    WARNING = 'warning'
    SUCCESS = 'success'
    ERROR = 'error'

class TransactionType(Enum):
    DEPOSIT = 'deposit'
    WITHDRAW = 'withdraw'
    REWARD = 'reward'
    PURCHASE = 'purchase'
    ADMIN_ADJUST = 'admin_adjust'

class TransactionStatus(Enum):
    PENDING = 'pending'
    COMPLETED = 'completed'
    FAILED = 'failed'
    CANCELLED = 'cancelled'

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    role = db.Column(db.Enum(UserRole), default=UserRole.USER, nullable=False)
    wallet_balance = db.Column(db.Numeric(10, 2), default=0.00)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    login_count = db.Column(db.Integer, default=0)
    
    # 关系
    play_history = db.relationship('PlayHistory', backref='user', lazy=True)
    favorites = db.relationship('UserFavorite', backref='user', lazy=True)
    wallet_transactions = db.relationship('WalletTransaction', foreign_keys='WalletTransaction.user_id', backref='user', lazy=True)
    created_notifications = db.relationship('Notification', foreign_keys='Notification.created_by', backref='creator', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def is_super_admin(self):
        return self.role == UserRole.SUPER_ADMIN
    
    def is_admin(self):
        return self.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]
    
    def to_dict(self):
        return {
            'id': self.id,
            'phone': self.phone,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'avatar_url': self.avatar_url,
            'role': self.role.value,
            'wallet_balance': float(self.wallet_balance),
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'login_count': self.login_count
        }

class Music(db.Model):
    __tablename__ = 'music'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    artist = db.Column(db.String(200), nullable=False)
    album = db.Column(db.String(200), nullable=True)
    duration = db.Column(db.Integer, nullable=True)  # 秒数
    file_url = db.Column(db.String(500), nullable=True)
    cover_url = db.Column(db.String(500), nullable=True)
    genre = db.Column(db.String(100), nullable=True)
    play_count = db.Column(db.Integer, default=0)
    like_count = db.Column(db.Integer, default=0)
    upload_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    play_history = db.relationship('PlayHistory', backref='music', lazy=True)
    favorites = db.relationship('UserFavorite', backref='music', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'artist': self.artist,
            'album': self.album,
            'duration': self.duration,
            'file_url': self.file_url,
            'cover_url': self.cover_url,
            'genre': self.genre,
            'play_count': self.play_count,
            'like_count': self.like_count,
            'is_featured': self.is_featured,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class PlayHistory(db.Model):
    __tablename__ = 'play_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    music_id = db.Column(db.Integer, db.ForeignKey('music.id'), nullable=False)
    played_at = db.Column(db.DateTime, default=datetime.utcnow)
    play_duration = db.Column(db.Integer, nullable=True)  # 实际播放时长(秒)

class UserFavorite(db.Model):
    __tablename__ = 'user_favorites'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    music_id = db.Column(db.Integer, db.ForeignKey('music.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'music_id'),)

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    type = db.Column(db.Enum(NotificationType), default=NotificationType.INFO)
    target_role = db.Column(db.String(20), default='all')  # 'all', 'user', 'admin', 'super_admin'
    target_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_global = db.Column(db.Boolean, default=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'type': self.type.value,
            'target_role': self.target_role,
            'is_global': self.is_global,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_active': self.is_active
        }

class UserNotificationStatus(db.Model):
    __tablename__ = 'user_notification_status'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    notification_id = db.Column(db.Integer, db.ForeignKey('notifications.id'), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime, nullable=True)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'notification_id'),)

class WalletTransaction(db.Model):
    __tablename__ = 'wallet_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    transaction_type = db.Column(db.Enum(TransactionType), nullable=False)
    description = db.Column(db.Text, nullable=True)
    reference_id = db.Column(db.String(100), nullable=True)
    processed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    status = db.Column(db.Enum(TransactionStatus), default=TransactionStatus.PENDING)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'amount': float(self.amount),
            'transaction_type': self.transaction_type.value,
            'description': self.description,
            'status': self.status.value,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None
        }

class SystemLog(db.Model):
    __tablename__ = 'system_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    resource = db.Column(db.String(100), nullable=True)
    resource_id = db.Column(db.Integer, nullable=True)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class BotTask(db.Model):
    __tablename__ = 'bot_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    task_type = db.Column(db.String(50), nullable=False)  # 'accounting', 'maintenance', 'data_cleanup', 'report_generation'
    task_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    schedule_type = db.Column(db.String(20), default='once')  # 'once', 'daily', 'weekly', 'monthly'
    schedule_time = db.Column(db.Time, nullable=True)
    last_run = db.Column(db.DateTime, nullable=True)
    next_run = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='active')  # 'active', 'paused', 'completed', 'failed'
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    execution_logs = db.relationship('BotExecutionLog', backref='task', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'task_type': self.task_type,
            'task_name': self.task_name,
            'description': self.description,
            'schedule_type': self.schedule_type,
            'status': self.status,
            'last_run': self.last_run.isoformat() if self.last_run else None,
            'next_run': self.next_run.isoformat() if self.next_run else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class BotExecutionLog(db.Model):
    __tablename__ = 'bot_execution_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('bot_tasks.id'), nullable=False)
    execution_time = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), nullable=False)  # 'success', 'failed', 'partial'
    result_summary = db.Column(db.Text, nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    execution_duration = db.Column(db.Integer, nullable=True)  # 执行时长(秒)
    
    def to_dict(self):
        return {
            'id': self.id,
            'execution_time': self.execution_time.isoformat() if self.execution_time else None,
            'status': self.status,
            'result_summary': self.result_summary,
            'error_message': self.error_message,
            'execution_duration': self.execution_duration
        }

