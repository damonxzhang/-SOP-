
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
  imageUrl?: string;         // 图片
  videoUrl?: string;         // 视频
  judgmentMethod?: string;   // 判断方法
  helpContent?: string;      // 帮助内容
  mediaUrl?: string;         // 保持向下兼容
  mediaType?: 'image' | 'video' | 'pdf';
  pdfUrl?: string;           // 新增：PDF 文档链接
  safetyWarning?: string;
  isConfirmationRequired: boolean;
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
  deviceId: string; // 已有
  question: string;
  photoUrl?: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  // 新增：反馈上下文增强
  context?: {
    faultCode: string;
    stepTitle: string;
    isStepRelated: boolean; // 是针对当前步骤的疑问，还是脱离步骤的新发现
  };
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
  isFinishFeedback: boolean; // 是否是完工时的整体反馈
}

