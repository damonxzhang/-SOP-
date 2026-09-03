import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  HardDrive,
  Users,
  User as UserIcon,
  FileImage,
  FileVideo,
  FileText,
  Edit3,
  Save,
  UploadCloud,
  Database,
  Search,
  Check,
  Download as DownloadIcon,
  Plus,
  X as DeleteIcon,
  History,
  CheckCircle2,
  CheckCircle,
  XCircle,
  Layers,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Target,
  PieChart,
  Activity,
  FileDown,
  ChevronRight,
  Filter,
  BadgeCheck,
  Zap,
  Info,
  ImagePlus,
  Shield,
  Cpu,
  Settings,
  UserPlus,
  UserMinus,
  UserCheck,
  Lock,
  Unlock,
  Send,
  Bell,
  ExternalLink,
  RefreshCcw,
  AlertCircle,
  Tag,
  RotateCcw,
  MessageCircleCode,
  Camera,
  Calendar,
  Wrench,
  Volume2,
  ListChecks
} from 'lucide-react'
import {
  MaintenanceGuide,
  GuideStep,
  ProcessStage,
  User,
  Role,
  PermissionLevel,
  StepInquiry,
  MediaResource,
  Device
} from '../../types'
import { REPAIR_OPTIONS_BY_MODEL, DEFAULT_REPAIR_OPTIONS } from '../../constants'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts'

// 导入抽离的组件
import Dashboard from '../../components/admin/Dashboard'
import SOPLibrary from '../../components/admin/SOPLibrary'
import InquiryList from '../../components/admin/InquiryList'
import MediaLibrary from '../../components/admin/MediaLibrary'
import UserManagement from '../../components/admin/UserManagement'
import PersonalInfo from '../../components/admin/PersonalInfo'
import PreventiveMaintenance from '../../components/admin/PreventiveMaintenance'
import SOPUsageRecord from '../../components/admin/SOPUsageRecord'
import ExecutionOptions from '../../components/admin/ExecutionOptions'
import FaultCategoryManager from '../../components/admin/FaultCategoryManager'
import { MOCK_PARTS, MOCK_RECORDS, computeAlertStatuses } from '../../components/admin/pmShared'
import { isAutoSpeakEnabled, setAutoSpeakEnabled, notifyAutoSpeakChanged } from '../../components/admin/autoSpeak'

const STAGES: ProcessStage[] = [
  '准备阶段',
  '诊断阶段',
  '维修实施',
  '测试验证',
  '完工收尾'
]
const DEPARTMENTS = [
  '光学系统部',
  '制造二部',
  '运维管理处',
  '第三方维保',
  '工艺控制部'
]

// 模拟测试数据：现场提问记录（后端接口不可用时用于演示）
const MOCK_INQUIRIES: StepInquiry[] = [
  {
    id: 'inq-001',
    engineerId: 'engineer-001',
    guideId: 'guide-001',
    stepId: 'step-3',
    deviceId: 'device-001',
    question: '更换激光器模块后重新对位，发现光斑偏移量超标 0.8mm，是否可以直接执行粗校准流程？',
    photoUrl: '',
    status: 'pending',
    createdAt: '2026-05-10 09:15:00',
    isNewIssue: false,
    answer: null,
    answeredAt: null,
    answeredBy: null,
    context: {
      faultCode: 'E102',
      stepTitle: '激光器模块更换',
      isStepRelated: true,
      deviceName: 'ASML 光刻机 TWINSCAN NXT:2000i',
      engineerName: '张伟',
      repairType: '激光器模块更换'
    }
  },
  {
    id: 'inq-002',
    engineerId: 'engineer-002',
    guideId: 'guide-002',
    stepId: 'step-5',
    deviceId: 'device-002',
    question: '机械臂在取放晶圆时出现异响，检查导轨未见明显磨损，怀疑是减速机间隙过大，如何处理？',
    photoUrl: '',
    status: 'pending',
    createdAt: '2026-05-10 10:42:00',
    isNewIssue: false,
    answer: null,
    answeredAt: null,
    answeredBy: null,
    context: {
      faultCode: 'E204',
      stepTitle: '机械臂导轨检查',
      isStepRelated: true,
      deviceName: '晶圆搬运机械臂 IRB 6700',
      engineerName: '李强',
      repairType: '机械臂异响排查'
    }
  },
  {
    id: 'inq-003',
    engineerId: 'engineer-003',
    guideId: 'guide-003',
    stepId: 'step-2',
    deviceId: 'device-003',
    question: '真空腔体抽真空时间由 15 分钟延长至 40 分钟，密封圈目视无破损，是否需要进行泄漏检测？',
    photoUrl: '',
    status: 'resolved',
    createdAt: '2026-05-09 16:20:00',
    isNewIssue: false,
    answer: '已安排氦质谱检漏，确认腔体法兰处密封圈老化，更换后恢复正常。',
    answeredAt: '2026-05-09 17:05:00',
    answeredBy: '王工',
    context: {
      faultCode: 'E310',
      stepTitle: '真空腔体密封检查',
      isStepRelated: true,
      deviceName: '离子注入机 VIISta 900',
      engineerName: '赵敏',
      repairType: '真空泄漏排查'
    }
  },
  {
    id: 'inq-004',
    engineerId: 'engineer-004',
    guideId: 'guide-004',
    stepId: 'unknown',
    deviceId: 'device-004',
    question: '刻蚀过程中晶圆边缘出现不均匀刻蚀，SOP 步骤中未提到该现象，怀疑是新出现的故障类型，请求支援！',
    photoUrl: '',
    status: 'pending',
    createdAt: '2026-05-10 11:08:00',
    isNewIssue: true,
    answer: null,
    answeredAt: null,
    answeredBy: null,
    context: {
      faultCode: 'E415',
      stepTitle: '边缘刻蚀不均（新问题）',
      isStepRelated: false,
      deviceName: '等离子刻蚀机 Lam 9600',
      engineerName: '陈杰',
      repairType: '刻蚀均匀性异常'
    }
  },
  {
    id: 'inq-005',
    engineerId: 'engineer-001',
    guideId: 'guide-005',
    stepId: 'step-1',
    deviceId: 'device-005',
    question: '光刻胶涂布厚度检测偏差超出规格 ±0.5μm，已按 SOP 重新校准匀胶机转速，请求确认参数是否在合理范围。',
    photoUrl: '',
    status: 'resolved',
    createdAt: '2026-05-08 14:30:00',
    isNewIssue: false,
    answer: '转速参数已确认，偏差属于匀胶机老化导致，已安排预防性保养。',
    answeredAt: '2026-05-08 15:10:00',
    answeredBy: '王工',
    context: {
      faultCode: 'E506',
      stepTitle: '匀胶机校准',
      isStepRelated: true,
      deviceName: '涂胶显影机 TEL Track ACT-8',
      engineerName: '张伟',
      repairType: '光刻胶涂布偏差'
    }
  },
  {
    id: 'inq-006',
    engineerId: 'engineer-005',
    guideId: 'guide-006',
    stepId: 'step-4',
    deviceId: 'device-006',
    question: '设备报警显示冷却水流量不足，但流量计读数正常，怀疑传感器漂移，请问如何验证？',
    photoUrl: '',
    status: 'pending',
    createdAt: '2026-05-10 08:55:00',
    isNewIssue: false,
    answer: null,
    answeredAt: null,
    answeredBy: null,
    context: {
      faultCode: 'E601',
      stepTitle: '冷却水流量校验',
      isStepRelated: true,
      deviceName: '扩散炉 TEL aA12',
      engineerName: '刘洋',
      repairType: '冷却水流量报警'
    }
  }
]

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('统计看板')
  // 过期备件数量（红牌），用于侧边栏角标展示
  const expiredCount = useMemo(
    () => computeAlertStatuses(MOCK_RECORDS, MOCK_PARTS).filter((a) => a.level === 'red').length,
    []
  )
  // 语音自动播报开关（默认关闭）
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => isAutoSpeakEnabled())
  const handleToggleAutoSpeak = () => {
    const next = !autoSpeak
    setAutoSpeak(next)
    setAutoSpeakEnabled(next)
    notifyAutoSpeakChanged()
  }
  const [guides, setGuides] = useState<MaintenanceGuide[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [inquiries, setInquiries] = useState<StepInquiry[]>(MOCK_INQUIRIES)
  const [mediaResources, setMediaResources] = useState<MediaResource[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [mediaSearch, setMediaSearch] = useState('')
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all')

  // 分页状态
  const [pagination, setPagination] = useState({
    guides: { page: 1, limit: 10, total: 0 },
    users: { page: 1, limit: 10, total: 0 },
    devices: { page: 1, limit: 10, total: 0 },
    inquiries: { page: 1, limit: 3, total: 0 },
    media: { page: 1, limit: 10, total: 0 }
  })

  // 使用 ref 来追踪 pagination 的当前值，避免闭包问题
  const paginationRef = useRef(pagination)
  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  // 按模块获取数据的函数
  const fetchModuleData = async (
    module: string,
    overridePagination?: { page: number; limit: number }
  ) => {
    try {
      const currentPagination = paginationRef.current

      switch (module) {
        case 'guides': {
          const page = overridePagination?.page ?? currentPagination.guides.page
          const limit =
            overridePagination?.limit ?? currentPagination.guides.limit
          const res = await fetch('/backend/guides/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page, limit })
          }).then((r) => r.json())

          if (res.code === 200 && res.data?.list) {
            setGuides(res.data.list)
            setPagination((prev) => ({
              ...prev,
              guides: {
                page: res.data.pagination?.page || page,
                limit: res.data.pagination?.limit || limit,
                total: res.data.pagination?.total || 0
              }
            }))
          }
          break
        }
        case 'users': {
          const page = overridePagination?.page ?? currentPagination.users.page
          const limit =
            overridePagination?.limit ?? currentPagination.users.limit
          const res = await fetch('/backend/users/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page, limit })
          }).then((r) => r.json())

          if (res.code === 200 && res.data?.list) {
            const mappedUsers = res.data.list.map((u: any) => ({
              ...u,
              role:
                u.role === 'ADMIN'
                  ? Role.ADMIN
                  : u.role === 'SENIOR_ENGINEER'
                    ? Role.SENIOR_ENGINEER
                    : u.role === 'OUTSOURCED_ENGINEER'
                      ? Role.OUTSOURCED_ENGINEER
                      : Role.JUNIOR_ENGINEER
            }))
            setUsers(mappedUsers)
            setPagination((prev) => ({
              ...prev,
              users: {
                page: res.data.pagination?.page || page,
                limit: res.data.pagination?.limit || limit,
                total: res.data.pagination?.total || 0
              }
            }))
          }
          break
        }
        case 'devices': {
          const page =
            overridePagination?.page ?? currentPagination.devices.page
          const limit =
            overridePagination?.limit ?? currentPagination.devices.limit
          const res = await fetch('/backend/devices/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page, limit })
          }).then((r) => r.json())

          if (res.code === 200 && res.data?.list) {
            setDevices(res.data.list)
            setPagination((prev) => ({
              ...prev,
              devices: {
                page: res.data.pagination?.page || page,
                limit: res.data.pagination?.limit || limit,
                total: res.data.pagination?.total || 0
              }
            }))
          }
          break
        }
        case 'inquiries': {
          const page =
            overridePagination?.page ?? currentPagination.inquiries.page
          const limit =
            overridePagination?.limit ?? currentPagination.inquiries.limit
          const res = await fetch('/backend/inquiries/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page, limit })
          }).then((r) => r.json())

          if (res.code === 200 && res.data?.list) {
            setInquiries(res.data.list)
            setPagination((prev) => ({
              ...prev,
              inquiries: {
                page: res.data.pagination?.page || page,
                limit: res.data.pagination?.limit || limit,
                total: res.data.pagination?.total || 0
              }
            }))
          }
          break
        }
        case 'media': {
          const page = overridePagination?.page ?? currentPagination.media.page
          const limit =
            overridePagination?.limit ?? currentPagination.media.limit
          const res = await fetch('/backend/media/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page, limit })
          }).then((r) => r.json())

          if (res.code === 200 && res.data?.list) {
            setMediaResources(res.data.list)
            setPagination((prev) => ({
              ...prev,
              media: {
                page: res.data.pagination?.page || page,
                limit: res.data.pagination?.limit || limit,
                total: res.data.pagination?.total || 0
              }
            }))
          }
          break
        }
        case 'currentUser': {
          const res = await fetch('/backend/auth/current-user').then((r) =>
            r.json()
          )
          if (res.code === 200) {
            const u = res.data
            setCurrentUser({
              ...u,
              role:
                u.role === 'ADMIN'
                  ? Role.ADMIN
                  : u.role === 'SENIOR_ENGINEER'
                    ? Role.SENIOR_ENGINEER
                    : u.role === 'OUTSOURCED_ENGINEER'
                      ? Role.OUTSOURCED_ENGINEER
                      : Role.JUNIOR_ENGINEER,
              avatar: u.avatar_url || u.avatar,
              assignedDeviceIds: [],
              permissions: u.permissions || {
                dashboard: 'manage',
                sopLibrary: 'manage',
                userManagement: 'manage',
                records: 'manage',
                notifications: 'manage'
              }
            } as User)
          }
          break
        }
      }
    } catch (err) {
      console.error(`Failed to fetch ${module} data:`, err)
    }
  }

  // 初始加载和 tab 切换时获取数据
  useEffect(() => {
    const moduleMap: Record<string, string> = {
      统计看板: 'currentUser',
      '标准 SOP 库': 'guides',
      现场提问记录: 'inquiries',
      多媒体资料库: 'media',
      用户权限管理: 'users',
      个人信息: 'currentUser'
    }
    const module = moduleMap[activeTab] || 'currentUser'
    fetchModuleData(module)
  }, [activeTab])

  // 分页处理函数
  const handlePageChange = (module: string, page: number) => {
    const currentPagination = paginationRef.current
    const limit =
      currentPagination[module as keyof typeof currentPagination].limit
    fetchModuleData(module, { page, limit })
  }

  const [editingGuide, setEditingGuide] = useState<MaintenanceGuide | null>(
    null
  )
  // SOP 编辑器弹窗内：设备机型筛选（联动「关联设备」下拉框）
  const [guideDeviceModel, setGuideDeviceModel] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [addingUser, setAddingUser] = useState<boolean>(false)
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    employeeId: '',
    username: '',
    role: Role.JUNIOR_ENGINEER,
    status: 'active',
    department: '',
    avatar: ''
  })
  const [viewingInquiry, setViewingInquiry] = useState<StepInquiry | null>(null)
  const [editingInquiry, setEditingInquiry] = useState<StepInquiry | null>(null)
  const [editAnswer, setEditAnswer] = useState('')
  const [viewingMedia, setViewingMedia] = useState<MediaResource | null>(null)
  const [editingMedia, setEditingMedia] = useState<MediaResource | null>(null)
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([])
  const [mediaSelectionSearch, setMediaSelectionSearch] = useState('')
  const [selectingMediaForStep, setSelectingMediaForStep] = useState<{
    stepIndex: number
    type: 'image' | 'video' | 'pdf' | 'doc'
  } | null>(null)
  const [uploadingMedia, setUploadingMedia] =
    useState<Partial<MediaResource> | null>(null)
  const [newTag, setNewTag] = useState('')

  // SOP 库筛选状态
  const [guideSearch, setGuideSearch] = useState('')
  const [guideDeviceFilter, setGuideDeviceFilter] = useState('all')
  const [guideCategoryFilter, setGuideCategoryFilter] = useState('all')

  // 现场提问记录筛选状态
  const [inquiryFaultCodeFilter, setInquiryFaultCodeFilter] = useState('')
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<
    'all' | 'pending' | 'resolved'
  >('all')

  const uniqueCategories = useMemo(() => {
    const categories = guides.map((g) => g.faultCategory)
    return Array.from(new Set(categories))
  }, [guides])

  const filteredGuidesList = useMemo(() => {
    return guides.filter((g) => {
      const searchLower = guideSearch.toLowerCase()
      const matchSearch =
        g.faultCode.toLowerCase().includes(searchLower) ||
        g.faultCategory.toLowerCase().includes(searchLower)
      const matchDevice =
        guideDeviceFilter === 'all' || g.deviceId === guideDeviceFilter
      const matchCategory =
        guideCategoryFilter === 'all' || g.faultCategory === guideCategoryFilter
      return matchSearch && matchDevice && matchCategory
    })
  }, [guides, guideSearch, guideDeviceFilter, guideCategoryFilter])

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      if (inquiryStatusFilter !== 'all' && inq.status !== inquiryStatusFilter)
        return false
      if (!inquiryFaultCodeFilter) return true
      const guide = guides.find((g) => g.id === inq.guideId)
      const faultCode = inq.isNewIssue
        ? inq.context?.faultCode || ''
        : guide?.faultCode || inq.context?.faultCode || ''
      return faultCode
        .toLowerCase()
        .includes(inquiryFaultCodeFilter.toLowerCase())
    })
  }, [inquiries, inquiryFaultCodeFilter, inquiryStatusFilter])

  // 移除“故障概率建模”，保留其他模块
  const navItems = [
    { id: '统计看板', icon: <LayoutDashboard size={18} />, label: '统计看板' },
    { id: '标准 SOP 库', icon: <BookOpen size={18} />, label: '标准 SOP 库' },
    {
      id: '现场提问记录',
      icon: <MessageSquare size={18} />,
      label: '现场提问记录'
    },
    {
      id: '预防性维护管理',
      icon: <Wrench size={18} />,
      label: '预防性维护管理'
    },
    {
      id: 'SOP 库的使用记录',
      icon: <History size={18} />,
      label: 'SOP 库的使用记录'
    },
    {
      id: '故障分类管理',
      icon: <Tag size={18} />,
      label: '故障分类管理'
    },
    {
      id: '执行说明选项管理',
      icon: <ListChecks size={18} />,
      label: '执行说明选项管理'
    },
    {
      id: '多媒体资料库',
      icon: <HardDrive size={18} />,
      label: '多媒体资料库'
    },
    { id: '用户权限管理', icon: <Users size={18} />, label: '用户权限管理' },
    { id: '个人信息', icon: <UserIcon size={18} />, label: '个人信息' }
  ]

  const handleSaveGuide = (data: MaintenanceGuide) => {
    setGuides((prev) => {
      const exists = prev.find((g) => g.id === data.id)
      if (exists) return prev.map((g) => (g.id === data.id ? data : g))
      return [data, ...prev]
    })
    setEditingGuide(null)
  }

  const handleSaveUser = (data: User) => {
    setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)))
    setEditingUser(null)
  }

  const handleAddUser = async (userData: Partial<User>) => {
    try {
      const response = await fetch('/backend/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const result = await response.json()
      if (result.code === 200) {
        const newUser = result.data
        setUsers((prev) => [newUser, ...prev])
        setAddingUser(false)
        setNewUser({
          name: '',
          employeeId: '',
          username: '',
          role: Role.JUNIOR_ENGINEER,
          status: 'active',
          department: '',
          avatar: ''
        })
      } else {
        alert('添加用户失败: ' + result.message)
      }
    } catch (error) {
      console.error('Failed to add user:', error)
      // 后端接口未准备好时，依然在前端模拟添加，方便调试演示
      const mockNewUser: User = {
        id: `u${Date.now()}`,
        name: userData.name || '',
        employeeId: userData.employeeId || '',
        username: userData.username || '',
        role: userData.role || Role.JUNIOR_ENGINEER,
        status: userData.status || 'active',
        department: userData.department || '',
        avatar: userData.avatar || '',
        lastLogin: null,
        assignedDeviceIds: [],
        permissions: {
          dashboard: 'view',
          sopLibrary: 'view',
          userManagement: 'none',
          records: 'view',
          notifications: 'view'
        }
      }
      setUsers((prev) => [mockNewUser, ...prev])
      setAddingUser(false)
      setNewUser({
        name: '',
        employeeId: '',
        username: '',
        role: Role.JUNIOR_ENGINEER,
        status: 'active',
        department: '',
        avatar: ''
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除这个用户吗？此操作不可撤销。')) {
      return
    }

    try {
      const response = await fetch('/backend/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      })

      const result = await response.json()
      if (result.code === 200) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
      } else {
        alert('删除用户失败: ' + result.message)
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      // 后端接口未准备好时，依然在前端模拟删除，方便调试演示
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    }
  }

  const renderAddUserModal = () => {
    if (!addingUser) return null

    return (
      <div className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in'>
        <div className='bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20'>
          <div className='px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white'>
            <div className='flex items-center space-x-5'>
              <div className='w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3'>
                <UserPlus size={28} />
              </div>
              <div>
                <h3 className='text-xl font-black text-slate-900'>
                  邀请新工程师
                </h3>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1'>
                  创建新用户账户
                </p>
              </div>
            </div>
            <button
              onClick={() => setAddingUser(false)}
              className='p-3 hover:bg-slate-100 rounded-2xl transition-all'>
              <DeleteIcon size={24} />
            </button>
          </div>

          <div className='p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar'>
            <div className='space-y-6'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  姓名
                </label>
                <input
                  type='text'
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                  value={newUser.name || ''}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                />
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  工号
                </label>
                <input
                  type='text'
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                  value={newUser.employeeId || ''}
                  onChange={(e) =>
                    setNewUser({ ...newUser, employeeId: e.target.value })
                  }
                />
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  用户名
                </label>
                <input
                  type='text'
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                  value={newUser.username || ''}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                />
              </div>

              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    部门
                  </label>
                  <select
                    className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                    value={newUser.department || ''}
                    onChange={(e) =>
                      setNewUser({ ...newUser, department: e.target.value })
                    }>
                    <option value=''>请选择部门</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    角色
                  </label>
                  <select
                    className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                    value={newUser.role || Role.JUNIOR_ENGINEER}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value as Role })
                    }>
                    <option value={Role.ADMIN}>ADMIN</option>
                    <option value={Role.SENIOR_ENGINEER}>
                      SENIOR_ENGINEER
                    </option>
                    <option value={Role.JUNIOR_ENGINEER}>
                      JUNIOR_ENGINEER
                    </option>
                    <option value={Role.OUTSOURCED_ENGINEER}>
                      OUTSOURCED_ENGINEER
                    </option>
                  </select>
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  状态
                </label>
                <div className='flex space-x-4'>
                  <label className='flex items-center space-x-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='newUserStatus'
                      value='active'
                      checked={newUser.status === 'active'}
                      onChange={() =>
                        setNewUser({ ...newUser, status: 'active' })
                      }
                      className='w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded'
                    />
                    <span className='text-sm font-black text-slate-700'>
                      正常
                    </span>
                  </label>
                  <label className='flex items-center space-x-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='newUserStatus'
                      value='disabled'
                      checked={newUser.status === 'disabled'}
                      onChange={() =>
                        setNewUser({ ...newUser, status: 'disabled' })
                      }
                      className='w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded'
                    />
                    <span className='text-sm font-black text-slate-700'>
                      已冻结
                    </span>
                  </label>
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  头像 URL
                </label>
                <input
                  type='text'
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                  value={newUser.avatar || ''}
                  onChange={(e) =>
                    setNewUser({ ...newUser, avatar: e.target.value })
                  }
                  placeholder='输入头像图片 URL'
                />
              </div>
            </div>
          </div>

          <div className='px-10 py-8 border-t border-slate-100 flex items-center justify-end bg-slate-50/50'>
            <button
              onClick={() => setAddingUser(false)}
              className='px-8 py-3 text-slate-500 font-black text-sm hover:text-slate-800 transition-colors mr-4'>
              取消
            </button>
            <button
              onClick={() => handleAddUser(newUser)}
              disabled={
                !newUser.name || !newUser.employeeId || !newUser.username
              }
              className={`px-12 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center ${newUser.name && newUser.employeeId && newUser.username ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
              <Save size={18} className='mr-2' /> 创建用户
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleToggleGuideStatus = async (guideId: string) => {
    const targetGuide = guides.find((g) => g.id === guideId)
    if (!targetGuide) return

    const newStatus = !targetGuide.published

    try {
      // 这里的路径应根据后端实际部署环境调整，此处采用文档定义的规范
      const response = await fetch(`/backend/guides/${guideId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: newStatus })
      })

      const result = await response.json()
      if (result.code === 200) {
        setGuides((prev) =>
          prev.map((g) =>
            g.id === guideId ? { ...g, published: newStatus } : g
          )
        )
      }
    } catch (error) {
      console.error('Failed to update SOP status:', error)
      // 后端接口未准备好时，依然在前端模拟切换，方便调试演示
      setGuides((prev) =>
        prev.map((g) => (g.id === guideId ? { ...g, published: newStatus } : g))
      )
    }
  }

  // 打开 SOP 编辑器时同步设备机型筛选（依据该指南已关联的设备）
  const handleOpenGuideEditor = (guide: MaintenanceGuide) => {
    setGuideDeviceModel(
      devices.find((d) => d.id === guide.deviceId)?.model || ''
    )
    setEditingGuide(guide)
  }

  const renderContent = () => {
    switch (activeTab) {
      case '统计看板':
        return <Dashboard inquiries={inquiries} />
      case '标准 SOP 库':
        return (
          <SOPLibrary
            guides={guides}
            devices={devices}
            onSaveGuide={handleSaveGuide}
            onToggleGuideStatus={handleToggleGuideStatus}
            onEditGuide={handleOpenGuideEditor}
            guideSearch={guideSearch}
            setGuideSearch={setGuideSearch}
            guideDeviceFilter={guideDeviceFilter}
            setGuideDeviceFilter={setGuideDeviceFilter}
            pagination={pagination.guides}
            onPageChange={(page) => handlePageChange('guides', page)}
          />
        )
      case '现场提问记录':
        return (
          <InquiryList
            inquiries={inquiries}
            filteredInquiries={filteredInquiries}
            inquiryFaultCodeFilter={inquiryFaultCodeFilter}
            setInquiryFaultCodeFilter={setInquiryFaultCodeFilter}
            inquiryStatusFilter={inquiryStatusFilter}
            setInquiryStatusFilter={setInquiryStatusFilter}
            onViewInquiry={setViewingInquiry}
            onEditInquiry={(inq) => {
              setEditAnswer(inq.answer || '')
              setEditingInquiry(inq)
            }}
            pagination={pagination.inquiries}
            onPageChange={(page) => handlePageChange('inquiries', page)}
          />
        )
      case '预防性维护管理':
        return <PreventiveMaintenance isAdmin={currentUser?.role === Role.ADMIN} />
      case '故障分类管理':
        return <FaultCategoryManager />
      case '执行说明选项管理':
        return <ExecutionOptions />
      case 'SOP 库的使用记录':
        return (
          <SOPUsageRecord guides={guides} devices={devices} users={users} />
        )
      case '多媒体资料库':
        return (
          <MediaLibrary
            mediaResources={mediaResources}
            mediaSearch={mediaSearch}
            setMediaSearch={setMediaSearch}
            mediaTypeFilter={mediaTypeFilter}
            setMediaTypeFilter={setMediaTypeFilter}
            onViewMedia={setViewingMedia}
            onEditMedia={setEditingMedia}
            onDeleteMedia={(id) => {
              setMediaResources(mediaResources.filter((m) => m.id !== id))
            }}
            onUploadMedia={() => {
              setUploadingMedia({
                name: '',
                type: 'image',
                tags: []
              })
            }}
            pagination={pagination.media}
            onPageChange={(page) => handlePageChange('media', page)}
          />
        )
      case '用户权限管理':
        return (
          <UserManagement
            users={users}
            isLoadingUsers={isLoadingUsers}
            onEditUser={setEditingUser}
            onAddUser={() => setAddingUser(true)}
            onDeleteUser={handleDeleteUser}
            pagination={pagination.users}
            onPageChange={(page) => handlePageChange('users', page)}
          />
        )
      case '个人信息':
        return <PersonalInfo currentUser={currentUser} inquiries={inquiries} />
      default:
        return <Dashboard inquiries={inquiries} />
    }
  }

  const renderMediaSelectionModal = () => {
    if (!selectingMediaForStep || !editingGuide) return null

    const filteredResources = mediaResources.filter((r) => {
      // 首先根据类型过滤
      let typeMatch = true
      if (selectingMediaForStep.type === 'image') typeMatch = r.type === 'image'
      else if (selectingMediaForStep.type === 'video')
        typeMatch = r.type === 'video'
      else if (selectingMediaForStep.type === 'pdf')
        typeMatch = r.type === 'pdf' || r.type === 'doc'

      // 然后根据搜索词过滤（匹配名称或标签）
      const searchLower = mediaSelectionSearch.toLowerCase()
      const searchMatch =
        !mediaSelectionSearch ||
        r.name.toLowerCase().includes(searchLower) ||
        r.tags.some((tag) => tag.toLowerCase().includes(searchLower))

      return typeMatch && searchMatch
    })

    const handleToggleSelect = (id: string) => {
      setSelectedMediaIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      )
    }

    const handleConfirmSelection = () => {
      if (!selectingMediaForStep || !editingGuide) return

      const selectedResources = mediaResources.filter((r) =>
        selectedMediaIds.includes(r.id)
      )
      const urls = selectedResources.map((r) => r.url)

      const newSteps = [...editingGuide.steps]
      const idx = selectingMediaForStep.stepIndex
      const type = selectingMediaForStep.type

      if (type === 'image') {
        newSteps[idx].imageUrls = [...(newSteps[idx].imageUrls || []), ...urls]
        // 保持单字段兼容
        if (!newSteps[idx].imageUrl && urls.length > 0)
          newSteps[idx].imageUrl = urls[0]
      } else if (type === 'video') {
        newSteps[idx].videoUrls = [...(newSteps[idx].videoUrls || []), ...urls]
        if (!newSteps[idx].videoUrl && urls.length > 0)
          newSteps[idx].videoUrl = urls[0]
      } else if (type === 'pdf') {
        newSteps[idx].pdfUrls = [...(newSteps[idx].pdfUrls || []), ...urls]
        if (!newSteps[idx].pdfUrl && urls.length > 0)
          newSteps[idx].pdfUrl = urls[0]
      }

      setEditingGuide({ ...editingGuide, steps: newSteps })
      setSelectingMediaForStep(null)
      setSelectedMediaIds([])
      setMediaSelectionSearch('')
    }

    return (
      <div className='fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in'>
        <div className='bg-white w-full max-w-4xl h-[85vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20'>
          <div className='px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10'>
            <div className='flex items-center space-x-5'>
              <div className='w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3'>
                <Database size={28} />
              </div>
              <div>
                <h3 className='text-xl font-black text-slate-900'>
                  从数字化资源库选择
                </h3>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1'>
                  正在为第 {selectingMediaForStep.stepIndex + 1} 步选择{' '}
                  {selectingMediaForStep.type === 'image'
                    ? '图片'
                    : selectingMediaForStep.type === 'video'
                      ? '视频'
                      : '文档'}{' '}
                  (支持多选)
                </p>
              </div>
            </div>

            <div className='flex-1 max-w-xs mx-8 relative'>
              <Search
                className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-300'
                size={16}
              />
              <input
                type='text'
                placeholder='搜索资源名称或标签...'
                className='w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all'
                value={mediaSelectionSearch}
                onChange={(e) => setMediaSelectionSearch(e.target.value)}
              />
            </div>

            <div className='flex items-center space-x-4'>
              {selectedMediaIds.length > 0 && (
                <button
                  onClick={handleConfirmSelection}
                  className='px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all'>
                  确认选择 ({selectedMediaIds.length})
                </button>
              )}
              <button
                onClick={() => {
                  setSelectingMediaForStep(null)
                  setSelectedMediaIds([])
                  setMediaSelectionSearch('')
                }}
                className='p-3 hover:bg-slate-100 rounded-2xl transition-all'>
                <DeleteIcon size={24} />
              </button>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-10 bg-slate-50/30'>
            {filteredResources.length > 0 ? (
              <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
                {filteredResources.map((resource) => {
                  const isSelected = selectedMediaIds.includes(resource.id)
                  return (
                    <div
                      key={resource.id}
                      onClick={() => handleToggleSelect(resource.id)}
                      className={`bg-white p-4 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md' : 'border-slate-200 shadow-sm hover:border-indigo-300'}`}>
                      <div className='aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-4 flex items-center justify-center relative'>
                        {resource.type === 'image' ? (
                          <img
                            src={resource.url}
                            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                            alt=''
                          />
                        ) : resource.type === 'video' ? (
                          <FileVideo size={32} className='text-slate-300' />
                        ) : (
                          <FileText size={32} className='text-slate-300' />
                        )}
                        {isSelected && (
                          <div className='absolute top-2 right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300'>
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                      <h4 className='text-xs font-black text-slate-800 truncate mb-1'>
                        {resource.name}
                      </h4>
                      {resource.description && (
                        <p className='text-[9px] text-slate-400 line-clamp-1 italic mb-2'>
                          备注: {resource.description}
                        </p>
                      )}
                      <div className='flex items-center justify-between'>
                        <span className='text-[9px] font-black text-slate-400 uppercase tracking-tight'>
                          {resource.size}
                        </span>
                        <div className='flex gap-1'>
                          {resource.tags.slice(0, 1).map((t) => (
                            <span
                              key={t}
                              className='text-[8px] px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded-md border border-slate-100'>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='h-full flex flex-col items-center justify-center text-slate-300'>
                <Search size={48} className='mb-4 opacity-20' />
                <p className='text-sm font-black uppercase tracking-widest'>
                  资源库中暂无匹配的资料
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderMediaViewModal = () => {
    if (!viewingMedia) return null

    return (
      <div className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in'>
        <div className='bg-white w-full max-w-5xl h-[85vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20'>
          <div className='px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white'>
            <div className='flex items-center space-x-5'>
              <div className='w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3'>
                {viewingMedia.type === 'image' && <FileImage size={28} />}
                {viewingMedia.type === 'video' && <FileVideo size={28} />}
                {(viewingMedia.type === 'pdf' ||
                  viewingMedia.type === 'doc') && <FileText size={28} />}
              </div>
              <div>
                <h3 className='text-xl font-black text-slate-900'>
                  {viewingMedia.name}
                </h3>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1'>
                  {viewingMedia.type.toUpperCase()} · {viewingMedia.size} ·{' '}
                  {viewingMedia.uploadTime} 上传
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <button className='p-3 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all'>
                <DownloadIcon size={20} />
              </button>
              <button
                onClick={() => setViewingMedia(null)}
                className='p-3 hover:bg-slate-100 rounded-2xl transition-all'>
                <DeleteIcon size={24} />
              </button>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center p-10'>
            {viewingMedia.type === 'image' && (
              <img
                src={viewingMedia.url}
                className='max-w-full max-h-full rounded-3xl shadow-2xl object-contain'
                alt={viewingMedia.name}
              />
            )}
            {viewingMedia.type === 'video' && (
              <div className='w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center relative'>
                <FileVideo size={80} className='text-white/20' />
                <p className='absolute bottom-10 text-white/40 text-xs font-mono'>
                  VIDEO_STREAM_PREVIEW_MOCK
                </p>
              </div>
            )}
            {(viewingMedia.type === 'pdf' || viewingMedia.type === 'doc') && (
              <div className='w-full max-w-3xl aspect-[1/1.4] bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center justify-center space-y-6'>
                <FileText size={120} className='text-indigo-100' />
                <div className='text-center'>
                  <h4 className='text-lg font-black text-slate-800 mb-2'>
                    文档预览准备就绪
                  </h4>
                  <p className='text-sm text-slate-400'>
                    点击上方下载按钮可获取完整文档，或在正式环境中集成 PDF.js
                    查看器
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className='px-10 py-6 border-t border-slate-100 bg-white flex items-center justify-between'>
            <div className='flex flex-wrap gap-2'>
              {viewingMedia.tags.map((tag) => (
                <span
                  key={tag}
                  className='px-3 py-1 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase border border-slate-100'>
                  {tag}
                </span>
              ))}
            </div>
            <div className='text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center'>
              <Users size={14} className='mr-2' /> 上传者:{' '}
              {viewingMedia.uploader}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMediaEditModal = () => {
    if (!editingMedia) return null

    const handleUpdateMedia = () => {
      setMediaResources((prev) =>
        prev.map((m) => (m.id === editingMedia.id ? editingMedia : m))
      )
      setEditingMedia(null)
    }

    return (
      <div className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in'>
        <div className='bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20'>
          <div className='px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white'>
            <div className='flex items-center space-x-5'>
              <div className='w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3'>
                <Edit3 size={28} />
              </div>
              <div>
                <h3 className='text-xl font-black text-slate-900'>
                  编辑资料信息
                </h3>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1'>
                  资料 ID: {editingMedia.id}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditingMedia(null)}
              className='p-3 hover:bg-slate-100 rounded-2xl transition-all'>
              <DeleteIcon size={24} />
            </button>
          </div>

          <div className='p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar'>
            <div className='space-y-6'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  文件名称
                </label>
                <input
                  type='text'
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-inner'
                  value={editingMedia.name}
                  onChange={(e) =>
                    setEditingMedia({ ...editingMedia, name: e.target.value })
                  }
                />
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  资料类型
                </label>
                <select
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-inner'
                  value={editingMedia.type}
                  onChange={(e) =>
                    setEditingMedia({
                      ...editingMedia,
                      type: e.target.value as any
                    })
                  }>
                  <option value='image'>图片材料</option>
                  <option value='video'>视频教学</option>
                  <option value='pdf'>PDF 规程文档</option>
                </select>
                <p className='text-[10px] font-black text-rose-500 flex items-start'>
                  <AlertCircle size={12} className='mr-1 mt-0.5 shrink-0' />
                  不支持 Word(.doc/.docx)、Excel(.xls/.xlsx)、PPT(.ppt/.pptx)、压缩包等格式，请转换为 PDF 后上传
                </p>
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  文件说明
                </label>
                <textarea
                  placeholder='请输入文件详细说明...'
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-inner min-h-[100px] resize-none'
                  value={editingMedia.description || ''}
                  onChange={(e) =>
                    setEditingMedia({
                      ...editingMedia,
                      description: e.target.value
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  标签管理 (按回车添加)
                </label>
                <div className='space-y-3'>
                  <input
                    type='text'
                    placeholder='添加新标签...'
                    className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-inner'
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTag.trim()) {
                        setEditingMedia({
                          ...editingMedia,
                          tags: [...editingMedia.tags, newTag.trim()]
                        })
                        setNewTag('')
                      }
                    }}
                  />
                  <div className='flex flex-wrap gap-2'>
                    {editingMedia.tags.map((tag) => (
                      <span
                        key={tag}
                        className='px-3 py-1 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black flex items-center border border-amber-100 animate-in zoom-in-95'>
                        {tag}
                        <button
                          onClick={() =>
                            setEditingMedia({
                              ...editingMedia,
                              tags: editingMedia.tags.filter((t) => t !== tag)
                            })
                          }
                          className='ml-2 hover:text-rose-500 transition-colors'>
                          <DeleteIcon size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='px-10 py-8 border-t border-slate-100 flex items-center justify-end bg-slate-50/50'>
            <button
              onClick={() => setEditingMedia(null)}
              className='px-8 py-3 text-slate-500 font-black text-sm hover:text-slate-800 transition-colors mr-4'>
              取消
            </button>
            <button
              onClick={handleUpdateMedia}
              disabled={!editingMedia.name}
              className={`px-12 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center ${
                editingMedia.name
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}>
              <Save size={18} className='mr-2' /> 保存变更
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderUploadModal = () => {
    if (!uploadingMedia) return null

    const handleAddTag = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && newTag.trim()) {
        setUploadingMedia({
          ...uploadingMedia,
          tags: [...(uploadingMedia.tags || []), newTag.trim()]
        })
        setNewTag('')
      }
    }

    const handleRemoveTag = (tagToRemove: string) => {
      setUploadingMedia({
        ...uploadingMedia,
        tags: (uploadingMedia.tags || []).filter((t) => t !== tagToRemove)
      })
    }

    const handleSaveMedia = () => {
      if (!uploadingMedia.name) return

      const newMediaResource: MediaResource = {
        id: `m${Date.now()}`,
        name: uploadingMedia.name,
        type: uploadingMedia.type || 'image',
        url: '#', // In a real app, this would be the uploaded file URL
        size: '1.2 MB', // Mock size
        tags: uploadingMedia.tags || [],
        description: uploadingMedia.description,
        uploadTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        uploader: '管理员'
      }

      setMediaResources([newMediaResource, ...mediaResources])
      setUploadingMedia(null)
    }

    return (
      <div className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in'>
        <div className='bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20'>
          <div className='px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white'>
            <div className='flex items-center space-x-5'>
              <div className='w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3'>
                <UploadCloud size={28} />
              </div>
              <div>
                <h3 className='text-xl font-black text-slate-900'>
                  上传多媒体数字化资料
                </h3>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1'>
                  支持图片、视频、PDF 及常用办公文档
                </p>
              </div>
            </div>
            <button
              onClick={() => setUploadingMedia(null)}
              className='p-3 hover:bg-slate-100 rounded-2xl transition-all'>
              <DeleteIcon size={24} />
            </button>
          </div>

          <div className='p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar'>
            <div className='space-y-6'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  文件名称
                </label>
                <input
                  type='text'
                  placeholder='请输入资料名称 (例如: NXT:2050i 维护手册)'
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                  value={uploadingMedia.name}
                  onChange={(e) =>
                    setUploadingMedia({
                      ...uploadingMedia,
                      name: e.target.value
                    })
                  }
                />
              </div>

              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    资料类型
                  </label>
                  <select
                    className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                    value={uploadingMedia.type}
                    onChange={(e) =>
                      setUploadingMedia({
                        ...uploadingMedia,
                        type: e.target.value as any
                      })
                    }>
                    <option value='image'>图片材料</option>
                    <option value='video'>视频教学</option>
                    <option value='pdf'>PDF 规程文档</option>
                  </select>
                  <p className='text-[10px] font-black text-rose-500 flex items-start'>
                    <AlertCircle size={12} className='mr-1 mt-0.5 shrink-0' />
                    不支持 Word(.doc/.docx)、Excel(.xls/.xlsx)、PPT(.ppt/.pptx)、压缩包等格式，请转换为 PDF 后上传
                  </p>
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    上传文件
                  </label>
                  <div className='w-full p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group'>
                    <Plus
                      size={16}
                      className='mr-2 group-hover:scale-125 transition-transform'
                    />
                    <span className='text-[10px] font-black uppercase'>
                      选择本地文件
                    </span>
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  文件说明
                </label>
                <textarea
                  placeholder='请输入文件详细说明...'
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner min-h-[100px] resize-none'
                  value={uploadingMedia.description || ''}
                  onChange={(e) =>
                    setUploadingMedia({
                      ...uploadingMedia,
                      description: e.target.value
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  添加检索标签
                </label>
                <div className='space-y-3'>
                  <input
                    type='text'
                    placeholder='输入标签按回车添加...'
                    className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  <div className='flex flex-wrap gap-2'>
                    {uploadingMedia.tags?.map((tag) => (
                      <span
                        key={tag}
                        className='px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black flex items-center border border-indigo-100 animate-in zoom-in-95'>
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className='ml-2 hover:text-rose-500 transition-colors'>
                          <DeleteIcon size={10} />
                        </button>
                      </span>
                    ))}
                    {(!uploadingMedia.tags ||
                      uploadingMedia.tags.length === 0) && (
                      <span className='text-[10px] text-slate-300 italic'>
                        暂无标签...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='px-10 py-8 border-t border-slate-100 flex items-center justify-end bg-slate-50/50'>
            <button
              onClick={() => setUploadingMedia(null)}
              className='px-8 py-3 text-slate-500 font-black text-sm hover:text-slate-800 transition-colors mr-4'>
              取消
            </button>
            <button
              onClick={handleSaveMedia}
              disabled={!uploadingMedia.name}
              className={`px-12 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center ${
                uploadingMedia.name
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}>
              <Save size={18} className='mr-2' /> 确认上传并发布
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 现场疑问：上传图片（转为 base64 存到该提问的 images 中）
  const handleInquiryImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files
    e.target.value = ''
    if (!files || files.length === 0) return
    const inquiry = viewingInquiry || editingInquiry
    if (!inquiry) return
    const pending = Array.from(files)
    const urls: string[] = []
    const readNext = () => {
      const file = pending.shift()
      if (!file) {
        const merged = [...(inquiry.images || []), ...urls]
        setInquiries((prev) =>
          prev.map((item) =>
            item.id === inquiry.id
              ? { ...item, images: merged }
              : item
          )
        )
        setViewingInquiry((prev) =>
          prev?.id === inquiry.id ? { ...prev, images: merged } : prev
        )
        setEditingInquiry((prev) =>
          prev?.id === inquiry.id ? { ...prev, images: merged } : prev
        )
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        urls.push(String(reader.result || ''))
        readNext()
      }
      reader.readAsDataURL(file)
    }
    readNext()
  }

  // 现场疑问：删除指定位置的图片
  const removeInquiryImage = (index: number) => {
    const inquiry = viewingInquiry || editingInquiry
    if (!inquiry) return
    const merged = (inquiry.images || []).filter((_, i) => i !== index)
    setInquiries((prev) =>
      prev.map((item) =>
        item.id === inquiry.id ? { ...item, images: merged } : item
      )
    )
    setViewingInquiry((prev) =>
      prev?.id === inquiry.id ? { ...prev, images: merged } : prev
    )
    setEditingInquiry((prev) =>
      prev?.id === inquiry.id ? { ...prev, images: merged } : prev
    )
  }

  const renderInquiryDetailModal = () => {
    const isEditing = !!editingInquiry
    const inquiry = viewingInquiry || editingInquiry
    if (!inquiry) return null

    return (
      <div className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in'>
        <div className='bg-white w-full max-w-4xl h-[80vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20'>
          <div className='px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10'>
            <div className='flex items-center space-x-5'>
              <div className='w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3'>
                <MessageSquare size={28} />
              </div>
              <div>
                <h3 className='text-xl font-black text-slate-900'>
                  现场疑问处理面板
                </h3>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1'>
                  提问 ID: {inquiry.id.toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setViewingInquiry(null)
                setEditingInquiry(null)
              }}
              className='p-3 hover:bg-slate-100 rounded-2xl transition-all'>
              <DeleteIcon size={24} />
            </button>
          </div>
          <div className='flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30'>
            <div className='grid grid-cols-12 gap-10'>
              <div className='col-span-5 space-y-6'>
                <div className='bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4'>
                  <h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center'>
                    <Info size={12} className='mr-2' /> 环境与溯源信息
                  </h4>
                  <div className='space-y-4'>
                    <div>
                      <p className='text-[9px] text-slate-400 font-black uppercase tracking-widest'>
                        提出工程师
                      </p>
                      <p className='text-xs font-black text-slate-800'>
                        {
                          users.find((u) => u.id === inquiry.engineerId)
                            ?.name
                        }
                      </p>
                    </div>
                    <div>
                      <p className='text-[9px] text-slate-400 font-black uppercase tracking-widest'>
                        关联机台 / SN
                      </p>
                      <p className='text-xs font-black text-slate-800'>
                        {
                          devices.find((d) => d.id === inquiry.deviceId)
                            ?.model
                        }{' '}
                        (
                        {
                          devices.find((d) => d.id === inquiry.deviceId)
                            ?.sn
                        }
                        )
                      </p>
                    </div>
                    <div>
                      <p className='text-[9px] text-slate-400 font-black uppercase tracking-widest'>
                        故障代码 (SOP)
                      </p>
                      <p className='text-xs font-black text-blue-600'>
                        {guides.find((g) => g.id === inquiry.guideId)
                          ?.faultCode || inquiry.context?.faultCode}
                      </p>
                    </div>
                    <div>
                      <p className='text-[9px] text-slate-400 font-black uppercase tracking-widest'>
                        提交时的执行步骤
                      </p>
                      <p className='text-xs font-black text-slate-800'>
                        {inquiry.stepId !== 'unknown'
                          ? `Step ${inquiry.stepId}`
                          : '非步骤相关'}
                      </p>
                    </div>
                    <div>
                      <p className='text-[9px] text-slate-400 font-black uppercase tracking-widest'>
                        提交时间
                      </p>
                      <p className='text-xs font-black text-slate-800'>
                        {inquiry.createdAt &&
                        !isNaN(Date.parse(inquiry.createdAt))
                          ? new Date(inquiry.createdAt).toLocaleString()
                          : '时间未录入'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4'>
                  <h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center'>
                    <Activity size={12} className='mr-2' /> 处理状态
                  </h4>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-[10px] font-black text-slate-600'>
                        状态
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${inquiry.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {inquiry.status === 'pending'
                          ? '待处理'
                          : '已处理'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-span-7 space-y-6'>
                <div className='bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4'>
                  <h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center'>
                    <MessageSquare size={12} className='mr-2' /> 提问内容
                  </h4>
                  <p className='text-xs text-slate-700 leading-relaxed'>
                    {inquiry.question}
                  </p>
                  <div className='mt-4 space-y-2'>
                    <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                      现场物证图片
                    </p>
                    <div className='grid grid-cols-3 gap-3'>
                      {(inquiry.images || []).map((img, i) => (
                        <div
                          key={i}
                          className='relative aspect-square bg-slate-100 rounded-xl overflow-hidden group'>
                          <img
                            src={img}
                            className='w-full h-full object-cover'
                            alt=''
                          />
                          <button
                            onClick={() => removeInquiryImage(i)}
                            title='删除图片'
                            className='absolute top-1.5 right-1.5 p-1.5 bg-black/55 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500'>
                            <DeleteIcon size={11} />
                          </button>
                        </div>
                      ))}
                      <label className='aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer text-slate-300 hover:text-blue-500 hover:border-blue-400 transition-all'>
                        <ImagePlus size={22} />
                        <span className='text-[9px] font-black mt-1'>
                          上传图片
                        </span>
                        <input
                          type='file'
                          accept='image/*'
                          multiple
                          className='hidden'
                          onChange={handleInquiryImagesChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className='bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4'>
                  <h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center'>
                    <Send size={12} className='mr-2' /> 专家回复
                  </h4>
                  {isEditing ? (
                    <textarea
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                      placeholder='请输入专家回复内容...'
                      rows={6}
                      className='w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y'
                    />
                  ) : inquiry.answer ? (
                    <div className='space-y-3'>
                      <p className='text-xs text-slate-700 leading-relaxed'>
                        {inquiry.answer}
                      </p>
                      <div className='flex items-center justify-between text-[9px] text-slate-400 font-black uppercase tracking-widest'>
                        <span>
                          回复时间:{' '}
                          {inquiry.answeredAt
                            ? new Date(inquiry.answeredAt).toLocaleString()
                            : '未记录'}
                        </span>
                        <span>
                          回复人: {inquiry.answeredBy || '系统'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center py-8 text-slate-300'>
                      <MessageCircleCode
                        size={48}
                        className='mb-4 opacity-20'
                      />
                      <p className='text-sm font-black uppercase tracking-widest'>
                        专家尚未回复
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='px-10 py-6 border-t border-slate-100 bg-white flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() => {
                  setViewingInquiry(null)
                  setEditingInquiry(null)
                }}
                className='px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all'>
                {isEditing ? '取消' : '关闭'}
              </button>
              {!isEditing && (
                <>
                  <button className='px-6 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 hover:bg-amber-100 transition-all'>
                    查看关联 SOP
                  </button>
                  <button className='px-6 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 hover:bg-amber-100 transition-all'>
                    标记为已处理
                  </button>
                </>
              )}
            </div>
            {isEditing ? (
              <button
                onClick={() => {
                  if (!editingInquiry) return
                  setInquiries((prev) =>
                    prev.map((inq) =>
                      inq.id === editingInquiry.id
                        ? {
                            ...inq,
                            status: 'resolved',
                            answer: editAnswer || inq.answer,
                            answeredAt: new Date().toLocaleString(),
                            answeredBy: currentUser?.name || '系统'
                          }
                        : inq
                    )
                  )
                  setEditingInquiry(null)
                  setEditAnswer('')
                }}
                className='px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95'>
                保存回复
              </button>
            ) : inquiry.status === 'pending' ? (
              <button className='px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95'>
                发送回复
              </button>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  const renderSOPEditorModal = () => {
    if (!editingGuide) return null

    return (
      <div className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in'>
        <div className='bg-white w-full max-w-6xl h-[90vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20'>
          <div className='px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10'>
            <div className='flex items-center space-x-4'>
              <div className='w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3'>
                <Edit3 size={24} />
              </div>
              <div>
                <h3 className='text-xl font-black text-slate-900'>
                  规程手册编辑器
                </h3>
                <p className='text-xs text-slate-400 font-bold uppercase tracking-widest'>
                  {editingGuide.faultCode} · SOP 生命周期管理
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditingGuide(null)}
              className='p-3 hover:bg-slate-100 rounded-2xl transition-all'>
              <DeleteIcon size={24} />
            </button>
          </div>
          <div className='flex-1 p-10 overflow-y-auto bg-slate-50/30'>
            <div className='space-y-8'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                <div className='space-y-1'>
                  <span className='text-[10px] text-slate-400 font-black uppercase'>
                    报警代码
                  </span>
                  <input
                    className='w-full p-4 bg-white rounded-2xl border border-slate-200 outline-none text-xs font-black text-blue-600'
                    value={editingGuide.faultCode}
                    onChange={(e) =>
                      setEditingGuide({
                        ...editingGuide,
                        faultCode: e.target.value
                      })
                    }
                  />
                </div>
                <div className='space-y-1'>
                  <span className='text-[10px] text-slate-400 font-black uppercase'>
                    设备机型
                  </span>
                  <select
                    className='w-full p-4 bg-white rounded-2xl border border-slate-200 outline-none text-xs font-bold appearance-none'
                    value={guideDeviceModel}
                    onChange={(e) => {
                      const model = e.target.value
                      setGuideDeviceModel(model)
                      // 机型变化时，若当前已选设备不属于该机型则清空关联设备
                      const cur = devices.find(
                        (d) => d.id === editingGuide.deviceId
                      )
                      if (cur && cur.model !== model) {
                        setEditingGuide({
                          ...editingGuide,
                          deviceId: ''
                        })
                      }
                    }}>
                    <option value=''>全部机型</option>
                    {[
                      ...new Set(
                        devices.map((d) => d.model).filter(Boolean)
                      )
                    ].map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='space-y-1'>
                  <span className='text-[10px] text-slate-400 font-black uppercase'>
                    关联设备
                  </span>
                  <select
                    className='w-full p-4 bg-white rounded-2xl border border-slate-200 outline-none text-xs font-bold appearance-none'
                    value={editingGuide.deviceId}
                    onChange={(e) =>
                      setEditingGuide({
                        ...editingGuide,
                        deviceId: e.target.value
                      })
                    }>
                    <option value=''>请选择关联设备</option>
                    {devices
                      .filter(
                        (d) => !guideDeviceModel || d.model === guideDeviceModel
                      )
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.model} ({d.sn})
                        </option>
                      ))}
                  </select>
                </div>
                <div className='space-y-1'>
                  <span className='text-[10px] text-slate-400 font-black uppercase'>
                    故障分类
                  </span>
                  <select
                    className='w-full p-4 bg-white rounded-2xl border border-slate-200 outline-none text-xs font-bold appearance-none'
                    value={editingGuide.faultCategory}
                    onChange={(e) =>
                      setEditingGuide({
                        ...editingGuide,
                        faultCategory: e.target.value
                      })
                    }>
                    <option value=''>请选择故障分类</option>
                    {uniqueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='space-y-1'>
                  <span className='text-[10px] text-slate-400 font-black uppercase'>
                    报警代码描述
                  </span>
                  <textarea
                    rows={2}
                    className='w-full p-4 bg-white rounded-2xl border border-slate-200 outline-none text-xs font-bold resize-none'
                    value={editingGuide.faultPhenomenon || ''}
                    onChange={(e) =>
                      setEditingGuide({
                        ...editingGuide,
                        faultPhenomenon: e.target.value
                      })
                    }
                    placeholder='请输入该报警代码对应的描述...'
                  />
                </div>
                <div className='space-y-1'>
                  <span className='text-[10px] text-slate-400 font-black uppercase'>
                    问题类型
                  </span>
                  <select className='w-full p-4 bg-white rounded-2xl border border-slate-200 outline-none text-xs font-bold appearance-none'>
                    <option value='normal'>普通报修</option>
                    <option value='emergency'>紧急报修</option>
                  </select>
                </div>
                <div className='space-y-1'>
                  <span className='text-[10px] text-slate-400 font-black uppercase'>
                    维修位置
                  </span>
                  <select
                    className='w-full p-4 bg-white rounded-2xl border border-slate-200 outline-none text-xs font-bold appearance-none'
                    value={editingGuide.repairLocation || ''}
                    onChange={(e) =>
                      setEditingGuide({
                        ...editingGuide,
                        repairLocation: e.target.value
                      })
                    }>
                    <option value=''>请选择维修位置</option>
                    {(REPAIR_OPTIONS_BY_MODEL[
                      devices.find((d) => d.id === editingGuide.deviceId)
                        ?.model || ''
                    ] || DEFAULT_REPAIR_OPTIONS).locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='space-y-1'>
                  <span className='text-[10px] text-slate-400 font-black uppercase'>
                    维修内容
                  </span>
                  <select
                    className='w-full p-4 bg-white rounded-2xl border border-slate-200 outline-none text-xs font-bold appearance-none'
                    value={editingGuide.repairContent || ''}
                    onChange={(e) =>
                      setEditingGuide({
                        ...editingGuide,
                        repairContent: e.target.value
                      })
                    }>
                    <option value=''>请选择维修内容</option>
                    {(REPAIR_OPTIONS_BY_MODEL[
                      devices.find((d) => d.id === editingGuide.deviceId)
                        ?.model || ''
                    ] || DEFAULT_REPAIR_OPTIONS).contents.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className='space-y-4'>
                {editingGuide.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-6 border rounded-[2rem] flex flex-col space-y-4 relative group transition-all duration-300 ${step.enabled === false ? 'bg-slate-50 border-slate-200 opacity-60 grayscale-[0.5]' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className='flex items-center space-x-4'>
                      <span className='w-8 h-8 bg-slate-900 text-white text-xs font-black rounded-full flex items-center justify-center'>
                        {idx + 1}
                      </span>
                      <div className='flex-1 flex items-center space-x-2'>
                        <input
                          className='flex-1 p-2 border-b-2 border-slate-100 outline-none font-black text-sm focus:border-blue-600 transition-colors'
                          value={step.title}
                          onChange={(e) => {
                            const newSteps = [...editingGuide.steps]
                            newSteps[idx].title = e.target.value
                            setEditingGuide({
                              ...editingGuide,
                              steps: newSteps
                            })
                          }}
                        />
                        <div className='flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-200 shrink-0 animate-pulse'>
                          <History size={12} />
                          <span className='text-[10px] font-black uppercase tracking-tight'>
                            反馈次数: {step.historyRepairCount || 1}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const newSteps = [...editingGuide.steps]
                            newSteps[idx].enabled = !(
                              newSteps[idx].enabled !== false
                            )
                            setEditingGuide({
                              ...editingGuide,
                              steps: newSteps
                            })
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center shrink-0 ${
                            step.enabled === false
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm'
                          }`}>
                          {step.enabled === false ? (
                            <>
                              <Unlock size={12} className='mr-1.5' /> 启用
                            </>
                          ) : (
                            <>
                              <Lock size={12} className='mr-1.5' /> 禁用
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div className='space-y-1'>
                        <span className='text-[10px] text-slate-400 font-black uppercase'>
                          操作说明
                        </span>
                        <textarea
                          className='w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none text-xs min-h-[80px]'
                          value={step.instruction || ''}
                          onChange={(e) => {
                            const newSteps = [...editingGuide.steps]
                            newSteps[idx].instruction = e.target.value
                            setEditingGuide({
                              ...editingGuide,
                              steps: newSteps
                            })
                          }}
                          placeholder='请输入详细操作说明...'
                        />
                      </div>
                      <div className='space-y-1'>
                        <span className='text-[10px] text-slate-400 font-black uppercase'>
                          判断方法
                        </span>
                        <textarea
                          className='w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none text-xs min-h-[80px]'
                          value={step.judgmentMethod || ''}
                          onChange={(e) => {
                            const newSteps = [...editingGuide.steps]
                            newSteps[idx].judgmentMethod = e.target.value
                            setEditingGuide({
                              ...editingGuide,
                              steps: newSteps
                            })
                          }}
                          placeholder='请输入如何判断步骤完成或成功的方法...'
                        />
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div className='space-y-1'>
                        <span className='text-[10px] text-slate-400 font-black uppercase'>
                          步骤描述
                        </span>
                        <textarea
                          className='w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none text-xs min-h-[80px]'
                          value={step.description}
                          onChange={(e) => {
                            const newSteps = [...editingGuide.steps]
                            newSteps[idx].description = e.target.value
                            setEditingGuide({
                              ...editingGuide,
                              steps: newSteps
                            })
                          }}
                          placeholder='步骤详细描述...'
                        />
                      </div>
                      <div className='space-y-1'>
                        <span className='text-[10px] text-rose-400 font-black uppercase'>
                          安全提示
                        </span>
                        <textarea
                          className='w-full p-4 bg-rose-50/50 rounded-2xl border border-rose-100 outline-none text-xs min-h-[80px] text-rose-700 placeholder:text-rose-300'
                          value={step.safetyWarning || ''}
                          onChange={(e) => {
                            const newSteps = [...editingGuide.steps]
                            newSteps[idx].safetyWarning = e.target.value
                            setEditingGuide({
                              ...editingGuide,
                              steps: newSteps
                            })
                          }}
                          placeholder='请输入安全注意事项或潜在风险...'
                        />
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div className='space-y-2'>
                        <label className='text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center'>
                          <FileImage size={12} className='mr-1 text-blue-500' />{' '}
                          图片资源
                        </label>
                        <div className='space-y-3'>
                          <div className='grid grid-cols-2 gap-2'>
                            {(
                              step.imageUrls ||
                              (step.imageUrl ? [step.imageUrl] : [])
                            ).map((url, urlIdx) => {
                              const resource = mediaResources.find(
                                (r) => r.url === url
                              )
                              return (
                                <div key={urlIdx} className='space-y-1'>
                                  {resource?.description && (
                                    <div className='px-2 py-1 bg-blue-50/50 rounded-lg border border-blue-100/50'>
                                      <p className='text-[9px] font-black text-blue-600 line-clamp-1 italic'>
                                        备注: {resource.description}
                                      </p>
                                    </div>
                                  )}
                                  <div className='relative group/media aspect-video rounded-xl overflow-hidden border border-slate-100 shadow-sm'>
                                    <img
                                      src={url}
                                      className='w-full h-full object-cover'
                                      alt=''
                                    />
                                    <button
                                      onClick={() => {
                                        const newSteps = [...editingGuide.steps]
                                        const urls = (
                                          newSteps[idx].imageUrls ||
                                          (newSteps[idx].imageUrl
                                            ? [newSteps[idx].imageUrl]
                                            : [])
                                        ).filter((_, i) => i !== urlIdx)
                                        newSteps[idx].imageUrls = urls
                                        newSteps[idx].imageUrl = urls[0] || ''
                                        setEditingGuide({
                                          ...editingGuide,
                                          steps: newSteps
                                        })
                                      }}
                                      className='absolute inset-0 bg-slate-900/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center text-white'>
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          <div className='w-full aspect-video border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 space-y-3'>
                            <button
                              onClick={() => {
                                const urlStr = prompt(
                                  '请输入图片 URL (支持多个 URL，用英文逗号分隔):',
                                  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop'
                                )
                                if (urlStr) {
                                  const urls = urlStr
                                    .split(',')
                                    .map((u) => u.trim())
                                    .filter((u) => u !== '')
                                  const newSteps = [...editingGuide.steps]
                                  const currentUrls =
                                    newSteps[idx].imageUrls ||
                                    (newSteps[idx].imageUrl
                                      ? [newSteps[idx].imageUrl]
                                      : [])
                                  newSteps[idx].imageUrls = [
                                    ...currentUrls,
                                    ...urls
                                  ]
                                  if (!newSteps[idx].imageUrl)
                                    newSteps[idx].imageUrl = urls[0]
                                  setEditingGuide({
                                    ...editingGuide,
                                    steps: newSteps
                                  })
                                }
                              }}
                              className='flex flex-col items-center justify-center text-slate-300 hover:text-blue-600 transition-all transform hover:scale-105'>
                              <UploadCloud size={20} className='mb-1' />
                              <span className='text-[9px] font-black uppercase'>
                                本地上传
                              </span>
                            </button>
                            <div className='w-10 h-[1px] bg-slate-100' />
                            <button
                              onClick={() =>
                                setSelectingMediaForStep({
                                  stepIndex: idx,
                                  type: 'image'
                                })
                              }
                              className='flex flex-col items-center justify-center text-slate-300 hover:text-indigo-600 transition-all transform hover:scale-105'>
                              <Database size={20} className='mb-1' />
                              <span className='text-[9px] font-black uppercase'>
                                资源库选择
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <label className='text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center'>
                          <FileVideo
                            size={12}
                            className='mr-1 text-indigo-500'
                          />{' '}
                          视频指导
                        </label>
                        <div className='space-y-3'>
                          <div className='space-y-2'>
                            {(
                              step.videoUrls ||
                              (step.videoUrl ? [step.videoUrl] : [])
                            ).map((url, urlIdx) => {
                              const resource = mediaResources.find(
                                (r) => r.url === url
                              )
                              return (
                                <div key={urlIdx} className='space-y-1'>
                                  {resource?.description && (
                                    <div className='px-2 py-1 bg-indigo-50/50 rounded-lg border border-indigo-100/50'>
                                      <p className='text-[9px] font-black text-indigo-600 line-clamp-1 italic'>
                                        备注: {resource.description}
                                      </p>
                                    </div>
                                  )}
                                  <div className='relative group/media h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-900 flex items-center px-3 space-x-2'>
                                    <FileVideo
                                      size={16}
                                      className='text-white/40'
                                    />
                                    <div className='flex-1 text-[8px] text-white font-mono truncate'>
                                      {url}
                                    </div>
                                    <button
                                      onClick={() => {
                                        const newSteps = [...editingGuide.steps]
                                        const urls = (
                                          newSteps[idx].videoUrls ||
                                          (newSteps[idx].videoUrl
                                            ? [newSteps[idx].videoUrl]
                                            : [])
                                        ).filter((_, i) => i !== urlIdx)
                                        newSteps[idx].videoUrls = urls
                                        newSteps[idx].videoUrl = urls[0] || ''
                                        setEditingGuide({
                                          ...editingGuide,
                                          steps: newSteps
                                        })
                                      }}
                                      className='text-white/40 hover:text-rose-400 transition-colors'>
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          <div className='w-full aspect-video border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 space-y-3'>
                            <button
                              onClick={() => {
                                const urlStr = prompt(
                                  '请输入视频 URL (支持多个 URL，用英文逗号分隔):',
                                  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4'
                                )
                                if (urlStr) {
                                  const urls = urlStr
                                    .split(',')
                                    .map((u) => u.trim())
                                    .filter((u) => u !== '')
                                  const newSteps = [...editingGuide.steps]
                                  const currentUrls =
                                    newSteps[idx].videoUrls ||
                                    (newSteps[idx].videoUrl
                                      ? [newSteps[idx].videoUrl]
                                      : [])
                                  newSteps[idx].videoUrls = [
                                    ...currentUrls,
                                    ...urls
                                  ]
                                  if (!newSteps[idx].videoUrl)
                                    newSteps[idx].videoUrl = urls[0]
                                  setEditingGuide({
                                    ...editingGuide,
                                    steps: newSteps
                                  })
                                }
                              }}
                              className='flex flex-col items-center justify-center text-slate-300 hover:text-indigo-600 transition-all transform hover:scale-105'>
                              <UploadCloud size={20} className='mb-1' />
                              <span className='text-[9px] font-black uppercase'>
                                本地上传
                              </span>
                            </button>
                            <div className='w-10 h-[1px] bg-slate-100' />
                            <button
                              onClick={() =>
                                setSelectingMediaForStep({
                                  stepIndex: idx,
                                  type: 'video'
                                })
                              }
                              className='flex flex-col items-center justify-center text-slate-300 hover:text-indigo-600 transition-all transform hover:scale-105'>
                              <Database size={20} className='mb-1' />
                              <span className='text-[9px] font-black uppercase'>
                                资源库选择
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <label className='text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center'>
                          <FileText size={12} className='mr-1 text-rose-500' />{' '}
                          PDF 文档
                        </label>
                        <div className='space-y-3'>
                          <div className='space-y-2'>
                            {(
                              step.pdfUrls || (step.pdfUrl ? [step.pdfUrl] : [])
                            ).map((url, urlIdx) => {
                              const resource = mediaResources.find(
                                (r) => r.url === url
                              )
                              return (
                                <div key={urlIdx} className='space-y-1'>
                                  {resource?.description && (
                                    <div className='px-2 py-1 bg-rose-50/50 rounded-lg border border-rose-100/50'>
                                      <p className='text-[9px] font-black text-rose-600 line-clamp-1 italic'>
                                        备注: {resource.description}
                                      </p>
                                    </div>
                                  )}
                                  <div className='relative group/media h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-rose-50 flex items-center px-3 space-x-2'>
                                    <FileDown
                                      size={16}
                                      className='text-rose-300'
                                    />
                                    <div className='flex-1 text-[8px] text-rose-600 font-black truncate'>
                                      DOCUMENT_{urlIdx + 1}.PDF
                                    </div>
                                    <button
                                      onClick={() => {
                                        const newSteps = [...editingGuide.steps]
                                        const urls = (
                                          newSteps[idx].pdfUrls ||
                                          (newSteps[idx].pdfUrl
                                            ? [newSteps[idx].pdfUrl]
                                            : [])
                                        ).filter((_, i) => i !== urlIdx)
                                        newSteps[idx].pdfUrls = urls
                                        newSteps[idx].pdfUrl = urls[0] || ''
                                        setEditingGuide({
                                          ...editingGuide,
                                          steps: newSteps
                                        })
                                      }}
                                      className='text-rose-300 hover:text-rose-600 transition-colors'>
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          <div className='w-full aspect-video border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 space-y-3'>
                            <button
                              onClick={() => {
                                const urlStr = prompt(
                                  '请输入 PDF URL (支持多个 URL，用英文逗号分隔):',
                                  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                                )
                                if (urlStr) {
                                  const urls = urlStr
                                    .split(',')
                                    .map((u) => u.trim())
                                    .filter((u) => u !== '')
                                  const newSteps = [...editingGuide.steps]
                                  const currentUrls =
                                    newSteps[idx].pdfUrls ||
                                    (newSteps[idx].pdfUrl
                                      ? [newSteps[idx].pdfUrl]
                                      : [])
                                  newSteps[idx].pdfUrls = [
                                    ...currentUrls,
                                    ...urls
                                  ]
                                  if (!newSteps[idx].pdfUrl)
                                    newSteps[idx].pdfUrl = urls[0]
                                  setEditingGuide({
                                    ...editingGuide,
                                    steps: newSteps
                                  })
                                }
                              }}
                              className='flex flex-col items-center justify-center text-slate-300 hover:text-rose-600 transition-all transform hover:scale-105'>
                              <UploadCloud size={20} className='mb-1' />
                              <span className='text-[9px] font-black uppercase'>
                                本地上传
                              </span>
                            </button>
                            <div className='w-10 h-[1px] bg-slate-100' />
                            <button
                              onClick={() =>
                                setSelectingMediaForStep({
                                  stepIndex: idx,
                                  type: 'pdf'
                                })
                              }
                              className='flex flex-col items-center justify-center text-slate-300 hover:text-indigo-600 transition-all transform hover:scale-105'>
                              <Database size={20} className='mb-1' />
                              <span className='text-[9px] font-black uppercase'>
                                资源库选择
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() =>
                    setEditingGuide({
                      ...editingGuide,
                      steps: [
                        ...editingGuide.steps,
                        {
                          id: `s-${Date.now()}`,
                          stage: '维修实施',
                          title: '新步骤',
                          description: '',
                          isConfirmationRequired: true,
                          imageUrl: '',
                          videoUrl: '',
                          pdfUrl: ''
                        }
                      ]
                    })
                  }
                  className='w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center'>
                  <Plus size={18} className='mr-2' /> 添加执行步骤
                </button>
              </div>
            </div>
          </div>
          <div className='px-10 py-6 border-t border-slate-100 flex items-center justify-end bg-white'>
            <button
              onClick={() => setEditingGuide(null)}
              className='px-8 py-3 text-slate-600 font-black text-sm mr-4'>
              取消
            </button>
            <button
              onClick={() => handleSaveGuide(editingGuide)}
              className='px-12 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all'>
              <Save size={18} className='mr-2' /> 保存 SOP
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderUserEditModal = () => {
    if (!editingUser) return null

    const handleUpdateUser = async () => {
      try {
        const response = await fetch('/backend/users/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingUser)
        })

        const result = await response.json()
        if (result.code === 200) {
          handleSaveUser(editingUser)
        } else {
          alert('更新用户失败: ' + result.message)
        }
      } catch (error) {
        console.error('Failed to update user:', error)
        // 后端接口未准备好时，依然在前端模拟更新，方便调试演示
        handleSaveUser(editingUser)
      }
    }

    return (
      <div className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in'>
        <div className='bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20'>
          <div className='px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white'>
            <div className='flex items-center space-x-5'>
              <div className='w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3'>
                <UserCheck size={28} />
              </div>
              <div>
                <h3 className='text-xl font-black text-slate-900'>
                  工程师信息编辑
                </h3>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1'>
                  用户 ID: {editingUser.id}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditingUser(null)}
              className='p-3 hover:bg-slate-100 rounded-2xl transition-all'>
              <DeleteIcon size={24} />
            </button>
          </div>

          <div className='p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar'>
            <div className='space-y-6'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  姓名
                </label>
                <input
                  type='text'
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                />
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  工号
                </label>
                <input
                  type='text'
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                  value={editingUser.employeeId}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      employeeId: e.target.value
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  用户名
                </label>
                <input
                  type='text'
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                  value={editingUser.username}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, username: e.target.value })
                  }
                />
              </div>

              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    部门
                  </label>
                  <select
                    className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                    value={editingUser.department || ''}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        department: e.target.value
                      })
                    }>
                    <option value=''>请选择部门</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    角色
                  </label>
                  <select
                    className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        role: e.target.value as Role
                      })
                    }>
                    <option value={Role.ADMIN}>ADMIN</option>
                    <option value={Role.SENIOR_ENGINEER}>
                      SENIOR_ENGINEER
                    </option>
                    <option value={Role.JUNIOR_ENGINEER}>
                      JUNIOR_ENGINEER
                    </option>
                    <option value={Role.OUTSOURCED_ENGINEER}>
                      OUTSOURCED_ENGINEER
                    </option>
                  </select>
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  状态
                </label>
                <div className='flex space-x-4'>
                  <label className='flex items-center space-x-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='status'
                      value='active'
                      checked={editingUser.status === 'active'}
                      onChange={() =>
                        setEditingUser({ ...editingUser, status: 'active' })
                      }
                      className='w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded'
                    />
                    <span className='text-sm font-black text-slate-700'>
                      正常
                    </span>
                  </label>
                  <label className='flex items-center space-x-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='status'
                      value='disabled'
                      checked={editingUser.status === 'disabled'}
                      onChange={() =>
                        setEditingUser({ ...editingUser, status: 'disabled' })
                      }
                      className='w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded'
                    />
                    <span className='text-sm font-black text-slate-700'>
                      已冻结
                    </span>
                  </label>
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  头像 URL
                </label>
                <input
                  type='text'
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
                  value={editingUser.avatar}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, avatar: e.target.value })
                  }
                  placeholder='输入头像图片 URL'
                />
              </div>
            </div>
          </div>

          <div className='px-10 py-8 border-t border-slate-100 flex items-center justify-end bg-slate-50/50'>
            <button
              onClick={() => setEditingUser(null)}
              className='px-8 py-3 text-slate-500 font-black text-sm hover:text-slate-800 transition-colors mr-4'>
              取消
            </button>
            <button
              onClick={handleUpdateUser}
              disabled={!editingUser.name || !editingUser.employeeId}
              className={`px-12 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center ${editingUser.name && editingUser.employeeId ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
              <Save size={18} className='mr-2' /> 保存变更
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-row min-h-[calc(100vh-160px)] pb-20'>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
      <aside className='w-64 shrink-0 border-r border-slate-100 pr-8'>
        <div className='bg-white rounded-2xl border border-slate-200 p-3 shadow-sm sticky top-24 space-y-1'>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
              {item.icon}
              <span>{item.label}</span>
              {item.id === '预防性维护管理' && expiredCount > 0 && (
                <span className='ml-auto flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-rose-600 text-white text-[11px] font-black shadow-sm'>
                  {expiredCount}
                </span>
              )}
            </button>
          ))}
          <div className='pt-3 mt-3 border-t border-slate-100'>
            <button
              onClick={handleToggleAutoSpeak}
              title='控制是否在检测到过期备件时自动语音播报'
              className='w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition hover:bg-slate-50'>
              <span className='flex items-center space-x-3 text-sm font-semibold text-slate-600'>
                <Volume2 size={18} />
                <span>语音自动播报</span>
              </span>
              <span
                className={`relative inline-flex w-10 h-[22px] rounded-full transition-colors shrink-0 ${
                  autoSpeak ? 'bg-emerald-500' : 'bg-slate-200'
                }`}>
                <span
                  className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${
                    autoSpeak ? 'left-[20px]' : 'left-[2px]'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </aside>

      <div className='flex-1 pl-8 space-y-6'>{renderContent()}</div>

      {renderUploadModal()}
      {renderMediaViewModal()}
      {renderMediaEditModal()}
      {renderMediaSelectionModal()}
      {renderInquiryDetailModal()}
      {renderSOPEditorModal()}
      {renderUserEditModal()}
      {renderAddUserModal()}
    </div>
  )
}

export default AdminDashboard
