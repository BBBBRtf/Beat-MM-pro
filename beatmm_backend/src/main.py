import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.music import music_bp
from src.routes.admin import admin_bp
from src.routes.bot import bot_bp
from datetime import timedelta

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# 配置
app.config['SECRET_KEY'] = 'beatmm-pro-secret-key-2024'
app.config['JWT_SECRET_KEY'] = 'beatmm-jwt-secret-key-2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# 数据库配置
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化扩展
jwt = JWTManager(app)
CORS(app, origins="*")  # 允许所有来源的跨域请求

# 注册蓝图
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(music_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(bot_bp, url_prefix='/api/bot')

# 初始化数据库
db.init_app(app)
with app.app_context():
    db.create_all()
    # 初始化示例音乐数据
    from src.routes.music import init_sample_music
    init_sample_music()

# JWT错误处理
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return {'error': '访问令牌已过期'}, 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return {'error': '无效的访问令牌'}, 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return {'error': '需要访问令牌'}, 401

# 静态文件服务
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

# 健康检查端点
@app.route('/api/health')
def health_check():
    return {'status': 'healthy', 'message': 'BeatMM Pro API is running'}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

