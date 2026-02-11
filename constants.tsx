
import { Role, Device, MaintenanceGuide, RepairRecord, User, UserPermissions, StepInquiry, RepairRequest } from './types';

export const MOCK_REPAIR_REQUESTS: RepairRequest[] = [
  {
    id: 'req-001',
    deviceId: 'd1',
    deviceName: 'NXT:2050i',
    deviceSN: 'ASML-2050-001',
    faultCode: 'AL-1002',
    priority: 'high',
    requestTime: '2026-02-11 08:30',
    requester: '生产线 A',
    description: '传感器对准频繁报错，对比度低于临界值，需紧急清洗。',
    status: 'pending',
    photos: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400'
    ]
  }
];

const ADMIN_PERMISSIONS: UserPermissions = {
  dashboard: 'manage',
  sopLibrary: 'manage',
  userManagement: 'manage',
  records: 'manage',
  notifications: 'manage'
};

const SENIOR_PERMISSIONS: UserPermissions = {
  dashboard: 'view',
  sopLibrary: 'manage',
  userManagement: 'none',
  records: 'view',
  notifications: 'view'
};

const JUNIOR_PERMISSIONS: UserPermissions = {
  dashboard: 'none',
  sopLibrary: 'view',
  userManagement: 'none',
  records: 'view',
  notifications: 'none'
};

const OUTSOURCED_PERMISSIONS: UserPermissions = {
  dashboard: 'none',
  sopLibrary: 'view',
  userManagement: 'none',
  records: 'none',
  notifications: 'none'
};

export const MOCK_DEVICES: Device[] = [
  { id: 'd1', type: '光刻设备', model: 'NXT:2050i', subModel: '浸没式DUV', sn: 'ASML-2050-001', status: 'maintenance', boundSopIds: ['g1', 'g3'] },
  { id: 'd2', type: '刻蚀设备', model: 'Versys Kiyo45', subModel: '导体刻蚀', sn: 'LAM-KIYO-452', status: 'active', boundSopIds: ['g2', 'g4', 'g5'] },
  { id: 'd3', type: '薄膜沉积', model: 'Producer GT', subModel: 'PECVD', sn: 'AMAT-GT-991', status: 'offline', boundSopIds: [] },
  { id: 'd4', type: '离子注入', model: 'Varian VIISta', subModel: '高能注入', sn: 'VII-STA-042', status: 'active', boundSopIds: [] },
  {
    id: 'r4',
    guideId: 'g1',
    engineerId: 'u1',
    startTime: '2026-02-11T09:00:00Z',
    faultReason: '待定',
    treatment: '正在按 SOP 流程进行传感器清洗...',
    photos: [],
    completedSteps: ['s1'],
    status: 'ongoing'
  },
];

export const MOCK_USER: User = {
  id: 'u1',
  name: '陈工程师',
  role: Role.SENIOR_ENGINEER,
  employeeId: 'TECH-088',
  department: '光学系统部',
  status: 'active',
  lastLogin: '2025-05-15 09:30',
  avatar: 'https://i.pravatar.cc/150?u=u1',
  assignedDeviceIds: ['d1', 'd2'],
  permissions: SENIOR_PERMISSIONS
};

export const ALL_USERS: User[] = [
  MOCK_USER,
  { id: 'u2', name: '王小明', role: Role.JUNIOR_ENGINEER, employeeId: 'TECH-102', department: '制造二部', status: 'active', lastLogin: '2025-05-14 14:20', avatar: 'https://i.pravatar.cc/150?u=u2', assignedDeviceIds: ['d3'], permissions: JUNIOR_PERMISSIONS },
  { id: 'u3', name: '李经理', role: Role.ADMIN, employeeId: 'ADM-001', department: '运维管理处', status: 'active', lastLogin: '2025-05-15 08:00', avatar: 'https://i.pravatar.cc/150?u=u3', assignedDeviceIds: ['d1', 'd2', 'd3', 'd4'], permissions: ADMIN_PERMISSIONS },
  { id: 'u4', name: '张工(外协)', role: Role.OUTSOURCED_ENGINEER, employeeId: 'EXT-552', department: '第三方维保', status: 'active', lastLogin: '2025-05-10 11:00', avatar: 'https://i.pravatar.cc/150?u=u4', assignedDeviceIds: ['d4'], permissions: OUTSOURCED_PERMISSIONS },
];

export const MOCK_GUIDES: MaintenanceGuide[] = [
  {
    id: 'g1',
    deviceId: 'd1',
    faultCode: 'AL-1002',
    faultCategory: '传感器污染',
    operationType: '清洁与校准',
    scope: '光学对准系统',
    faultPhenomenon: '对准标记对比度低 (Alignment Contrast Low)，疑似传感器透镜受污染。',
    version: '2.4.1',
    published: true,
    totalOccurrenceCount: 128,
    steps: [
      { 
        id: 's1', 
        stage: '准备阶段', 
        title: '洁净室内环境核查', 
        description: '确认无尘室等级在 Class 1 以内。查阅《洁净室运行标准手册》以获取详细的环境参数指标。', 
        instruction: '1. 检查压差计数值；2. 确认温湿度在正常范围；3. 检查无尘室入口风淋系统。',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
        judgmentMethod: '压差计数值应在 15-25 Pa 之间。',
        helpContent: '如果压差不足，请联系设施部检查空调系统。',
        mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
        mediaType: 'pdf', 
        safetyWarning: '必须佩戴防静电服与防尘口罩。',
        isConfirmationRequired: true,
        historyRepairCount: 15
      },
      { 
        id: 's2', 
        stage: '诊断阶段', 
        title: '传感器镜头检查', 
        description: '使用高倍率内窥镜检查物镜表面是否存在微尘污染。重点观察边缘区域是否有油脂残留。', 
        instruction: '1. 开启内窥镜；2. 调整焦距对准镜头表面；3. 拍照记录污染情况。',
        imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800', 
        judgmentMethod: '表面不应有肉眼可见的黑点或油膜。',
        helpContent: '若发现油脂，需使用专用 IPA 溶剂。',
        isConfirmationRequired: true,
        historyRepairCount: 45
      },
    ]
  },
  {
    id: 'g2',
    deviceId: 'd2',
    faultCode: 'AL-2005',
    faultCategory: '真空系统泄露',
    operationType: '维修',
    scope: '负载腔室 (Loadlock)',
    faultPhenomenon: '腔室压力无法达到设定阈值，抽真空时间过长。',
    version: '1.0.0',
    published: true,
    totalOccurrenceCount: 45,
    steps: []
  },
  {
    id: 'g3',
    deviceId: 'd1',
    faultCode: 'AL-1005',
    faultCategory: '机械手卡死',
    operationType: '维修',
    scope: '传输系统',
    faultPhenomenon: 'Wafer Handling Robot 在取片过程中停止响应。',
    version: '3.0.2',
    published: true,
    totalOccurrenceCount: 89,
    steps: []
  }
];

export const MOCK_RECORDS: RepairRecord[] = [
  {
    id: 'r1',
    guideId: 'g1',
    engineerId: 'u1',
    startTime: '2025-05-10T09:00:00Z',
    endTime: '2025-05-10T14:30:00Z',
    faultReason: '气浮导轨油垢堆积。',
    treatment: '导轨深度清洁，更换二级滤芯。',
    photos: ['https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=400'],
    completedSteps: ['s1', 's2', 's3'],
    status: 'completed'
  },
  {
    id: 'r2',
    guideId: 'g1',
    engineerId: 'u2',
    startTime: '2025-04-20T10:00:00Z',
    endTime: '2025-04-20T12:00:00Z',
    faultReason: '传感器表面指纹。',
    treatment: '使用无尘布清洁。',
    photos: [],
    completedSteps: ['s1', 's2'],
    status: 'completed'
  },
  {
    id: 'r3',
    guideId: 'g2',
    engineerId: 'u1',
    startTime: '2025-05-12T08:30:00Z',
    endTime: '2025-05-12T10:00:00Z',
    faultReason: '密封圈老化。',
    treatment: '更换全新密封圈。',
    photos: [],
    completedSteps: ['g2s1', 'g2s2'],
    status: 'completed'
  }
];

export const MOCK_INQUIRIES: StepInquiry[] = [
  {
    id: 'inq1',
    engineerId: 'u1',
    deviceId: 'd1',
    guideId: 'g1',
    stepId: 's1',
    question: '洁净室目前的压差指标略低于手册建议，是否可以继续操作？',
    photoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
    timestamp: '2025-05-15T10:30:00Z',
    status: 'pending'
  }
];
