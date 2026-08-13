# 维修 SOP 系统 - 数据库表结构说明

> 该文档基于数据库 `sop` 实际结构以及系统 API 文档 (`ADMIN_API_DOCUMENT.md`) 自动生成。

## 表名: `Devices`

| 字段名 (Column) | 数据类型 (Type) | 长度 (Length) | 允许为空 (Nullable) | 字段说明 (Description) |
| --- | --- | --- | --- | --- |
| id | uniqueidentifier | 16 | 否 |  |
| type | nvarchar | 200 | 否 | 设备类型 (如: 激光器, 机械臂) |
| model | nvarchar | 200 | 否 | 设备主型号 |
| sub_model | nvarchar | 200 | 是 |  |
| sn | nvarchar | 200 | 否 | 设备序列号 (唯一) |
| status | nvarchar | 40 | 是 |  |
| created_at | datetime | 8 | 是 | 记录创建时间 |
| updated_at | datetime | 8 | 是 | 记录最后修改时间 |

## 表名: `Guide_Steps`

| 字段名 (Column) | 数据类型 (Type) | 长度 (Length) | 允许为空 (Nullable) | 字段说明 (Description) |
| --- | --- | --- | --- | --- |
| id | uniqueidentifier | 16 | 否 |  |
| guide_id | uniqueidentifier | 16 | 否 | 关联的 SOP 指南 ID |
| stage | nvarchar | 100 | 否 | 步骤所处阶段 (如: 诊断阶段, 修复阶段) |
| title | nvarchar | 400 | 否 | 步骤标题 |
| description | nvarchar | MAX | 否 | 详细操作描述 |
| instruction | nvarchar | MAX | 是 | 具体指导说明 |
| is_confirmation_required | bit | 1 | 是 | 执行时是否需要工程师手动确认 |
| enabled | bit | 1 | 是 | 该步骤是否启用 |
| history_repair_count | int | 4 | 是 | 该步骤历史被执行修复的次数 |
| sort_order | int | 4 | 否 | 步骤在 SOP 中的排序序号 |
| image_urls | nvarchar | MAX | 是 | 关联图片 URL 数组 (JSON) |
| video_urls | nvarchar | MAX | 是 | 关联视频 URL 数组 (JSON) |
| pdf_urls | nvarchar | MAX | 是 | 关联 PDF 链接数组 (JSON) |
| created_at | datetime | 8 | 是 | 记录创建时间 |
| updated_at | datetime | 8 | 是 | 记录最后修改时间 |

## 表名: `Maintenance_Guides`

| 字段名 (Column) | 数据类型 (Type) | 长度 (Length) | 允许为空 (Nullable) | 字段说明 (Description) |
| --- | --- | --- | --- | --- |
| id | uniqueidentifier | 16 | 否 |  |
| device_id | uniqueidentifier | 16 | 否 | 关联设备机台 ID |
| fault_code | nvarchar | 100 | 否 | 故障代码 (如: E102) |
| fault_category | nvarchar | 200 | 是 | 故障类别名称 |
| operation_type | nvarchar | 200 | 是 | 操作类型 (如: 校准, 更换, 清洁) |
| scope | nvarchar | 200 | 是 |  |
| version | nvarchar | 40 | 否 | SOP 版本号 (如: V1.2) |
| published | bit | 1 | 是 | 是否已发布 (1: 已发布, 0: 草稿/禁用) |
| total_occurrence | int | 4 | 是 | 累计故障发生次数统计 |
| created_at | datetime | 8 | 是 | 记录创建时间 |
| updated_at | datetime | 8 | 是 | 记录最后修改时间 |

## 表名: `Media_Assets`

| 字段名 (Column) | 数据类型 (Type) | 长度 (Length) | 允许为空 (Nullable) | 字段说明 (Description) |
| --- | --- | --- | --- | --- |
| id | uniqueidentifier | 16 | 否 |  |
| name | nvarchar | 510 | 否 | 资源显示名称 |
| type | nvarchar | 100 | 否 | 资源类型: image, video, pdf, doc |
| url | nvarchar | MAX | 否 | 文件存储或访问 URL |
| size | nvarchar | 100 | 是 | 文件大小 (如: 2.4MB) |
| tags | nvarchar | MAX | 是 | 资源标签数组 (JSON) |
| uploader | nvarchar | 200 | 是 | 上传者姓名或 ID |
| description | nvarchar | MAX | 是 | 资源详细描述说明 |
| upload_time | datetime | 8 | 是 |  |
| created_at | datetime | 8 | 是 | 记录创建时间 |
| updated_at | datetime | 8 | 是 | 记录最后修改时间 |

## 表名: `Menus`

| 字段名 (Column) | 数据类型 (Type) | 长度 (Length) | 允许为空 (Nullable) | 字段说明 (Description) |
| --- | --- | --- | --- | --- |
| id | nvarchar | 100 | 否 | 菜单标识符 (如: dashboard, sop_library) |
| name | nvarchar | 200 | 否 | 菜单显示名称 |
| sort_order | int | 4 | 是 | 菜单显示排序权重 (从小到大) |
| created_at | datetime | 8 | 是 | 记录创建时间 |
| updated_at | datetime | 8 | 是 | 记录最后修改时间 |

## 表名: `Role_Menus`

| 字段名 (Column) | 数据类型 (Type) | 长度 (Length) | 允许为空 (Nullable) | 字段说明 (Description) |
| --- | --- | --- | --- | --- |
| role | nvarchar | 100 | 否 | 角色名称 (与 Users 表 role 字段对应) |
| menu_id | nvarchar | 100 | 否 | 关联的菜单 ID |
| created_at | datetime | 8 | 是 | 记录创建时间 |
| updated_at | datetime | 8 | 是 | 记录最后修改时间 |

## 表名: `Step_Inquiries`

| 字段名 (Column) | 数据类型 (Type) | 长度 (Length) | 允许为空 (Nullable) | 字段说明 (Description) |
| --- | --- | --- | --- | --- |
| id | uniqueidentifier | 16 | 否 |  |
| engineer_id | uniqueidentifier | 16 | 否 | 提问的工程师 ID |
| device_id | uniqueidentifier | 16 | 否 | 关联的机台设备 ID |
| fault_code | nvarchar | 100 | 否 | 故障代码 |
| step_id | uniqueidentifier | 16 | 是 | 提问时所处的 SOP 步骤 ID |
| question | nvarchar | MAX | 否 | 提问问题具体描述 |
| photo_url | nvarchar | MAX | 是 | 现场拍摄的佐证照片 URL |
| status | nvarchar | 40 | 是 | 处理状态: pending(待回复), resolved(已回复解决) |
| answer | nvarchar | MAX | 是 | 管理员提供的回复或指导意见 |
| is_new_issue | bit | 1 | 是 | 是否为接口文档定义的“新出现的故障类型” |
| created_at | datetime | 8 | 是 | 记录创建时间 |
| updated_at | datetime | 8 | 是 | 记录最后修改时间 |

## 表名: `Users`

| 字段名 (Column) | 数据类型 (Type) | 长度 (Length) | 允许为空 (Nullable) | 字段说明 (Description) |
| --- | --- | --- | --- | --- |
| id | uniqueidentifier | 16 | 否 | 用户唯一标识 (UUID) |
| username | nvarchar | 100 | 否 | 登录账号 (工号或邮箱) |
| password | nvarchar | MAX | 否 | 登录密码 (加密后的 Hash) |
| employee_id | nvarchar | 100 | 否 | 员工工号 (唯一标识) |
| name | nvarchar | 200 | 否 | 真实姓名 |
| role | nvarchar | 100 | 否 | 用户角色: ADMIN(管理员), SENIOR_ENGINEER(资深工程师), JUNIOR_ENGINEER(初级工程师) |
| department | nvarchar | 200 | 是 | 所属部门名称 |
| status | nvarchar | 40 | 是 | 账号状态: active(正常), inactive(禁用) |
| last_login | datetime | 8 | 是 | 最后一次成功登录的时间 |
| avatar_url | nvarchar | MAX | 是 | 头像访问 URL |
| permissions | nvarchar | MAX | 是 | 详细权限配置 JSON |
| created_at | datetime | 8 | 是 | 记录创建时间 |
| updated_at | datetime | 8 | 是 | 记录最后修改时间 |

