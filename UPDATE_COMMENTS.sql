/*
    维修 SOP 系统 - 数据库备注补全脚本 (SQL Server)
    目标数据库: sop
    说明: 为 INIT_DB.sql 中遗漏备注的字段添加 Extended Property
*/

USE [sop];
GO

-- 1. Users 表备注补全
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'部门' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'department';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'状态 (active/disabled)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'status';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'最后登录时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'last_login';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'头像URL' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'avatar_url';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'创建时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Users', @level2type=N'COLUMN',@level2name=N'created_at';
GO

-- 2. Devices 表备注补全
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'设备类型' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Devices', @level2type=N'COLUMN',@level2name=N'type';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'子型号' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Devices', @level2type=N'COLUMN',@level2name=N'sub_model';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'设备状态 (active/maintenance/offline)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Devices', @level2type=N'COLUMN',@level2name=N'status';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'创建时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Devices', @level2type=N'COLUMN',@level2name=N'created_at';
GO

-- 3. Maintenance_Guides 表备注补全
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'指南唯一标识' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联设备ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'device_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'故障分类' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'fault_category';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'操作类型' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'operation_type';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'作用范围/模块' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'scope';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'故障现象描述' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'fault_phenomenon';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'版本号' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'version';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'是否发布' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'published';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'创建时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Maintenance_Guides', @level2type=N'COLUMN',@level2name=N'created_at';
GO

-- 4. Guide_Steps 表备注补全
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'步骤唯一标识' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联指南ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'guide_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'所属阶段' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'stage';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'步骤标题' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'title';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'步骤描述' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'description';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'操作说明' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'instruction';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'安全警告' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'safety_warning';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'是否需要合规确认' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'is_confirmation_required';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'是否启用' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'enabled';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'排序序号' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'sort_order';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'创建时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Guide_Steps', @level2type=N'COLUMN',@level2name=N'created_at';
GO

-- 5. Step_Media 表备注补全
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'资源标识ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Media', @level2type=N'COLUMN',@level2name=N'id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联步骤ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Media', @level2type=N'COLUMN',@level2name=N'step_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'媒体类型 (image/video/pdf)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Media', @level2type=N'COLUMN',@level2name=N'media_type';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'资源URL' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Media', @level2type=N'COLUMN',@level2name=N'url';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'显示顺序' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Media', @level2type=N'COLUMN',@level2name=N'sort_order';
GO

-- 6. Repair_Records 表备注补全
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'记录ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Repair_Records', @level2type=N'COLUMN',@level2name=N'id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联指南ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Repair_Records', @level2type=N'COLUMN',@level2name=N'guide_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'执行工程师ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Repair_Records', @level2type=N'COLUMN',@level2name=N'engineer_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'开始时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Repair_Records', @level2type=N'COLUMN',@level2name=N'start_time';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'结束时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Repair_Records', @level2type=N'COLUMN',@level2name=N'end_time';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'故障原因反馈' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Repair_Records', @level2type=N'COLUMN',@level2name=N'fault_reason';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'处理方案反馈' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Repair_Records', @level2type=N'COLUMN',@level2name=N'treatment';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'状态 (ongoing/completed)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Repair_Records', @level2type=N'COLUMN',@level2name=N'status';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'提交来源 (CLOSE/PASS)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Repair_Records', @level2type=N'COLUMN',@level2name=N'submission_source';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'是否标记为新问题' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Repair_Records', @level2type=N'COLUMN',@level2name=N'is_new_issue';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'创建时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Repair_Records', @level2type=N'COLUMN',@level2name=N'created_at';
GO

-- 7. Record_Completed_Steps 表备注补全
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Record_Completed_Steps', @level2type=N'COLUMN',@level2name=N'id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联记录ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Record_Completed_Steps', @level2type=N'COLUMN',@level2name=N'record_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联步骤ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Record_Completed_Steps', @level2type=N'COLUMN',@level2name=N'step_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'完成时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Record_Completed_Steps', @level2type=N'COLUMN',@level2name=N'completed_at';
GO

-- 8. Step_Inquiries 表备注补全
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'疑问ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'提问工程师ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'engineer_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联指南ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'guide_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联步骤ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'step_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'关联设备ID' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'device_id';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'疑问内容' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'question';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'现场图片URL' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'photo_url';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'处理状态 (pending/resolved)' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'status';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'是否为新问题' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'is_new_issue';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'提交时间' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'Step_Inquiries', @level2type=N'COLUMN',@level2name=N'created_at';
GO
