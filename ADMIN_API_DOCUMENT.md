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
- **请求参数说明**:
| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| username | string | 是 | 用户登录账号（工号或邮箱） |
| password | string | 是 | 用户登录密码（加密后的字符串） |
| login_type | string | 否 | 登录类型（如：standard, sso） |
- **请求示例**:
```json
{
  "username": "admin",
  "password": "hashed_password",
  "login_type": "standard"
}
```
- **响应参数说明**:
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码（200: 成功, 401: 未授权, 500: 服务器错误） |
| message | string | 提示信息 |
| data.token | string | JWT 访问令牌 |
| data.expire_at | string | 令牌过期时间 (YYYY-MM-DD HH:mm:ss) |
| data.user_info.id | string | 用户唯一 ID |
| data.user_info.name | string | 用户真实姓名 |
| data.user_info.role | string | 用户角色（ADMIN: 管理员, SENIOR_ENGINEER: 资深工程师） |
| data.user_info.avatar | string | 用户头像 URL |
- **响应示例**:
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
- **响应参数说明**:
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码 |
| message | string | 提示信息 |
- **响应示例**:
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
- **响应参数说明**:
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码 |
| data.mttr_avg | string | 平均修复时间 (Mean Time To Repair) |
| data.mttr_trend | string | MTTR 环比趋势（如：-12% 表示下降） |
| data.sop_compliance_rate | string | SOP 合规执行率 |
| data.sop_compliance_trend | string | 合规率环比趋势 |
| data.pending_inquiries_count | number | 待处理的现场提问数量 |
| data.high_risk_ops_rate | string | 高风险操作占比 |
| data.high_risk_ops_trend | string | 高风险占比环比趋势 |
- **响应示例**:
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
- **说明**: 获取最近 7 天内的每日故障发生次数统计
- **响应参数说明**:
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码 |
| data[].day | string | 星期（如：Mon, Tue） |
| data[].count | number | 当日故障发生次数 |
- **响应示例**:
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

---

## 3. SOP 库管理 (SOP Library)

### 3.1 获取 SOP 列表
- **路径**: `GET /guides`
- **查询参数说明**:
| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| search | string | 否 | 搜索关键词（故障代码或类别名称） |
| device_id | string | 否 | 关联的机台 ID |
| fault_category | string | 否 | 故障类别 |
| page | number | 否 | 当前页码，默认 1 |
| limit | number | 否 | 每页条数，默认 10 |
- **请求示例**:
`GET /api/admin/guides?page=1&limit=10&search=E102`
- **响应参数说明**:
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码 |
| data.list[] | array | SOP 列表数据 |
| data.list[].id | string | SOP 唯一 ID |
| data.list[].device_id | string | 关联机台 ID |
| data.list[].fault_code | string | 故障代码 (Error Code) |
| data.list[].fault_category | string | 故障类别 |
| data.list[].operation_type | string | 操作类型（如：校准、更换、清洁） |
| data.list[].version | string | 版本号 |
| data.list[].published | boolean | 是否已发布 |
| data.list[].total_occurrence_count | number | 累计发生次数统计 |
| data.pagination.total | number | 总记录数 |
| data.pagination.page | number | 当前页码 |
| data.pagination.limit | number | 每页条数 |
- **响应示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
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
    ],
    "pagination": {
      "total": 128,
      "page": 1,
      "limit": 10
    }
  }
}
```

### 3.2 获取 SOP 详情
- **路径**: `GET /guides/{id}`
- **响应参数说明**:
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码 |
| data.id | string | SOP 唯一 ID |
| data.fault_code | string | 故障代码 |
| data.steps[] | array | 维护步骤列表 |
| data.steps[].id | string | 步骤唯一 ID |
| data.steps[].stage | string | 步骤所属阶段（如：准备、诊断、维修、验证） |
| data.steps[].title | string | 步骤标题 |
| data.steps[].description | string | 步骤详细描述 |
| data.steps[].instruction | string | 操作指令/注意事项 |
| data.steps[].image_urls | array | 图片资源 URL 数组 |
| data.steps[].video_urls | array | 视频资源 URL 数组 |
| data.steps[].pdf_urls | array | PDF 关联文档 URL 数组 |
| data.steps[].is_confirmation_required | boolean | 是否需要工程师确认操作完成 |
| data.steps[].enabled | boolean | 步骤是否启用 |
| data.steps[].history_repair_count | number | 该步骤历史维修次数记录 |
- **响应示例**:
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
- **请求参数说明**: 与获取详情中的 `data` 结构一致
- **响应参数说明**:
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data.id | string | 已保存的 SOP ID |
- **响应示例**:
```json
{
  "code": 200,
  "message": "保存成功",
  "data": {
    "id": "uuid-1"
  }
}
```

### 3.4 发布/禁用 SOP
- **路径**: `POST /guides/{id}/status`
- **请求参数说明**:
| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| published | boolean | 是 | 是否发布（true: 启用/发布, false: 禁用） |
- **请求示例**:
```json
{
  "published": false
}
```
- **响应参数说明**:
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码 |
| message | string | 提示信息 |
- **响应示例**:
```json
{
  "code": 200,
  "message": "SOP 状态更新成功"
}
```

---

## 4. 工程师管理 (User Management)

### 4.1 获取工程师列表
- **路径**: `GET /users`
- **响应参数说明**:
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码 |
| data[].id | string | 工程师唯一 ID |
| data[].name | string | 姓名 |
| data[].employee_id | string | 工号 (Employee ID) |
| data[].role | string | 角色（SENIOR_ENGINEER, JUNIOR_ENGINEER, ADMIN） |
| data[].department | string | 所属部门 |
| data[].status | string | 账号状态（active: 正常, inactive: 禁用） |
| data[].last_login | string | 最后登录时间 |
| data[].avatar | string | 头像 URL |
| data[].permissions.dashboard | string | 看板权限 (view/manage/none) |
| data[].permissions.sop_library | string | SOP 库权限 (view/manage/none) |
| data[].permissions.user_management | string | 用户管理权限 (view/manage/none) |
- **响应示例**:
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
- **请求参数说明**:
| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| name | string | 否 | 修改后的姓名 |
| role | string | 否 | 修改后的角色 |
| status | string | 否 | 账号状态 |
| permissions | object | 否 | 修改后的权限配置对象 |
- **响应示例**:
```json
{
  "code": 200,
  "message": "更新成功"
}
```

---

## 5. 现场提问记录 (Inquiries)

### 5.1 获取提问列表
- **路径**: `GET /inquiries`
- **查询参数说明**:
| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| status | string | 否 | 提问状态 (pending: 待处理, resolved: 已解决) |
| fault_code | string | 否 | 关联的故障代码 |
- **响应参数说明**:
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码 |
| data[].id | string | 提问记录唯一 ID |
| data[].engineer_id | string | 提问工程师 ID |
| data[].device_id | string | 关联机台 ID |
| data[].fault_code | string | 关联故障代码 |
| data[].question | string | 工程师提出的问题描述 |
| data[].photo_url | string | 现场拍摄的照片 URL |
| data[].status | string | 处理状态 |
| data[].created_at | string | 提交时间 |
| data[].is_new_issue | boolean | 是否为新出现的故障类型 |
| data[].context.step_title | string | 提问时所在的 SOP 步骤标题 |
| data[].context.is_step_related | boolean | 是否与特定步骤强相关 |
- **响应示例**:
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
- **请求参数说明**:
| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| answer | string | 是 | 管理员提供的解答或指导建议 |
| apply_to_sop | boolean | 否 | 是否将此解答同步更新到对应的 SOP 步骤中 |
- **响应示例**:
```json
{
  "code": 200,
  "message": "回复已发送，提问已标记为解决"
}
```

---

## 6. 多媒体资料库 (Media Library)

### 6.1 获取资源列表
- **路径**: `GET /media`
- **查询参数说明**:
| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| type | string | 否 | 资源类型 (image/video/pdf/doc) |
| search | string | 否 | 资源名称搜索关键词 |
- **响应参数说明**:
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码 |
| data[].id | string | 资源唯一 ID |
| data[].name | string | 资源名称（文件名） |
| data[].type | string | 资源类型 |
| data[].url | string | 访问/下载 URL |
| data[].size | string | 文件大小（如：2.4MB） |
| data[].tags | array | 资源关联的标签数组 |
| data[].upload_time | string | 上传时间 |
| data[].uploader | string | 上传者姓名或 ID |
- **响应示例**:
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
- **请求参数说明**:
| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| file | file | 是 | 待上传的文件流 |
| tags | array | 否 | 关联标签数组 |
| description | string | 否 | 资源详细说明 |
- **响应示例**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "id": "media-2",
    "url": "..."
  }
}
```

### 6.3 删除资源
- **路径**: `DELETE /media/{id}`
- **响应示例**:
```json
{
  "code": 200,
  "message": "资源已成功删除"
}
```

