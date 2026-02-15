# 维修 SOP 系统 - 数据库设计方案 (SQL Server)

本文档定义了维修 SOP 系统（PDA 端与后台管理端）的数据库设计方案。基于当前系统功能实体及业务逻辑，采用 SQL Server 数据库进行建模。

---

## 1. 设计概述
- **数据库类型**: SQL Server 2016+
- **字符集**: UTF-8 (NVARCHAR)
- **命名规范**: 采用 `PascalCase` 或 `Snake_Case` (此处统一使用 `Snake_Case`)

---

## 2. 核心实体关系 (ER) 简述
1. **用户 (Users)**: 存储工程师及管理员信息。
2. **设备 (Devices)**: 存储机台、SN 等资产信息。
3. **维修指南 (Maintenance_Guides)**: 核心 SOP 表，关联设备。
4. **指南步骤 (Guide_Steps)**: SOP 的具体步骤，支持多媒体及反馈计数。
5. **维修记录 (Repair_Records)**: 记录实际维修过程及结果。
6. **现场疑问/反馈 (Step_Inquiries)**: 工程师在步骤执行中的实时提问。
7. **多媒体资源 (Media_Resources)**: 资料库文件管理。

---

## 3. 表结构详细设计

### 3.1 用户表 (Users)
| 字段名 | 类型 | 约束 | 说明 |
| :--- | :--- | :--- | :--- |
| id | UNIQUEIDENTIFIER | PRIMARY KEY, DEFAULT NEWID() | 用户唯一标识 |
| employee_id | NVARCHAR(50) | UNIQUE, NOT NULL | 工号 |
| name | NVARCHAR(100) | NOT NULL | 姓名 |
| role | NVARCHAR(50) | NOT NULL | 角色 (ADMIN, SENIOR_ENGINEER, etc.) |
| department | NVARCHAR(100) | NULL | 部门 |
| status | NVARCHAR(20) | DEFAULT 'active' | 状态 (active, disabled) |
| last_login | DATETIME | NULL | 最后登录时间 |
| avatar_url | NVARCHAR(MAX) | NULL | 头像链接 |
| created_at | DATETIME | DEFAULT GETDATE() | 创建时间 |

### 3.2 设备表 (Devices)
| 字段名 | 类型 | 约束 | 说明 |
| :--- | :--- | :--- | :--- |
| id | UNIQUEIDENTIFIER | PRIMARY KEY, DEFAULT NEWID() | 设备唯一标识 |
| type | NVARCHAR(100) | NOT NULL | 设备类型 |
| model | NVARCHAR(100) | NOT NULL | 型号 |
| sub_model | NVARCHAR(100) | NULL | 子型号 |
| sn | NVARCHAR(100) | UNIQUE, NOT NULL | 序列号 (SN) |
| status | NVARCHAR(20) | DEFAULT 'active' | 状态 (active, maintenance, offline) |
| created_at | DATETIME | DEFAULT GETDATE() | 创建时间 |

### 3.3 维修指南表 (Maintenance_Guides)
| 字段名 | 类型 | 约束 | 说明 |
| :--- | :--- | :--- | :--- |
| id | UNIQUEIDENTIFIER | PRIMARY KEY, DEFAULT NEWID() | 指南唯一标识 |
| device_id | UNIQUEIDENTIFIER | FOREIGN KEY (Devices.id) | 关联设备 |
| fault_code | NVARCHAR(50) | NOT NULL | 故障代码 (AL-XXXX) |
| fault_category | NVARCHAR(100) | NULL | 故障分类 |
| operation_type | NVARCHAR(100) | NULL | 操作类型 (清洁, 更换等) |
| scope | NVARCHAR(100) | NULL | 作用范围 (光学系统, 真空腔等) |
| fault_phenomenon | NVARCHAR(MAX) | NULL | 故障现象描述 |
| version | NVARCHAR(20) | NOT NULL | 版本号 |
| published | BIT | DEFAULT 0 | 是否发布 |
| total_occurrence | INT | DEFAULT 0 | 历史总发生次数 |
| created_at | DATETIME | DEFAULT GETDATE() | 创建时间 |

### 3.4 指南步骤表 (Guide_Steps)
| 字段名 | 类型 | 约束 | 说明 |
| :--- | :--- | :--- | :--- |
| id | UNIQUEIDENTIFIER | PRIMARY KEY, DEFAULT NEWID() | 步骤唯一标识 |
| guide_id | UNIQUEIDENTIFIER | FOREIGN KEY (Maintenance_Guides.id) | 关联指南 |
| stage | NVARCHAR(50) | NOT NULL | 阶段 (准备, 诊断, 实施等) |
| title | NVARCHAR(200) | NOT NULL | 步骤标题 |
| description | NVARCHAR(MAX) | NOT NULL | 步骤描述 |
| instruction | NVARCHAR(MAX) | NULL | 操作说明/具体动作 |
| safety_warning | NVARCHAR(MAX) | NULL | 安全警告 |
| is_confirmation_required | BIT | DEFAULT 1 | 是否需要合规确认 |
| enabled | BIT | DEFAULT 1 | 是否启用 |
| history_repair_count | INT | DEFAULT 1 | **反馈次数 (权重排序核心)** |
| sort_order | INT | NOT NULL | 原始编辑顺序 |
| created_at | DATETIME | DEFAULT GETDATE() | 创建时间 |

### 3.5 步骤多媒体关联表 (Step_Media)
*注：因步骤支持多图片/视频，采用一对多关联表。*
| 字段名 | 类型 | 约束 | 说明 |
| :--- | :--- | :--- | :--- |
| id | UNIQUEIDENTIFIER | PRIMARY KEY, DEFAULT NEWID() | 关联标识 |
| step_id | UNIQUEIDENTIFIER | FOREIGN KEY (Guide_Steps.id) | 关联步骤 |
| media_type | NVARCHAR(20) | NOT NULL | 类型 (image, video, pdf) |
| url | NVARCHAR(MAX) | NOT NULL | 资源链接 |
| sort_order | INT | DEFAULT 0 | 显示顺序 |

### 3.6 维修记录表 (Repair_Records)
| 字段名 | 类型 | 约束 | 说明 |
| :--- | :--- | :--- | :--- |
| id | UNIQUEIDENTIFIER | PRIMARY KEY, DEFAULT NEWID() | 记录唯一标识 |
| guide_id | UNIQUEIDENTIFIER | FOREIGN KEY (Maintenance_Guides.id) | 关联 SOP |
| engineer_id | UNIQUEIDENTIFIER | FOREIGN KEY (Users.id) | 执行工程师 |
| start_time | DATETIME | NOT NULL | 开始时间 |
| end_time | DATETIME | NULL | 结束时间 |
| fault_reason | NVARCHAR(MAX) | NULL | 故障原因反馈 |
| treatment | NVARCHAR(MAX) | NULL | 处理方案反馈 |
| status | NVARCHAR(20) | NOT NULL | 状态 (ongoing, completed) |
| submission_source | NVARCHAR(20) | NULL | 提交来源 (CLOSE, PASS) |
| is_new_issue | BIT | DEFAULT 0 | 是否标记为新发现问题 |
| created_at | DATETIME | DEFAULT GETDATE() | 创建时间 |

### 3.7 维修记录完成步骤表 (Record_Completed_Steps)
| 字段名 | 类型 | 约束 | 说明 |
| :--- | :--- | :--- | :--- |
| id | UNIQUEIDENTIFIER | PRIMARY KEY, DEFAULT NEWID() | 关联标识 |
| record_id | UNIQUEIDENTIFIER | FOREIGN KEY (Repair_Records.id) | 关联维修记录 |
| step_id | UNIQUEIDENTIFIER | FOREIGN KEY (Guide_Steps.id) | 关联步骤 |
| completed_at | DATETIME | DEFAULT GETDATE() | 完成时间 |

### 3.8 现场疑问与反馈表 (Step_Inquiries)
| 字段名 | 类型 | 约束 | 说明 |
| :--- | :--- | :--- | :--- |
| id | UNIQUEIDENTIFIER | PRIMARY KEY, DEFAULT NEWID() | 疑问标识 |
| engineer_id | UNIQUEIDENTIFIER | FOREIGN KEY (Users.id) | 提问人 |
| guide_id | UNIQUEIDENTIFIER | FOREIGN KEY (Maintenance_Guides.id) | 关联 SOP |
| step_id | UNIQUEIDENTIFIER | NULL | 关联步骤 (若是新发现则可为空) |
| device_id | UNIQUEIDENTIFIER | FOREIGN KEY (Devices.id) | 关联设备 |
| question | NVARCHAR(MAX) | NOT NULL | 问题内容 |
| photo_url | NVARCHAR(MAX) | NULL | 现场照片 |
| status | NVARCHAR(20) | DEFAULT 'pending' | 状态 (pending, resolved) |
| is_new_issue | BIT | DEFAULT 0 | 是否为 SOP 外的新问题 |
| created_at | DATETIME | DEFAULT GETDATE() | 提交时间 |

---

## 4. 关键业务逻辑说明 (SQL 实现建议)

### 4.1 反馈计数自动更新 (Trigger/Procedure)
当 `Repair_Records` 的 `status` 更新为 `completed` 时，应触发逻辑：
1. 查询 `Record_Completed_Steps` 中该记录对应的所有 `step_id`。
2. 更新 `Guide_Steps` 表，将这些步骤的 `history_repair_count` 字段累加 1。

### 4.2 PDA 端步骤排序逻辑
在获取 SOP 步骤时，SQL 查询应包含：
```sql
SELECT * FROM Guide_Steps 
WHERE guide_id = @GuideId AND enabled = 1
ORDER BY history_repair_count DESC, sort_order ASC
```
*注：优先按反馈次数降序排列，次数相同时按原始编辑顺序排列。*

### 4.3 索引优化建议
- `Devices.sn`: 唯一索引，加速扫码识别。
- `Maintenance_Guides.fault_code`: 普通索引，加速报警匹配。
- `Repair_Records.engineer_id`: 普通索引，加速个人历史查询。
- `Guide_Steps.guide_id`: 普通索引，加速 SOP 步骤加载。
