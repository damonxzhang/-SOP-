/*
    维修 SOP 系统 - 数据库初始化脚本 (SQL Server)
    目标数据库: sop
    生成时间: 2026-03-19
    适配接口文档版本: ADMIN_API_DOCUMENT.md
    包含详细备注信息
*/

USE [sop];
GO

-- 0. 清理旧表 (按依赖关系反向删除)
IF OBJECT_ID('[dbo].[Media_Assets]', 'U') IS NOT NULL DROP TABLE [dbo].[Media_Assets];
IF OBJECT_ID('[dbo].[Step_Inquiries]', 'U') IS NOT NULL DROP TABLE [dbo].[Step_Inquiries];
IF OBJECT_ID('[dbo].[Guide_Steps]', 'U') IS NOT NULL DROP TABLE [dbo].[Guide_Steps];
IF OBJECT_ID('[dbo].[Maintenance_Guides]', 'U') IS NOT NULL DROP TABLE [dbo].[Maintenance_Guides];
IF OBJECT_ID('[dbo].[Devices]', 'U') IS NOT NULL DROP TABLE [dbo].[Devices];
IF OBJECT_ID('[dbo].[Role_Menus]', 'U') IS NOT NULL DROP TABLE [dbo].[Role_Menus];
IF OBJECT_ID('[dbo].[Menus]', 'U') IS NOT NULL DROP TABLE [dbo].[Menus];
IF OBJECT_ID('[dbo].[Users]', 'U') IS NOT NULL DROP TABLE [dbo].[Users];
GO

-- 1. 用户表 (Users)
CREATE TABLE [dbo].[Users] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [username] NVARCHAR(50) NOT NULL UNIQUE,
    [password] NVARCHAR(MAX) NOT NULL,
    [employee_id] NVARCHAR(50) NOT NULL UNIQUE,
    [name] NVARCHAR(100) NOT NULL,
    [role] NVARCHAR(50) NOT NULL,
    [department] NVARCHAR(100) NULL,
    [status] NVARCHAR(20) DEFAULT 'active',
    [last_login] DATETIME NULL,
    [avatar_url] NVARCHAR(MAX) NULL,
    [permissions] NVARCHAR(MAX) NULL, -- 存储 JSON: { dashboard: 'view', sop_library: 'manage', ... }
    [created_at] DATETIME DEFAULT GETDATE(),
    [updated_at] DATETIME DEFAULT GETDATE()
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'后台管理系统用户信息表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'用户唯一标识 (UUID)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'登录账号 (工号或邮箱)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'username';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'登录密码 (加密后的 Hash)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'password';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'员工工号 (唯一标识)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'employee_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'真实姓名' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'name';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'用户角色: ADMIN(管理员), SENIOR_ENGINEER(资深工程师), JUNIOR_ENGINEER(初级工程师)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'role';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'所属部门名称' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'department';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'账号状态: active(正常), inactive(禁用)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'status';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'最后一次成功登录的时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'last_login';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'头像访问 URL' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'avatar_url';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'详细权限配置 JSON' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'permissions';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录创建时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'created_at';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录最后修改时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'updated_at';
GO

-- 2. 菜单表 (Menus)
CREATE TABLE [dbo].[Menus] (
    [id] NVARCHAR(50) PRIMARY KEY,
    [name] NVARCHAR(100) NOT NULL,
    [sort_order] INT DEFAULT 0,
    [created_at] DATETIME DEFAULT GETDATE(),
    [updated_at] DATETIME DEFAULT GETDATE()
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'系统左侧导航栏菜单项定义' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Menus';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'菜单标识符 (如: dashboard, sop_library)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Menus', @level2type=N'COLUMN',@level2name=N'id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'菜单显示名称' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Menus', @level2type=N'COLUMN',@level2name=N'name';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'菜单显示排序权重 (从小到大)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Menus', @level2type=N'COLUMN',@level2name=N'sort_order';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录创建时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Menus', @level2type=N'COLUMN',@level2name=N'created_at';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录最后修改时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Menus', @level2type=N'COLUMN',@level2name=N'updated_at';
GO

-- 3. 角色菜单关联表 (Role_Menus)
CREATE TABLE [dbo].[Role_Menus] (
    [role] NVARCHAR(50) NOT NULL,
    [menu_id] NVARCHAR(50) NOT NULL,
    [created_at] DATETIME DEFAULT GETDATE(),
    [updated_at] DATETIME DEFAULT GETDATE(),
    PRIMARY KEY ([role], [menu_id]),
    CONSTRAINT FK_RoleMenus_Menus FOREIGN KEY (menu_id) REFERENCES Menus(id)
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'角色可访问菜单目录的关联表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Role_Menus';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'角色名称 (与 Users 表 role 字段对应)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Role_Menus', @level2type=N'COLUMN',@level2name=N'role';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联的菜单 ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Role_Menus', @level2type=N'COLUMN',@level2name=N'menu_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录创建时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Role_Menus', @level2type=N'COLUMN',@level2name=N'created_at';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录最后修改时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Role_Menus', @level2type=N'COLUMN',@level2name=N'updated_at';
GO

-- 4. 设备表 (Devices)
CREATE TABLE [dbo].[Devices] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [type] NVARCHAR(100) NOT NULL,
    [model] NVARCHAR(100) NOT NULL,
    [sub_model] NVARCHAR(100) NULL,
    [sn] NVARCHAR(100) NOT NULL UNIQUE,
    [status] NVARCHAR(20) DEFAULT 'active',
    [created_at] DATETIME DEFAULT GETDATE(),
    [updated_at] DATETIME DEFAULT GETDATE()
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'维修机台设备基础资料表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Devices';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'设备类型 (如: 激光器, 机械臂)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Devices', @level2type=N'COLUMN',@level2name=N'type';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'设备主型号' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Devices', @level2type=N'COLUMN',@level2name=N'model';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'设备序列号 (唯一)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Devices', @level2type=N'COLUMN',@level2name=N'sn';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录创建时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Devices', @level2type=N'COLUMN',@level2name=N'created_at';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录最后修改时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Devices', @level2type=N'COLUMN',@level2name=N'updated_at';
GO

-- 5. 维修指南表 (Maintenance_Guides)
CREATE TABLE [dbo].[Maintenance_Guides] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [device_id] UNIQUEIDENTIFIER NOT NULL,
    [fault_code] NVARCHAR(50) NOT NULL,
    [fault_category] NVARCHAR(100) NULL,
    [operation_type] NVARCHAR(100) NULL,
    [scope] NVARCHAR(100) NULL,
    [version] NVARCHAR(20) NOT NULL,
    [published] BIT DEFAULT 0,
    [total_occurrence] INT DEFAULT 0,
    [created_at] DATETIME DEFAULT GETDATE(),
    [updated_at] DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Guides_Devices FOREIGN KEY (device_id) REFERENCES Devices(id)
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'维修 SOP 指南主信息表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联设备机台 ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'device_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'故障代码 (如: E102)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'fault_code';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'故障类别名称' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'fault_category';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'操作类型 (如: 校准, 更换, 清洁)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'operation_type';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'SOP 版本号 (如: V1.2)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'version';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'是否已发布 (1: 已发布, 0: 草稿/禁用)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'published';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'累计故障发生次数统计' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'total_occurrence';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录创建时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'created_at';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录最后修改时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'updated_at';
GO

-- 6. 指南步骤表 (Guide_Steps)
CREATE TABLE [dbo].[Guide_Steps] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [guide_id] UNIQUEIDENTIFIER NOT NULL,
    [stage] NVARCHAR(50) NOT NULL,
    [title] NVARCHAR(200) NOT NULL,
    [description] NVARCHAR(MAX) NOT NULL,
    [instruction] NVARCHAR(MAX) NULL,
    [is_confirmation_required] BIT DEFAULT 1,
    [enabled] BIT DEFAULT 1,
    [history_repair_count] INT DEFAULT 0,
    [sort_order] INT NOT NULL,
    [image_urls] NVARCHAR(MAX) NULL, -- 存储 JSON 数组
    [video_urls] NVARCHAR(MAX) NULL, -- 存储 JSON 数组
    [pdf_urls] NVARCHAR(MAX) NULL,   -- 存储 JSON 数组
    [created_at] DATETIME DEFAULT GETDATE(),
    [updated_at] DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Steps_Guides FOREIGN KEY (guide_id) REFERENCES Maintenance_Guides(id)
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'SOP 详细操作步骤定义表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联的 SOP 指南 ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'guide_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'步骤所处阶段 (如: 诊断阶段, 修复阶段)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'stage';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'步骤标题' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'title';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'详细操作描述' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'description';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'具体指导说明' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'instruction';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'执行时是否需要工程师手动确认' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'is_confirmation_required';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'该步骤是否启用' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'enabled';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'该步骤历史被执行修复的次数' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'history_repair_count';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'步骤在 SOP 中的排序序号' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'sort_order';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联图片 URL 数组 (JSON)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'image_urls';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联视频 URL 数组 (JSON)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'video_urls';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联 PDF 链接数组 (JSON)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'pdf_urls';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录创建时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'created_at';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录最后修改时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'updated_at';
GO

-- 7. 现场疑问与反馈表 (Step_Inquiries)
CREATE TABLE [dbo].[Step_Inquiries] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [engineer_id] UNIQUEIDENTIFIER NOT NULL,
    [device_id] UNIQUEIDENTIFIER NOT NULL,
    [fault_code] NVARCHAR(50) NOT NULL,
    [step_id] UNIQUEIDENTIFIER NULL,
    [question] NVARCHAR(MAX) NOT NULL,
    [photo_url] NVARCHAR(MAX) NULL,
    [status] NVARCHAR(20) DEFAULT 'pending', -- pending, resolved
    [answer] NVARCHAR(MAX) NULL,
    [is_new_issue] BIT DEFAULT 0,
    [created_at] DATETIME DEFAULT GETDATE(),
    [updated_at] DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Inq_Users FOREIGN KEY (engineer_id) REFERENCES Users(id),
    CONSTRAINT FK_Inq_Devices FOREIGN KEY (device_id) REFERENCES Devices(id)
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'工程师在维修现场提交的提问与记录表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'提问的工程师 ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'engineer_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联的机台设备 ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'device_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'故障代码' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'fault_code';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'提问时所处的 SOP 步骤 ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'step_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'提问问题具体描述' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'question';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'现场拍摄的佐证照片 URL' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'photo_url';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'处理状态: pending(待回复), resolved(已回复解决)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'status';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'管理员提供的回复或指导意见' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'answer';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'是否为接口文档定义的“新出现的故障类型”' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'is_new_issue';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录创建时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'created_at';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录最后修改时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'updated_at';
GO

-- 8. 多媒体资源库表 (Media_Assets)
CREATE TABLE [dbo].[Media_Assets] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [name] NVARCHAR(255) NOT NULL,
    [type] NVARCHAR(50) NOT NULL, -- image, video, pdf, doc
    [url] NVARCHAR(MAX) NOT NULL,
    [size] NVARCHAR(50) NULL,
    [tags] NVARCHAR(MAX) NULL, -- 存储 JSON 数组: ["激光器", "手册"]
    [uploader] NVARCHAR(100) NULL,
    [description] NVARCHAR(MAX) NULL,
    [upload_time] DATETIME DEFAULT GETDATE(),
    [created_at] DATETIME DEFAULT GETDATE(),
    [updated_at] DATETIME DEFAULT GETDATE()
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'后台多媒体资源中心管理表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Media_Assets';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'资源显示名称' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Media_Assets', @level2type=N'COLUMN',@level2name=N'name';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'资源类型: image, video, pdf, doc' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Media_Assets', @level2type=N'COLUMN',@level2name=N'type';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'文件存储或访问 URL' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Media_Assets', @level2type=N'COLUMN',@level2name=N'url';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'文件大小 (如: 2.4MB)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Media_Assets', @level2type=N'COLUMN',@level2name=N'size';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'资源标签数组 (JSON)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Media_Assets', @level2type=N'COLUMN',@level2name=N'tags';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'上传者姓名或 ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Media_Assets', @level2type=N'COLUMN',@level2name=N'uploader';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'资源详细描述说明' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Media_Assets', @level2type=N'COLUMN',@level2name=N'description';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录创建时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Media_Assets', @level2type=N'COLUMN',@level2name=N'created_at';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录最后修改时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Media_Assets', @level2type=N'COLUMN',@level2name=N'updated_at';
GO

-- 9. 索引优化
CREATE INDEX IX_Users_Username ON Users(username);
CREATE INDEX IX_Users_EmployeeID ON Users(employee_id);
CREATE INDEX IX_Devices_SN ON Devices(sn);
CREATE INDEX IX_Guides_FaultCode ON Maintenance_Guides(fault_code);
CREATE INDEX IX_Steps_GuideID ON Guide_Steps(guide_id);
CREATE INDEX IX_Inq_Status ON Step_Inquiries(status);
GO

-- 10. 初始化基础菜单数据
INSERT INTO Menus (id, name, sort_order) VALUES 
('dashboard', '统计看板', 1),
('sop_library', '标准 SOP 库', 2),
('inquiries', '现场提问记录', 3),
('media_library', '多媒体资料库', 4),
('user_management', '用户权限管理', 5);
GO

-- 11. 初始化管理员角色菜单权限
INSERT INTO Role_Menus (role, menu_id) VALUES 
('ADMIN', 'dashboard'),
('ADMIN', 'sop_library'),
('ADMIN', 'inquiries'),
('ADMIN', 'media_library'),
('ADMIN', 'user_management');
GO
