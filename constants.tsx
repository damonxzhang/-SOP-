
import { Role, Device, MaintenanceGuide, RepairRecord, User, UserPermissions, StepInquiry, RepairRequest, MediaResource } from './types';

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

export const MOCK_MEDIA_RESOURCES: MediaResource[] = [
  {
    id: 'm1',
    name: 'NXT:2050i 传感器清洗教学视频.mp4',
    type: 'video',
    url: '#',
    size: '45.2 MB',
    tags: ['教学', 'NXT:2050i', '视频'],
    description: '详细演示了 NXT:2050i 机台传感器的拆卸、清洗及复位校准全过程。',
    uploadTime: '2026-01-20 14:30',
    uploader: '李经理'
  },
  {
    id: 'm2',
    name: 'ASML 设备安全操作规程.pdf',
    type: 'pdf',
    url: '#',
    size: '2.1 MB',
    tags: ['安全', '规程', 'PDF'],
    uploadTime: '2026-02-01 09:15',
    uploader: '李经理'
  },
  {
    id: 'm3',
    name: '传感器污染典型案例图片.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
    size: '1.4 MB',
    tags: ['案例', '图片', '传感器'],
    uploadTime: '2026-02-10 16:45',
    uploader: '陈工程师'
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
        description: '确认洁净室等级满足 ISO 5 标准，且环境湿度在 45%-55% 之间。', 
        instruction: '使用便携式粒子计数器在机台周围四个点位取样。',
        safetyWarning: '非无尘服人员严禁进入操作区域。',
        isConfirmationRequired: true 
      },
      { 
        id: 's2', 
        stage: '诊断阶段', 
        title: '传感器表面状态初检', 
        description: '使用高倍电子内窥镜观察传感器透镜表面，记录污染区域。', 
        instruction: '将内窥镜伸入 A1 检修口，保持距离透镜 5mm。',
        isConfirmationRequired: true 
      },
      { 
        id: 's3', 
        stage: '维修实施', 
        title: '透镜表面深度清洁', 
        description: '使用专用的无尘擦拭棒蘸取少量异丙基酒精，按“由中心向四周”的螺旋轨迹轻轻擦拭。', 
        instruction: '擦拭压力不得超过 5g，防止产生划痕。',
        isConfirmationRequired: true 
      },
      { 
        id: 's4', 
        stage: '测试验证', 
        title: '对比度校准测试', 
        description: '运行系统内置的传感器自校准程序，验证对比度指标。', 
        instruction: '在控制台上点击“Run Calibration”按钮，等待 5 分钟。',
        isConfirmationRequired: true 
      },
      { 
        id: 's5', 
        stage: '完工收尾', 
        title: '工具清理与状态恢复', 
        description: '撤除围挡，清理耗材，将机台状态切换回“Production”模式。', 
        instruction: '在管理系统中上传本次维护的记录照片。',
        isConfirmationRequired: true 
      }
    ]
  },
  {
    id: 'g2',
    deviceId: 'd2',
    faultCode: 'AL-2005',
    faultCategory: '腔室密封失效',
    operationType: '密封件更换',
    scope: '真空处理腔室',
    faultPhenomenon: '腔室真空度无法维持，漏率 (Leak Rate) 超过 5mTorr/min。',
    version: '1.2.0',
    published: true,
    totalOccurrenceCount: 45,
    steps: [
      { 
        id: 'g2s1', 
        stage: '准备阶段', 
        title: '腔室降温与泄压', 
        description: '等待腔室温度降至 40°C 以下，手动关闭隔离阀。', 
        safetyWarning: '严禁在高温高压下开启检修口。',
        isConfirmationRequired: true 
      },
      { 
        id: 'g2s2', 
        stage: '维修实施', 
        title: 'O型圈拆卸与密封面检查', 
        description: '使用非金属起子取下旧密封圈，检查金属密封面是否有微米级划痕。', 
        isConfirmationRequired: true 
      }
    ]
  },
  {
    id: 'g3',
    deviceId: 'd1',
    faultCode: 'AL-1005',
    faultCategory: '机械手卡顿',
    operationType: '润滑与调整',
    scope: '晶圆传输系统',
    faultPhenomenon: 'Wafer Handler 在旋转轴 (Theta Axis) 运动时产生异响并伴随轻微震动。',
    version: '3.0.5',
    published: true,
    totalOccurrenceCount: 89,
    steps: [
      { id: 'g3s1', stage: '准备阶段', title: '机械手锁定', description: '在软件界面执行“Robot E-Stop”指令。', isConfirmationRequired: true }
    ]
  },
  {
    id: 'g4',
    deviceId: 'd2',
    faultCode: 'AL-2012',
    faultCategory: '射频匹配失败',
    operationType: '模块更换',
    scope: '射频电源系统',
    faultPhenomenon: 'RF Matching Network 无法找到匹配点，反射功率 (Reflected Power) 过高。',
    version: '1.0.2',
    published: true,
    totalOccurrenceCount: 32,
    steps: [
      { id: 'g4s1', stage: '准备阶段', title: '断开主电源', description: '拉下 Q1 漏电断路器，并悬挂“正在维修”警示牌。', isConfirmationRequired: true }
    ]
  },
  {
    id: 'g5',
    deviceId: 'd2',
    faultCode: 'AL-2018',
    faultCategory: '冷却水路堵塞',
    operationType: '管路冲洗',
    scope: '温控循环系统',
    faultPhenomenon: 'Chiller 流量告警，热交换器进出口压差异常。',
    version: '1.1.0',
    published: true,
    totalOccurrenceCount: 15,
    steps: [
      { id: 'g5s1', stage: '准备阶段', title: '关闭主供水阀', description: '关闭进水和回水手动球阀。', isConfirmationRequired: true }
    ]
  }
];

export const MOCK_RECORDS: RepairRecord[] = [
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
    createdAt: '2025-05-15T10:30:00Z',
    status: 'pending',
    isNewIssue: false,
    context: {
      faultCode: 'AL-1002',
      stepTitle: '洁净室内环境核查',
      isStepRelated: true
    }
  },
  {
    id: 'inq2',
    engineerId: 'u2',
    deviceId: 'd2',
    guideId: 'g2',
    stepId: 'unknown',
    question: '在执行真空泵维护时，发现外壳有不明液体渗漏，SOP中未提及此情况。',
    createdAt: '2025-05-16T09:15:00Z',
    status: 'pending',
    isNewIssue: true,
    context: {
      faultCode: 'AL-2005',
      stepTitle: '脱离步骤的新发现',
      isStepRelated: false
    }
  },
  {
    id: 'inq3',
    engineerId: 'u3',
    deviceId: 'd1',
    guideId: 'g3',
    stepId: 'unknown',
    question: '在搬运机械手电机时，发现底座固定螺栓有轻微裂纹，这是否属于紧急更换范畴？',
    createdAt: '2026-02-12T14:20:00Z',
    status: 'pending',
    isNewIssue: true,
    context: {
      faultCode: 'AL-1005',
      stepTitle: '机械手底座检查',
      isStepRelated: false
    }
  },
  {
    id: 'inq4',
    engineerId: 'u4',
    deviceId: 'd2',
    guideId: 'g2',
    stepId: 's1',
    question: 'SOP 中提到的密封圈润滑脂型号为 Krytox 240AC，但目前库房只有 240AB，两者是否可以通用？',
    createdAt: '2026-02-13T09:45:00Z',
    status: 'pending',
    isNewIssue: false,
    context: {
      faultCode: 'AL-2005',
      stepTitle: '腔室密封检查',
      isStepRelated: true
    }
  }
];
