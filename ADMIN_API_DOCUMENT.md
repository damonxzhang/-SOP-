# 维修 SOP 系统 - 管理后台接口文档 (Admin API)

本文档定义了维修 SOP 系统管理后台（Admin Dashboard）所需的 RESTful 接口。

## 通用说明
- **基础路径**: `/api/admin`
- **数据格式**: 请求与响应均使用 `application/json`
- **命名规范**: 接口字段统一使用 **下划线 (snake_case)** 规则
- **认证方式**: 在 Header 中携带 `Authorization: Bearer <token>`

---

## 1. 身份认证 (Authentication)

### 1.1 用户登录
- **路径**: `POST /auth/login`
- **请求体**:
```json
{
  "username": "admin",
  "password": "hashed_password",
  "login_type": "standard"
}
```
- **响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "jwt_token_string",
    "expire_at": "2026-03-20 10:00:00",
    "user_info": {
      "id": "user-1",
      "name": "管理员",
      "role": "ADMIN",
      "avatar": "url"
    }
  }
}
```

### 1.2 用户登出
- **路径**: `POST /auth/logout`
- **请求体**: 空
- **响应**:
```json
{
  "code": 200,
  "message": "已成功退出登录"
}
```

---

## 2. 统计看板 (Dashboard)

### 2.1 获取概览统计数据
- **路径**: `GET /stats/overview`
- **响应**:
```json
{
  "code": 200,
  "data": {
    "mttr_avg": "3.4h",
    "mttr_trend": "-12%",
    "sop_compliance_rate": "98.2%",
    "sop_compliance_trend": "+2.1%",
    "pending_inquiries_count": 5,
    "high_risk_ops_rate": "14%",
    "high_risk_ops_trend": "-3%"
  }
}
```

### 2.2 获取故障趋势分布 (近7日)
- **路径**: `GET /stats/fault_trend`
- **响应**:
```json
{
  "code": 200,
  "data": [
    { "day": "Mon", "count": 4 },
    { "day": "Tue", "count": 7 },
    { "day": "Wed", "count": 5 },
    { "day": "Thu", "count": 9 },
    { "day": "Fri", "count": 6 },
    { "day": "Sat", "count": 3 },
    { "day": "Sun", "count": 2 }
  ]
}
```

### 2.3 获取 MTTR 预测数据
- **路径**: `GET /stats/mttr_prediction`
- **响应**:
```json
{
  "code": 200,
  "data": [
    { "month": "10月", "actual": 4.2, "prediction": 4.2 },
    { "month": "04月", "actual": null, "prediction": 3.0 }
  ]
}
```

---

## 3. SOP 库管理 (SOP Library)

### 3.1 获取 SOP 列表
- **路径**: `GET /guides`
- **查询参数**:
  - `search`: 搜索关键词（故障代码或类别）
  - `device_id`: 关联机台 ID
  - `fault_category`: 故障类别
- **响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": "uuid-1",
      "device_id": "device-001",
      "fault_code": "E102",
      "fault_category": "光路系统",
      "operation_type": "校准",
      "version": "V1.2",
      "published": true,
      "total_occurrence_count": 128
    }
  ]
}
```

### 3.2 获取 SOP 详情
- **路径**: `GET /guides/{id}`
- **响应**:
```json
{
  "code": 200,
  "data": {
    "id": "uuid-1",
    "fault_code": "E102",
    "steps": [
      {
        "id": "step-1",
        "stage": "诊断阶段",
        "title": "检查激光器状态",
        "description": "查看面板指示灯并记录异常代码",
        "instruction": "打开侧盖，观察红色指示灯闪烁频率",
        "image_urls": ["url1", "url2"],
        "video_urls": ["url3"],
        "pdf_urls": ["url4"],
        "is_confirmation_required": true,
        "enabled": true,
        "history_repair_count": 45
      }
    ]
  }
}
```

### 3.3 保存/更新 SOP
- **路径**: `POST /guides` (新增) 或 `PUT /guides/{id}` (更新)
- **请求体**: 同获取详情的 data 结构
- **响应**: `{ "code": 200, "message": "保存成功", "data": { "id": "..." } }`

---

## 4. 工程师管理 (User Management)

### 4.1 获取工程师列表
- **路径**: `GET /users`
- **响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": "user-1",
      "name": "张三",
      "employee_id": "NXP001",
      "role": "SENIOR_ENGINEER",
      "department": "制造二部",
      "status": "active",
      "last_login": "2026-03-18 14:20:00",
      "avatar": "url",
      "permissions": {
        "dashboard": "view",
        "sop_library": "manage",
        "user_management": "none"
      }
    }
  ]
}
```

### 4.2 更新工程师信息/权限
- **路径**: `PUT /users/{id}`
- **请求体**:
```json
{
  "name": "张三",
  "role": "ADMIN",
  "status": "active",
  "permissions": {
    "dashboard": "manage",
    "sop_library": "manage"
  }
}
```

---

## 5. 现场提问记录 (Inquiries)

### 5.1 获取提问列表
- **路径**: `GET /inquiries`
- **查询参数**: `status` (pending/resolved), `fault_code`
- **响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": "inq-1",
      "engineer_id": "user-1",
      "device_id": "device-001",
      "fault_code": "E102",
      "question": "激光器侧盖打不开，是否有特殊卡扣？",
      "photo_url": "url",
      "status": "pending",
      "created_at": "2026-03-19 10:00:00",
      "is_new_issue": false,
      "context": {
        "step_title": "打开侧盖",
        "is_step_related": true
      }
    }
  ]
}
```

### 5.2 回复并处理提问
- **路径**: `POST /inquiries/{id}/resolve`
- **请求体**:
```json
{
  "answer": "侧盖下方有一个隐藏推杆，需向左滑动后再拉开。",
  "apply_to_sop": true
}
```

---

## 6. 多媒体资料库 (Media Library)

### 6.1 获取资源列表
- **路径**: `GET /media`
- **查询参数**: `type` (image/video/pdf/doc), `search`
- **响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": "media-1",
      "name": "激光器维护手册.pdf",
      "type": "pdf",
      "url": "url",
      "size": "2.4MB",
      "tags": ["激光器", "手册"],
      "upload_time": "2026-03-15 09:00:00",
      "uploader": "admin"
    }
  ]
}
```

### 6.2 上传资源
- **路径**: `POST /media/upload`
- **请求格式**: `multipart/form-data`
- **参数**: `file` (文件流), `tags` (标签数组), `description" (说明)

### 6.3 删除资源
- **路径**: `DELETE /media/{id}`
