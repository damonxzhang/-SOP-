/*
    维修 SOP 系统 - 数据库初始化脚本 (SQL Server)
    目标数据库: sop
    生成时间: 2026-02-15
*/

USE [sop];
GO

-- 1. 用户表 (Users)
CREATE TABLE [dbo].[Users] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [employee_id] NVARCHAR(50) NOT NULL UNIQUE,
    [name] NVARCHAR(100) NOT NULL,
    [role] NVARCHAR(50) NOT NULL,
    [department] NVARCHAR(100) NULL,
    [status] NVARCHAR(20) DEFAULT 'active',
    [last_login] DATETIME NULL,
    [avatar_url] NVARCHAR(MAX) NULL,
    [created_at] DATETIME DEFAULT GETDATE()
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'用户信息表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'用户唯一标识' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'工号' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'employee_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'姓名' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'name';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'角色 (ADMIN, SENIOR_ENGINEER等)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'role';
GO

-- 2. 设备表 (Devices)
CREATE TABLE [dbo].[Devices] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [type] NVARCHAR(100) NOT NULL,
    [model] NVARCHAR(100) NOT NULL,
    [sub_model] NVARCHAR(100) NULL,
    [sn] NVARCHAR(100) NOT NULL UNIQUE,
    [status] NVARCHAR(20) DEFAULT 'active',
    [created_at] DATETIME DEFAULT GETDATE()
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'设备资产表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Devices';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'设备唯一标识' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Devices', @level2type=N'COLUMN',@level2name=N'id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'设备型号' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Devices', @level2type=N'COLUMN',@level2name=N'model';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'序列号 (SN)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Devices', @level2type=N'COLUMN',@level2name=N'sn';
GO

-- 3. 维修指南表 (Maintenance_Guides)
CREATE TABLE [dbo].[Maintenance_Guides] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [device_id] UNIQUEIDENTIFIER NOT NULL,
    [fault_code] NVARCHAR(50) NOT NULL,
    [fault_category] NVARCHAR(100) NULL,
    [operation_type] NVARCHAR(100) NULL,
    [scope] NVARCHAR(100) NULL,
    [fault_phenomenon] NVARCHAR(MAX) NULL,
    [version] NVARCHAR(20) NOT NULL,
    [published] BIT DEFAULT 0,
    [total_occurrence] INT DEFAULT 0,
    [created_at] DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Guides_Devices FOREIGN KEY (device_id) REFERENCES Devices(id)
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'SOP 指南主表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'故障代码 (AL-XXXX)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'fault_code';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'历史总发生次数' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'total_occurrence';
GO

-- 4. 指南步骤表 (Guide_Steps)
CREATE TABLE [dbo].[Guide_Steps] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [guide_id] UNIQUEIDENTIFIER NOT NULL,
    [stage] NVARCHAR(50) NOT NULL,
    [title] NVARCHAR(200) NOT NULL,
    [description] NVARCHAR(MAX) NOT NULL,
    [instruction] NVARCHAR(MAX) NULL,
    [safety_warning] NVARCHAR(MAX) NULL,
    [is_confirmation_required] BIT DEFAULT 1,
    [enabled] BIT DEFAULT 1,
    [history_repair_count] INT DEFAULT 1,
    [sort_order] INT NOT NULL,
    [created_at] DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Steps_Guides FOREIGN KEY (guide_id) REFERENCES Maintenance_Guides(id)
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'SOP 步骤详情表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'反馈次数 (权重排序核心)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'history_repair_count';
GO

-- 5. 步骤多媒体关联表 (Step_Media)
CREATE TABLE [dbo].[Step_Media] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [step_id] UNIQUEIDENTIFIER NOT NULL,
    [media_type] NVARCHAR(20) NOT NULL,
    [url] NVARCHAR(MAX) NOT NULL,
    [sort_order] INT DEFAULT 0,
    CONSTRAINT FK_Media_Steps FOREIGN KEY (step_id) REFERENCES Guide_Steps(id)
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'步骤多媒体资源关联表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Media';
GO

-- 6. 维修记录表 (Repair_Records)
CREATE TABLE [dbo].[Repair_Records] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [guide_id] UNIQUEIDENTIFIER NOT NULL,
    [engineer_id] UNIQUEIDENTIFIER NOT NULL,
    [start_time] DATETIME NOT NULL,
    [end_time] DATETIME NULL,
    [fault_reason] NVARCHAR(MAX) NULL,
    [treatment] NVARCHAR(MAX) NULL,
    [status] NVARCHAR(20) NOT NULL,
    [submission_source] NVARCHAR(20) NULL,
    [is_new_issue] BIT DEFAULT 0,
    [created_at] DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Records_Guides FOREIGN KEY (guide_id) REFERENCES Maintenance_Guides(id),
    CONSTRAINT FK_Records_Users FOREIGN KEY (engineer_id) REFERENCES Users(id)
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'维修执行记录表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Repair_Records';
GO

-- 7. 维修记录完成步骤表 (Record_Completed_Steps)
CREATE TABLE [dbo].[Record_Completed_Steps] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [record_id] UNIQUEIDENTIFIER NOT NULL,
    [step_id] UNIQUEIDENTIFIER NOT NULL,
    [completed_at] DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_CompSteps_Records FOREIGN KEY (record_id) REFERENCES Repair_Records(id),
    CONSTRAINT FK_CompSteps_Steps FOREIGN KEY (step_id) REFERENCES Guide_Steps(id)
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'维修记录与完成步骤关联表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Record_Completed_Steps';
GO

-- 8. 现场疑问与反馈表 (Step_Inquiries)
CREATE TABLE [dbo].[Step_Inquiries] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [engineer_id] UNIQUEIDENTIFIER NOT NULL,
    [guide_id] UNIQUEIDENTIFIER NOT NULL,
    [step_id] UNIQUEIDENTIFIER NULL,
    [device_id] UNIQUEIDENTIFIER NOT NULL,
    [question] NVARCHAR(MAX) NOT NULL,
    [photo_url] NVARCHAR(MAX) NULL,
    [status] NVARCHAR(20) DEFAULT 'pending',
    [is_new_issue] BIT DEFAULT 0,
    [created_at] DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Inq_Users FOREIGN KEY (engineer_id) REFERENCES Users(id),
    CONSTRAINT FK_Inq_Guides FOREIGN KEY (guide_id) REFERENCES Maintenance_Guides(id),
    CONSTRAINT FK_Inq_Steps FOREIGN KEY (step_id) REFERENCES Guide_Steps(id),
    CONSTRAINT FK_Inq_Devices FOREIGN KEY (device_id) REFERENCES Devices(id)
);
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'工程师现场提问与反馈表' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries';
GO

-- 9. 索引优化
CREATE INDEX IX_Devices_SN ON Devices(sn);
CREATE INDEX IX_Guides_FaultCode ON Maintenance_Guides(fault_code);
CREATE INDEX IX_Steps_GuideID ON Guide_Steps(guide_id);
CREATE INDEX IX_Steps_Count ON Guide_Steps(history_repair_count DESC);
CREATE INDEX IX_Records_Engineer ON Repair_Records(engineer_id);
GO
