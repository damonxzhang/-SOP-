
export enum Role {
  JUNIOR_ENGINEER = 'JUNIOR_ENGINEER',
  SENIOR_ENGINEER = 'SENIOR_ENGINEER',
  OUTSOURCED_ENGINEER = 'OUTSOURCED_ENGINEER',
  ADMIN = 'ADMIN'
}

export type UserStatus = 'active' | 'disabled';
export type PermissionLevel = 'none' | 'view' | 'manage';

export interface UserPermissions {
  dashboard: PermissionLevel;
  sopLibrary: PermissionLevel;
  userManagement: PermissionLevel;
  records: PermissionLevel;
  notifications: PermissionLevel;
}

export type ProcessStage = '准备阶段' | '诊断阶段' | '维修实施' | '测试验证' | '完工收尾';

export interface User {
  id: string;
  name: string;
  role: Role;
  employeeId: string;
  username: string;
  department?: string;
  status: UserStatus;
  lastLogin?: string;
  avatar?: string;
  assignedDeviceIds: string[]; 
  permissions: UserPermissions; 
}

export interface Device {
  id: string;
  type: string;
  model: string;
  subModel: string;
  sn: string;
  status: 'active' | 'maintenance' | 'offline';
  boundSopIds: string[]; 
}

export interface GuideStep {
  id: string;
  stage: ProcessStage;
  title: string;
  description: string;
  instruction?: string;      // 操作说明
  imageUrl?: string;         // 图片 (保持兼容)
  imageUrls?: string[];      // 多图片支持
  videoUrl?: string;         // 视频 (保持兼容)
  videoUrls?: string[];      // 多视频支持
  pdfUrl?: string;           // PDF 文档链接 (保持兼容)
  pdfUrls?: string[];        // 多 PDF 支持
  judgmentMethod?: string;   // 判断方法
  helpContent?: string;      // 帮助内容
  mediaUrl?: string;         // 保持向下兼容
  mediaType?: 'image' | 'video' | 'pdf';
  safetyWarning?: string;
  isConfirmationRequired: boolean;
  enabled?: boolean; // 新增：是否启用
  historyRepairCount?: number; // 历史维修次数
  branches?: {
    label: string;
    nextStepId: string;
  }[];
}

export interface MaintenanceGuide {
  id: string;
  deviceId: string; 
  faultCode: string; 
  faultCategory: string; 
  operationType: string; 
  scope: string;        
  faultPhenomenon: string;
  version: string;
  steps: GuideStep[];
  published: boolean;
  totalOccurrenceCount?: number; // 新增：该故障代码历史总发生次数
}

export interface RepairRecord {
  id: string;
  guideId: string;
  engineerId: string;
  startTime: string;
  endTime?: string;
  faultReason: string;
  treatment: string;
  photos: string[];
  completedSteps: string[];
  status: 'ongoing' | 'completed';
  submissionSource?: 'CLOSE' | 'PASS';
  // 新增：反馈上下文
  context?: {
    deviceId: string;
    faultCode: string;
    lastStepId?: string;
    isNewIssue: boolean; // 是否是步骤中未提到的新问题
  };
}

export interface StepInquiry {
  id: string;
  engineerId: string;
  guideId: string;
  stepId: string;
  answer: any;
  answeredAt: any;
  answeredBy: any;
  images?: string[];
  deviceId: string; // 已有
  question: string;
  photoUrl?: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  isNewIssue: boolean; // 是否为新问题
  // 反馈上下文增强
  context?: {
    faultCode: string;
    stepTitle: string;
    isStepRelated: boolean; // 是针对当前步骤的疑问，还是脱离步骤的新发现
    deviceName?: string;    // 设备名称（模拟数据）
    engineerName?: string;  // 提交工程师姓名（模拟数据）
    repairType?: string;    // 报修类型（模拟数据）
  };
}

// 新增：邮件通知定义（模拟接收邮件）
export interface EmailNotification {
  id: string;
  subject: string;        // 邮件主题
  deviceName: string;     // 设备名称
  deviceSN?: string;      // 设备序列号
  faultCode: string;      // 故障代码
  repairType: string;     // 报修类型
  requester: string;      // 提交人
  sendTime: string;       // 提交/推送时间
  feedback: string;       // 反馈意见内容
  inquiryId?: string;     // 关联的现场提问 ID
  status: 'unread' | 'read'; // 邮件状态
}

// 新增：维修申请单定义
export interface RepairRequest {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceSN: string;
  faultCode: string;
  priority: 'low' | 'medium' | 'high';
  requestTime: string;
  requester: string;
  description: string;
  status: 'pending' | 'processing';
  photos?: string[]; // 新增：报修现场照片
}

export interface StatsData {
  faultRanking: { name: string; value: number }[];
  mttrTrend: { date: string; hours: number }[];
  engineerWorkload: { name: string; repairs: number }[];
}

// 新增：SOP 优化反馈定义
export interface SOPImprovementFeedback {
  id: string;
  engineerId: string;
  guideId: string;
  faultCode: string;
  content: string; // 维修过程中的实际操作/建议
  photos: string[];
  status: 'pending' | 'reviewed' | 'applied'; // 待审、已阅、已采纳（用于完善SOP）
  createdAt: string;
}

// 新增：多媒体资料库定义
export interface MediaResource {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'doc';
  url: string;
  size: string;
  tags: string[];
  description?: string; // 新增：文件说明
  uploadTime: string;
  uploader: string;
}

// ============ 预防性维护管理 ============

// 机型分类
export interface MachineTypeInfo {
  id: string;
  name: string;            // 机型名称（如 Y-series、YPM）
  createdAt: string;
}

// 备件基础信息（字典）
export interface SparePart {
  id: string;
  machineType: string;      // 所属机型分类
  code: string;             // 备件编码
  name: string;             // 备件名称
  model: string;            // 型号
  installPosition: string;  // 安装位置
  standardLifecycleDays: number; // 标准更换周期（天）
  safetyFactor: number;     // 安全系数
  operator?: string;        // 维护人
}

// 备件更换记录
export type ReplaceReason = 'periodic' | 'failure'; // 正常周期更换 / 突发故障损坏

export interface ReplacementRecord {
  id: string;
  orderNo: string;          // 更换记录单号（自动生成）
  deviceNo: string;         // 绑定设备编号
  partId: string;           // 备件 ID
  partCode: string;         // 备件编码
  partName: string;         // 备件名称
  model: string;            // 型号
  installPosition: string;  // 安装位置
  replaceDate: string;      // 更换日期
  reason: ReplaceReason;    // 更换原因
  failureReason?: string;   // 失效原因（可选）
  operator: string;         // 操作人
  createdAt: string;
}

// 阈值人工修正日志
export interface ThresholdAdjustLog {
  id: string;
  partId: string;
  partName: string;
  field: string;            // 修改字段（安全系数 / 预警阈值）
  beforeValue: number;
  afterValue: number;
  operator: string;         // 操作人
  operateTime: string;      // 操作时间
}

// 备件预警状态（设备编号 + 型号 + 安装位置 三要素维度）
export interface PartAlertStatus {
  key: string;              // 三要素唯一维度
  deviceNo: string;
  partId: string;
  partCode: string;
  partName: string;
  model: string;
  installPosition: string;
  lastReplaceDate: string;  // 最近更换日期
  thresholdDays: number;    // 预警阈值（天）= 平均寿命 * 安全系数
  usedDays: number;         // 已使用天数
  remainDays: number;       // 剩余天数（<=0 进入红牌）
  level: 'normal' | 'yellow' | 'red'; // 正常 / 黄牌（≤5天）/ 红牌（到期）
  recordsCount: number;     // 历史更换次数
  avgLifecycleDays: number; // 平均实际使用寿命
}
