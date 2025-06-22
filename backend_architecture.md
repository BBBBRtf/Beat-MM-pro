# BeatMM Pro 后端架构设计

## 技术栈
- **后端框架**: Flask (Python)
- **数据库**: SQLite (开发阶段) / PostgreSQL (生产环境)
- **认证**: JWT (JSON Web Tokens)
- **API**: RESTful API
- **CORS**: 支持跨域请求

## 数据库模型设计

### 1. 用户表 (users)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    avatar_url VARCHAR(255),
    role ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0
);
```

### 2. 音乐表 (music)
```sql
CREATE TABLE music (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    artist VARCHAR(200) NOT NULL,
    album VARCHAR(200),
    duration INTEGER, -- 秒数
    file_url VARCHAR(500),
    cover_url VARCHAR(500),
    genre VARCHAR(100),
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    upload_user_id INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (upload_user_id) REFERENCES users(id)
);
```

### 3. 播放记录表 (play_history)
```sql
CREATE TABLE play_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    music_id INTEGER NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    play_duration INTEGER, -- 实际播放时长(秒)
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (music_id) REFERENCES music(id)
);
```

### 4. 用户收藏表 (user_favorites)
```sql
CREATE TABLE user_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    music_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (music_id) REFERENCES music(id),
    UNIQUE(user_id, music_id)
);
```

### 5. 系统通知表 (notifications)
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    target_role ENUM('all', 'user', 'admin', 'super_admin') DEFAULT 'all',
    target_user_id INTEGER, -- 特定用户通知
    is_global BOOLEAN DEFAULT FALSE, -- 全平台通知
    created_by INTEGER NOT NULL, -- 发布者ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (target_user_id) REFERENCES users(id)
);
```

### 6. 用户通知状态表 (user_notification_status)
```sql
CREATE TABLE user_notification_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    notification_id INTEGER NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (notification_id) REFERENCES notifications(id),
    UNIQUE(user_id, notification_id)
);
```

### 7. 钱包交易记录表 (wallet_transactions)
```sql
CREATE TABLE wallet_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type ENUM('deposit', 'withdraw', 'reward', 'purchase', 'admin_adjust') NOT NULL,
    description TEXT,
    reference_id VARCHAR(100), -- 外部交易ID
    processed_by INTEGER, -- 处理者ID (管理员操作时)
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (processed_by) REFERENCES users(id)
);
```

### 8. 系统日志表 (system_logs)
```sql
CREATE TABLE system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id INTEGER,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 9. 机器人任务表 (bot_tasks)
```sql
CREATE TABLE bot_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_type ENUM('accounting', 'maintenance', 'data_cleanup', 'report_generation') NOT NULL,
    task_name VARCHAR(200) NOT NULL,
    description TEXT,
    schedule_type ENUM('once', 'daily', 'weekly', 'monthly') DEFAULT 'once',
    schedule_time TIME,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    status ENUM('active', 'paused', 'completed', 'failed') DEFAULT 'active',
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 10. 机器人执行记录表 (bot_execution_logs)
```sql
CREATE TABLE bot_execution_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    execution_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('success', 'failed', 'partial') NOT NULL,
    result_summary TEXT,
    error_message TEXT,
    execution_duration INTEGER, -- 执行时长(秒)
    FOREIGN KEY (task_id) REFERENCES bot_tasks(id)
);
```

## API 端点设计

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新Token
- `POST /api/auth/super-admin-register` - 超级管理员注册 (隐藏)

### 用户管理
- `GET /api/users/profile` - 获取用户资料
- `PUT /api/users/profile` - 更新用户资料
- `GET /api/users/wallet` - 获取钱包信息
- `POST /api/users/wallet/transaction` - 钱包交易

### 音乐相关
- `GET /api/music` - 获取音乐列表
- `GET /api/music/{id}` - 获取音乐详情
- `POST /api/music/{id}/play` - 记录播放
- `POST /api/music/{id}/like` - 收藏音乐
- `DELETE /api/music/{id}/like` - 取消收藏

### 超级管理员功能
- `GET /api/admin/users` - 获取所有用户
- `PUT /api/admin/users/{id}/role` - 修改用户角色
- `POST /api/admin/notifications` - 发布通知
- `GET /api/admin/statistics` - 获取平台统计
- `POST /api/admin/wallet/adjust` - 调整用户钱包

### 机器人相关
- `GET /api/bots/tasks` - 获取机器人任务
- `POST /api/bots/tasks` - 创建机器人任务
- `PUT /api/bots/tasks/{id}` - 更新机器人任务
- `POST /api/bots/tasks/{id}/execute` - 手动执行任务

## 权限控制

### 角色权限
1. **普通用户 (user)**
   - 播放音乐
   - 管理个人资料
   - 查看钱包余额
   - 接收通知

2. **小管理员 (admin)**
   - 普通用户所有权限
   - 管理音乐内容
   - 查看部分统计数据
   - 处理用户反馈

3. **超级管理员 (super_admin)**
   - 所有权限
   - 用户角色管理
   - 发布全平台通知
   - 钱包余额调整
   - 机器人管理
   - 系统维护

## 安全措施

1. **密码加密**: 使用 bcrypt 哈希
2. **JWT认证**: 访问令牌 + 刷新令牌
3. **API限流**: 防止恶意请求
4. **输入验证**: 所有输入数据验证
5. **SQL注入防护**: 使用参数化查询
6. **CORS配置**: 限制跨域访问
7. **日志记录**: 记录所有重要操作

