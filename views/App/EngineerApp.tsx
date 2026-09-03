import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  ChevronRight,
  ArrowLeft,
  Cpu,
  PlayCircle,
  Play,
  FileText,
  X,
  Send,
  Image as ImageIcon,
  Video,
  ShieldCheck,
  ScanLine,
  Info,
  Tag,
  Search,
  ChevronDown,
  AlertCircle,
  FileSearch,
  AlertTriangle,
  Hammer,
  BookOpen,
  ExternalLink,
  Maximize2,
  History,
  ClipboardCheck,
  ClipboardList,
  Camera,
  MessageSquare,
  CheckCircle2,
  Clock,
  BadgeAlert,
  Layers,
  User as UserIcon,
  LogOut,
  Radio,
  Package,
  LayoutGrid,
  Bell,
  Plus
} from 'lucide-react'
import {
  MOCK_DEVICES,
  MOCK_GUIDES,
  MOCK_USER,
  MOCK_RECORDS,
  MOCK_REPAIR_REQUESTS,
  MOCK_MEDIA_RESOURCES
} from '../../constants'
import { Device, MaintenanceGuide, GuideStep, RepairRecord } from '../../types'

const EngineerApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'MESSAGE' | 'PROFILE'>('HOME')
  const [step, setStep] = useState<
    | 'APP_LOGIN'
    | 'DASHBOARD'
    | 'DEVICE_DETAIL'
    | 'ALARM_SELECT'
    | 'STEP_LIST'
    | 'GUIDE'
    | 'LOG'
    | 'SUBMIT_INQUIRY'
    | 'REPAIR_DETAIL'
    | 'FINAL_SUBMIT'
    | 'REPAIR_REPORT'
  >('DASHBOARD')
  const [dashboardTab, setDashboardTab] = useState<'EQUIPMENT' | 'PM'>('EQUIPMENT')
  const [isAppAuthenticated, setIsAppAuthenticated] = useState(true)
  const [isRfidScanning, setIsRfidScanning] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [selectedGuide, setSelectedGuide] = useState<MaintenanceGuide | null>(
    null
  )
  const [activeGuideStepIdx, setActiveGuideStepIdx] = useState(0)
  const [showStepJump, setShowStepJump] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  // 维修反馈相关状态
  const [repairActionText, setRepairActionText] = useState('')
  const [repairPhotos, setRepairPhotos] = useState<string[]>([])
  const [isSubmittingRepair, setIsSubmittingRepair] = useState(false)

  // 排序后的步骤
  const sortedSteps = useMemo(() => {
    if (!selectedGuide) return []
    return [...selectedGuide.steps].sort(
      (a, b) => (b.historyRepairCount || 0) - (a.historyRepairCount || 0)
    )
  }, [selectedGuide])

  // 维修订单详情状态
  const [viewingRepairRecord, setViewingRepairRecord] =
    useState<RepairRecord | null>(null)

  // 历史记录查看状态
  const [viewingHistoryRecord, setViewingHistoryRecord] =
    useState<RepairRecord | null>(null)
  const [showHistoryOverlay, setShowHistoryOverlay] = useState(false)

  // 步骤疑问提交状态
  const [inquiryText, setInquiryText] = useState('')
  const [inquiryPhoto, setInquiryPhoto] = useState<string | null>(null)
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false)
  const [submissionSource, setSubmissionSource] = useState<
    'CLOSE' | 'PASS' | null
  >(null)
  const [isNewIssue, setIsNewIssue] = useState(false) // 新增：是否为新问题的勾选状态
  const [viewingRequest, setViewingRequest] = useState<any>(null) // 新增：查看中的报修申请
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const [alarmSearchQuery, setAlarmSearchQuery] = useState('') // 新增：报警搜索关键词
  const [selectedFaultCode, setSelectedFaultCode] = useState('') // 选中的报警代码
  const [selectedFaultCategory, setSelectedFaultCategory] = useState('') // 选中的报警内容
  const [repairLocation, setRepairLocation] = useState('') // 新增：维修位置
  const [repairContent, setRepairContent] = useState('') // 新增：维修内容
  const [repairStatus, setRepairStatus] = useState('维修中') // 新增：维修状态
  const [devices, setDevices] = useState<Device[]>([]) // 从 API 获取的设备列表
  const [guides, setGuides] = useState<MaintenanceGuide[]>([]) // 从 API 获取的 SOP 指南列表
  const [isLoading, setIsLoading] = useState(false) // 加载状态

  // 监听进入 ALARM_SELECT 步骤，并根据是否有选中的报修申请自动填入下拉框
  useEffect(() => {
    if (step === 'ALARM_SELECT') {
      if (viewingRequest) {
        // 从报修申请关联的 MOCK_GUIDES 中找到对应的指南并自动填入
        const guide = MOCK_GUIDES.find(
          (g) =>
            g.deviceId === viewingRequest.deviceId &&
            g.faultCode === viewingRequest.faultCode
        )
        if (guide) {
          setSelectedFaultCode(guide.faultCode || '')
          setSelectedFaultCategory(guide.faultCategory || '')
        }
      } else if (selectedDevice) {
        // 如果没有特定的报修申请，但识别到了设备，则默认填入该设备第一个指南
        const firstGuide = MOCK_GUIDES.find(
          (g) => g.deviceId === selectedDevice.id
        )
        if (firstGuide) {
          setSelectedFaultCode(firstGuide.faultCode || '')
          setSelectedFaultCategory(firstGuide.faultCategory || '')
        }
        // 从 API 获取该设备的 SOP 指南列表
        const fetchGuides = async () => {
          setIsLoading(true)
          try {
            const response = await fetch('/backend/guides/list', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ deviceId: selectedDevice.id })
            })
            const result = await response.json()
            if (result.code === 200 && result.list) {
              setGuides(result.list)
            }
          } catch (error) {
            console.error('获取 SOP 指南失败:', error)
            // 使用模拟数据作为 fallback
            setGuides(
              MOCK_GUIDES.filter((g) => g.deviceId === selectedDevice.id)
            )
          } finally {
            setIsLoading(false)
          }
        }
        fetchGuides()
      }
    } else if (step === 'DASHBOARD') {
      // 重置下拉框
      setAlarmSearchQuery('')
      setSelectedFaultCode('')
      setSelectedFaultCategory('')
    }
  }, [step, viewingRequest, selectedDevice])

  const [showAllAlarms, setShowAllAlarms] = useState(false) // 新增：是否显示全部报警代码

  const authorizedDevices = useMemo(() => {
    return MOCK_DEVICES.filter((d) =>
      MOCK_USER.assignedDeviceIds.includes(d.id)
    )
  }, [])

  const availableAlarms = useMemo(() => {
    if (!selectedDevice) return []
    let baseList =
      guides.length > 0
        ? guides
        : MOCK_GUIDES.filter((g) => g.deviceId === selectedDevice.id)

    // 按报警代码过滤
    if (selectedFaultCode) {
      baseList = baseList.filter((g) => g.faultCode === selectedFaultCode)
    }
    // 按报警内容过滤
    if (selectedFaultCategory) {
      baseList = baseList.filter(
        (g) => g.faultCategory === selectedFaultCategory
      )
    }

    return baseList.sort(
      (a, b) => (b.totalOccurrenceCount || 0) - (a.totalOccurrenceCount || 0)
    )
  }, [selectedDevice, selectedFaultCode, selectedFaultCategory, guides])

  // 当前设备下的报警代码选项
  const alarmCodes = useMemo(() => {
    const base =
      guides.length > 0
        ? guides
        : MOCK_GUIDES.filter((g) => g.deviceId === selectedDevice?.id)
    return [...new Set(base.map((g) => g.faultCode).filter(Boolean))]
  }, [guides, selectedDevice])

  // 当前设备下的报警内容选项
  const alarmCategories = useMemo(() => {
    const base =
      guides.length > 0
        ? guides
        : MOCK_GUIDES.filter((g) => g.deviceId === selectedDevice?.id)
    return [...new Set(base.map((g) => g.faultCategory).filter(Boolean))]
  }, [guides, selectedDevice])

  // 分类报警代码（基于维修类型/Scope）
  const groupedAlarms = useMemo(() => {
    const groups: { [key: string]: MaintenanceGuide[] } = {}
    availableAlarms.forEach((alarm) => {
      const scope = alarm.scope || '其他'
      if (!groups[scope]) groups[scope] = []
      groups[scope].push(alarm)
    })
    return groups
  }, [availableAlarms])

  const handleInquiryPhoto = () => {
    // 模拟拍照
    setInquiryPhoto(
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400'
    )
  }

  const handleSubmitInquiry = async () => {
    if (!inquiryText.trim()) return
    setIsSubmittingInquiry(true)
    try {
      const response = await fetch('/backend/inquiries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineerId: MOCK_USER.id,
          guideId: selectedGuide?.id || '',
          stepId: sortedSteps[activeGuideStepIdx]?.id || '',
          deviceId: selectedDevice?.id || '',
          faultCode: selectedGuide?.faultCode || '',
          question: inquiryText,
          photo: inquiryPhoto || '',
          isNewIssue: isNewIssue
        })
      })
      const result = await response.json()
      if (result.code === 200) {
        alert(
          `您的疑问已记录（${isNewIssue ? '标记为新问题' : '关联当前步骤'}）并同步至后台管理系统，请稍后查阅专家回复。`
        )
        setInquiryText('')
        setInquiryPhoto(null)
        setIsNewIssue(false)
        setStep('GUIDE')
      } else {
        alert('提交疑问失败: ' + result.message)
      }
    } catch (error) {
      console.error('提交疑问失败:', error)
      alert('提交疑问失败，请稍后重试')
    } finally {
      setIsSubmittingInquiry(false)
    }
  }

  const ongoingRepair = useMemo(() => {
    return MOCK_RECORDS.find(
      (r) => r.status === 'ongoing' && r.engineerId === MOCK_USER.id
    )
  }, [])

  const renderContent = () => {
    if (step === 'APP_LOGIN') {
      return (
        <div className='absolute inset-0 z-[200] bg-[#0f172a] flex flex-col items-center justify-between p-8 animate-in fade-in duration-500'>
          <div className='w-full flex flex-col items-center mt-12'>
            <div className='bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20 mb-6'>
              <ShieldCheck className='w-10 h-10 text-white' />
            </div>
            <h2 className='text-2xl font-black text-white tracking-tight'>
              PDA 终端
            </h2>
            <p className='text-slate-400 text-xs mt-2 uppercase tracking-[0.2em]'>
              安全运维管理系统
            </p>
          </div>

          <div className='flex flex-col items-center space-y-8 w-full'>
            <div className='relative w-48 h-48'>
              {/* 背景装饰环 */}
              <div
                className={`absolute inset-0 border-2 border-dashed border-blue-500/30 rounded-full ${isRfidScanning ? 'animate-spin-slow' : ''}`}
              />

              {/* 核心扫描区 */}
              <div
                className={`absolute inset-4 rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-500 ${isRfidScanning ? 'bg-blue-600/20 border-blue-500 scale-105' : 'bg-white/5 border-white/10 border-2'}`}>
                {isRfidScanning ? (
                  <>
                    <ScanLine className='w-12 h-12 text-blue-400 animate-pulse' />
                    <p className='text-[10px] font-black text-blue-400 uppercase tracking-widest mt-4'>
                      正在读取 RFID...
                    </p>
                  </>
                ) : (
                  <>
                    <Radio className='w-12 h-12 text-slate-500' />
                    <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4 text-center px-4'>
                      请将工卡靠近
                      <br />
                      PDA 感应区
                    </p>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setIsRfidScanning(true)
                setTimeout(() => {
                  setIsRfidScanning(false)
                  setIsAppAuthenticated(true)
                  setStep('DASHBOARD')
                }, 2000)
              }}
              disabled={isRfidScanning}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl ${isRfidScanning ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-500 active:scale-95'}`}>
              {isRfidScanning ? '识别中...' : '模拟 RFID 登录'}
            </button>
          </div>

          <div className='w-full text-center space-y-4 mb-4'>
            <div className='flex items-center justify-center space-x-2'>
              <div className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
              <span className='text-[10px] font-bold text-slate-500 uppercase tracking-widest'>
                设备状态: 已就绪
              </span>
            </div>
            <p className='text-[9px] text-slate-600 font-bold uppercase tracking-widest'>
              NXP SEMICONDUCTORS · V1.2.0
            </p>
          </div>

          <style>{`
            @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .animate-spin-slow {
              animation: spin-slow 8s linear infinite;
            }
          `}</style>
        </div>
      )
    }

    if (step === 'DASHBOARD') {
      return renderDashboard()
    }

    if (step === 'DEVICE_DETAIL') {
      return renderDeviceDetail()
    }

    if (step === 'ALARM_SELECT') {
      return (
        <div className='space-y-5 animate-in slide-in-from-bottom-4 duration-500 pb-10'>
          <div className='flex items-center space-x-3 mb-2'>
            <button
              onClick={() => setStep('DASHBOARD')}
              className='p-2 bg-slate-100 rounded-full text-slate-500'>
              <ArrowLeft size={18} />
            </button>
            <div className='flex-1'>
              <h2 className='text-sm font-black text-slate-900'>
                已识别机台: {selectedDevice?.model}
              </h2>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='flex flex-col space-y-3'>
              <div className='flex items-center justify-between px-1'>
                <h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center'>
                  <AlertTriangle size={12} className='mr-1.5 text-amber-500' />{' '}
                  选择当前报警代码
                </h4>
              </div>
              {/* 报警代码下拉框 */}
              <div className='grid grid-cols-2 gap-3'>
              <div className='relative'>
                <select
                  value={selectedFaultCode}
                  onChange={(e) => {
                    const code = e.target.value
                    setSelectedFaultCode(code)
                    // 选择报警代码后自动关联报警内容
                    if (code) {
                      const guide = (
                        guides.length > 0
                          ? guides
                          : MOCK_GUIDES
                      ).find((g) => g.faultCode === code)
                      setSelectedFaultCategory(guide?.faultCategory || '')
                    }
                  }}
                  className='w-full pl-4 pr-10 py-3 bg-white rounded-2xl border border-slate-100 text-[11px] font-bold outline-none focus:border-blue-400 transition-all shadow-sm appearance-none cursor-pointer'>
                  <option value=''>请选择报警代码</option>
                  {alarmCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                <div className='absolute inset-y-0 right-4 flex items-center pointer-events-none'>
                  <ChevronDown size={14} className='text-slate-400' />
                </div>
              </div>
              {/* 报警内容下拉框 */}
              <div className='relative'>
                <select
                  value={selectedFaultCategory}
                  onChange={(e) => {
                    const category = e.target.value
                    setSelectedFaultCategory(category)
                    // 选择报警内容后自动关联报警代码
                    if (category) {
                      const guide = (
                        guides.length > 0
                          ? guides
                          : MOCK_GUIDES
                      ).find((g) => g.faultCategory === category)
                      setSelectedFaultCode(guide?.faultCode || '')
                    }
                  }}
                  className='w-full pl-4 pr-10 py-3 bg-white rounded-2xl border border-slate-100 text-[11px] font-bold outline-none focus:border-blue-400 transition-all shadow-sm appearance-none cursor-pointer'>
                  <option value=''>请选择报警内容</option>
                  {alarmCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className='absolute inset-y-0 right-4 flex items-center pointer-events-none'>
                  <ChevronDown size={14} className='text-slate-400' />
                </div>
              </div>
              </div>
            </div>

            <div className='space-y-8'>
              {Object.keys(groupedAlarms).length > 0 ? (
                (
                  Object.entries(groupedAlarms) as [
                    string,
                    MaintenanceGuide[]
                  ][]
                ).map(([scope, alarms]) => (
                  <div key={scope} className='space-y-3'>
                    <div className='flex items-center space-x-2 px-1'>
                      <div className='w-1 h-3 bg-blue-600 rounded-full'></div>
                      <h5 className='text-[11px] font-black text-slate-900 uppercase tracking-wider'>
                        {scope}
                      </h5>
                      <span className='text-[9px] font-black text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100'>
                        {alarms.length}
                      </span>
                    </div>
                    <div className='grid grid-cols-1 gap-3'>
                      {alarms.map((guide) => (
                        <button
                          key={guide.id}
                          onClick={() => {
                            setSelectedGuide(guide)
                            setActiveGuideStepIdx(0)
                            setShowHistoryOverlay(false)
                            setStep('STEP_LIST')
                          }}
                          className='flex flex-col p-5 bg-white rounded-3xl border border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm group text-left relative overflow-hidden'>
                          <div className='flex justify-between items-start mb-2'>
                            <div className='flex items-center space-x-2'>
                              <span className='text-[11px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg uppercase tracking-wider'>
                                {guide.faultCode}
                              </span>
                            </div>
                          </div>
                          <h3 className='text-sm font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors'>
                            {guide.faultCategory}
                          </h3>
                          <p className='text-[10px] text-slate-400 line-clamp-1 italic font-medium'>
                            {guide.faultPhenomenon}
                          </p>
                          <div className='absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <div className='p-2 bg-blue-600 text-white rounded-full shadow-lg'>
                              <ChevronRight size={14} />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className='p-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center space-y-3'>
                  <div className='p-4 bg-white rounded-full w-fit mx-auto shadow-sm'>
                    <Search size={24} className='text-slate-300' />
                  </div>
                  <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                    未找到匹配的报警代码
                  </p>
                </div>
              )}

              {/* 查看全部报警按钮 */}
              <button
                onClick={() => setShowAllAlarms(true)}
                className='w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center space-x-2'>
                <Layers size={14} />
                <span>查看全部报警代码列表</span>
              </button>
            </div>

            {/* 全部报警代码弹窗 */}
            {showAllAlarms && (
              <div className='absolute inset-0 z-[250] bg-slate-900/60 backdrop-blur-md flex items-end animate-in fade-in duration-300 -mx-4'>
                <div className='w-full bg-white rounded-t-[3rem] shadow-2xl flex flex-col h-[95%] animate-in slide-in-from-bottom-full duration-500 overflow-hidden'>
                  <div className='p-8 border-b border-slate-100 flex items-center justify-between shrink-0'>
                    <div className='flex items-center space-x-4'>
                      <div className='p-3 bg-blue-50 text-blue-600 rounded-2xl'>
                        <Layers size={24} />
                      </div>
                      <div>
                        <h3 className='text-lg font-black text-slate-900'>
                          全部报警代码库
                        </h3>
                        <p className='text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5'>
                          机台: {selectedDevice?.model} · 共{' '}
                          {guides.length > 0
                            ? guides.length
                            : MOCK_GUIDES.filter(
                                (g) => g.deviceId === selectedDevice?.id
                              ).length}{' '}
                          条
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAllAlarms(false)}
                      className='p-3 bg-slate-100 rounded-full text-slate-500 active:scale-90 transition-transform'>
                      <X size={24} />
                    </button>
                  </div>
                  <div className='flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide'>
                    <div className='grid grid-cols-1 gap-3 pb-10'>
                      {(guides.length > 0
                        ? guides
                        : MOCK_GUIDES.filter(
                            (g) => g.deviceId === selectedDevice?.id
                          )
                      ).map((guide) => (
                        <div
                          key={guide.id}
                          onClick={() => {
                            setSelectedGuide(guide)
                            setActiveGuideStepIdx(0)
                            setShowHistoryOverlay(false)
                            setStep('STEP_LIST')
                            setShowAllAlarms(false)
                          }}
                          className='p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group active:bg-blue-50 transition-all cursor-pointer'>
                          <div className='flex items-center space-x-4'>
                            <span className='text-[11px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg uppercase tracking-wider'>
                              {guide.faultCode}
                            </span>
                            <div>
                              <h4 className='text-sm font-black text-slate-800'>
                                {guide.faultCategory}
                              </h4>
                              <span className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>
                                {guide.scope}
                              </span>
                            </div>
                          </div>
                          <ChevronRight
                            size={18}
                            className='text-slate-300 group-hover:text-blue-500 transition-colors'
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 报修申请详情弹窗 - 嵌套在手机边框内 */}
            {viewingRequest && (
              <div className='absolute inset-0 z-[260] bg-slate-900/60 backdrop-blur-md flex items-end animate-in fade-in duration-300 -mx-4'>
                <div className='w-full bg-white rounded-t-[3rem] shadow-2xl flex flex-col h-[95%] animate-in slide-in-from-bottom-full duration-500 overflow-hidden'>
                  <div className='p-8 border-b border-slate-100 flex items-center justify-between shrink-0'>
                    <div className='flex items-center space-x-4'>
                      <div className='p-3 bg-blue-50 text-blue-600 rounded-2xl'>
                        <ClipboardList size={24} />
                      </div>
                      <div>
                        <h3 className='text-lg font-black text-slate-900'>
                          报修申请详情
                        </h3>
                        <p className='text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5'>
                          单号: {viewingRequest.id}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewingRequest(null)}
                      className='p-3 bg-slate-100 rounded-full text-slate-500 active:scale-90 transition-transform'>
                      <X size={24} />
                    </button>
                  </div>

                  <div className='flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide pb-20'>
                    <div className='bg-white px-6 py-5 space-y-4 rounded-[2rem] border border-slate-100 shadow-sm'>
                      <h2 className='text-sm font-black text-slate-900 flex items-center'>
                        <ClipboardList
                          size={14}
                          className='mr-2 text-blue-600'
                        />
                        报修信息
                      </h2>
                      <div className='space-y-3 text-[13px] text-slate-600'>
                        <div className='flex items-start'>
                          <span className='w-20 shrink-0 font-medium'>
                            设备名称:
                          </span>
                          <span className='font-bold text-slate-800'>
                            {viewingRequest.deviceSN} |{' '}
                            {viewingRequest.deviceName}
                          </span>
                        </div>
                        <div className='flex items-start'>
                          <span className='w-20 shrink-0 font-medium'>
                            报修时间:
                          </span>
                          <span className='font-bold text-slate-800'>
                            {viewingRequest.requestTime}
                          </span>
                        </div>
                        <div className='flex items-start'>
                          <span className='w-20 shrink-0 font-medium'>
                            报修人:
                          </span>
                          <span className='font-bold text-slate-800'>
                            {viewingRequest.requester}
                          </span>
                        </div>
                        <div className='flex items-start'>
                          <span className='w-20 shrink-0 font-medium'>
                            问题类型:
                          </span>
                          <span className='font-bold text-slate-800'>
                            预见性维护
                          </span>
                        </div>
                        <div className='flex items-start'>
                          <span className='w-20 shrink-0 font-medium'>
                            问题描述:
                          </span>
                          <span className='font-bold text-slate-800'>
                            {viewingRequest.description}
                          </span>
                        </div>
                        <div className='flex items-start'>
                          <span className='w-20 shrink-0 font-medium'>
                            相关图片:
                          </span>
                          <span className='font-bold text-slate-800'></span>
                        </div>
                        <div className='flex items-start'>
                          <span className='w-20 shrink-0 font-medium'>
                            关联批号:
                          </span>
                          <span className='font-bold text-slate-800'></span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setViewingRequest(null)}
                      className='w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all'>
                      关闭
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 新增：待处理维修申请模块 */}
            <div className='pt-4 pb-8 border-t border-slate-100 mt-6'>
              <div className='flex items-center justify-between px-1 mb-4'>
                <h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center'>
                  <Clock size={12} className='mr-1.5 text-blue-500' />{' '}
                  相关报修内容
                </h4>
              </div>

              <div className='space-y-3'>
                {MOCK_REPAIR_REQUESTS.map((request) => (
                  <div
                    key={request.id}
                    className='bg-white rounded-3xl p-4 border border-slate-100 shadow-sm relative group active:scale-[0.98] transition-all cursor-pointer'
                    onClick={() => setViewingRequest(request)}>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex items-center space-x-2'>
                        <div
                          className={`w-2 h-2 rounded-full ${request.priority === 'high' ? 'bg-rose-500 animate-pulse' : request.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
                        <span className='text-[10px] font-black text-slate-900'>
                          {request.deviceName}
                        </span>
                      </div>
                      <span className='text-[9px] font-bold text-slate-400'>
                        {request.requestTime}
                      </span>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <span className='text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md'>
                          {request.faultCode}
                        </span>
                        <h5 className='text-[11px] font-bold text-slate-700'>
                          {request.description}
                        </h5>
                      </div>
                      <div className='flex items-center justify-between text-[9px] text-slate-400'>
                        <div className='flex items-center space-x-3'>
                          <span className='flex items-center'>
                            工程师: {request.requester}
                          </span>
                          <span className='flex items-center font-mono'>
                            SN: {request.deviceSN}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (step === 'STEP_LIST' && selectedGuide) {
      return (
        <div className='flex flex-col h-full animate-in slide-in-from-bottom-6 duration-500 relative pb-10'>
          <div className='flex items-center space-x-3 mb-6 shrink-0'>
            <button
              onClick={() => setStep('ALARM_SELECT')}
              className='p-2 bg-slate-100 rounded-full text-slate-500'>
              <ArrowLeft size={18} />
            </button>
            <div className='flex-1'>
              <h2 className='text-sm font-black text-slate-900'>
                规程步骤清单: {selectedGuide.faultCode}
              </h2>
              <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>
                {selectedGuide.faultCategory}
              </p>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide pb-24'>
            <div className='bg-blue-50/50 p-5 rounded-[2rem] border border-blue-100/50 mb-2'>
              <div className='flex items-center space-x-3'>
                <div className='p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100'>
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h4 className='text-xs font-black text-slate-900'>
                    执行优先级建议
                  </h4>
                  <p className='text-[10px] text-blue-600/70 font-bold uppercase tracking-tight mt-0.5'>
                    已根据历史维修反馈次数进行智能排序
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              {sortedSteps.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveGuideStepIdx(idx)
                    setShowHistoryOverlay(false) // 直接跳转不显示历史浮层
                    setStep('GUIDE')
                  }}
                  className='p-5 bg-white rounded-3xl border border-slate-100 shadow-sm relative group cursor-pointer active:scale-[0.98] transition-all hover:border-blue-300'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-wider'>
                      步骤 {idx + 1}
                    </span>
                    <div className='flex items-center space-x-2'>
                      <div className='flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100'>
                        <History size={10} />
                        <span className='text-[9px] font-black uppercase tracking-tighter'>
                          反馈次数: {s.historyRepairCount || 1}
                        </span>
                      </div>
                      <div className='p-1 bg-blue-50 text-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity'>
                        <Play size={10} fill='currentColor' />
                      </div>
                    </div>
                  </div>
                  <h3 className='text-sm font-black text-slate-800 leading-snug group-hover:text-blue-600 transition-colors'>
                    {s.title}
                  </h3>
                  <p className='text-[10px] text-slate-400 mt-2 line-clamp-2 italic'>
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className='pt-6 shrink-0 pb-20'>
            <button
              onClick={() => {
                setActiveGuideStepIdx(0)
                setShowHistoryOverlay(true)
                setStep('GUIDE')
              }}
              className='w-full py-5 bg-blue-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center space-x-2 group'>
              <span>查看报修情况</span>
              <Play
                size={14}
                className='group-hover:translate-x-1 transition-transform'
              />
            </button>
          </div>
        </div>
      )
    }

    if (step === 'GUIDE' && selectedGuide) {
      const currentStep = sortedSteps[activeGuideStepIdx]
      const currentRequest =
        MOCK_REPAIR_REQUESTS.find(
          (r) => r.deviceId === selectedGuide.deviceId
        ) ||
        MOCK_REPAIR_REQUESTS[0] ||
        null
      return (
        <div className='flex flex-col h-full animate-in fade-in duration-500 relative'>
          {/* 报修信息浮层 - 进入时显示 */}
          {showHistoryOverlay && (
            <div className='absolute inset-0 z-[180] bg-slate-900/60 backdrop-blur-md flex items-end animate-in fade-in duration-300'>
              <div className='w-full bg-white rounded-t-[3rem] shadow-2xl flex flex-col max-h-[88%] animate-in slide-in-from-bottom-full duration-500 overflow-hidden'>
                <div className='p-8 border-b border-slate-100 flex items-center justify-between shrink-0'>
                  <div className='flex items-center space-x-4'>
                    <div className='p-3 bg-blue-50 text-blue-600 rounded-2xl'>
                      <ClipboardList size={24} />
                    </div>
                    <div>
                      <h3 className='text-lg font-black text-slate-900'>
                        报修申请详情
                      </h3>
                      <p className='text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5'>
                        单号: {currentRequest?.id || '—'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHistoryOverlay(false)}
                    className='p-3 bg-slate-100 rounded-full text-slate-500 active:scale-90 transition-transform'>
                    <X size={24} />
                  </button>
                </div>

                <div className='flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide pb-4'>
                  <div className='bg-white px-6 py-5 space-y-4 rounded-[2rem] border border-slate-100 shadow-sm'>
                    <h2 className='text-sm font-black text-slate-900 flex items-center'>
                      <ClipboardList size={14} className='mr-2 text-blue-600' />
                      报修信息
                    </h2>
                    <div className='space-y-3 text-[13px] text-slate-600'>
                      <div className='flex items-start'>
                        <span className='w-20 shrink-0 font-medium'>
                          设备名称:
                        </span>
                        <span className='font-bold text-slate-800'>
                          {currentRequest?.deviceSN || '—'} |{' '}
                          {currentRequest?.deviceName || '—'}
                        </span>
                      </div>
                      <div className='flex items-start'>
                        <span className='w-20 shrink-0 font-medium'>
                          报修时间:
                        </span>
                        <span className='font-bold text-slate-800'>
                          {currentRequest?.requestTime || '—'}
                        </span>
                      </div>
                      <div className='flex items-start'>
                        <span className='w-20 shrink-0 font-medium'>
                          报修人:
                        </span>
                        <span className='font-bold text-slate-800'>
                          {currentRequest?.requester || '—'}
                        </span>
                      </div>
                      <div className='flex items-start'>
                        <span className='w-20 shrink-0 font-medium'>
                          问题类型:
                        </span>
                        <span className='font-bold text-slate-800'>
                          预见性维护
                        </span>
                      </div>
                      <div className='flex items-start'>
                        <span className='w-20 shrink-0 font-medium'>
                          问题描述:
                        </span>
                        <span className='font-bold text-slate-800'>
                          {currentRequest?.description || '—'}
                        </span>
                      </div>
                      <div className='flex items-start'>
                        <span className='w-20 shrink-0 font-medium'>
                          相关图片:
                        </span>
                        <span className='font-bold text-slate-800'></span>
                      </div>
                      <div className='flex items-start'>
                        <span className='w-20 shrink-0 font-medium'>
                          关联批号:
                        </span>
                        <span className='font-bold text-slate-800'></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='p-8 bg-white border-t border-slate-100 shrink-0'>
                  <button
                    onClick={() => setShowHistoryOverlay(false)}
                    className='w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all'>
                    关闭
                  </button>
                </div>
              </div>
            </div>
          )}

          {previewPdfUrl && (
            <div className='absolute inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom-10'>
              <div className='p-4 flex items-center justify-between border-b border-slate-100'>
                <div className='flex items-center space-x-2'>
                  <FileSearch className='text-blue-600' size={18} />
                  <span className='text-xs font-black text-slate-900'>
                    参考手册预览
                  </span>
                </div>
                <button
                  onClick={() => setPreviewPdfUrl(null)}
                  className='p-2 bg-slate-100 rounded-full text-slate-500'>
                  <X size={18} />
                </button>
              </div>
              <div className='flex-1 bg-slate-200 flex items-center justify-center relative'>
                <iframe
                  src={previewPdfUrl}
                  className='w-full h-full border-none'
                  title='PDF Manual'></iframe>
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 flex flex-col items-center space-y-2 pointer-events-none'>
                  <BookOpen size={48} className='opacity-20' />
                  <p className='text-[10px] font-bold uppercase tracking-widest'>
                    加载技术文档中...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className='flex items-center justify-between mb-6 shrink-0'>
            <button
              onClick={() => setStep('ALARM_SELECT')}
              className='p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors'>
              <ArrowLeft size={18} />
            </button>
            <div className='text-center'>
              <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                正在进行: {selectedGuide.faultCode}
              </p>
              <button
                onClick={() => setShowStepJump(true)}
                className='flex items-center space-x-1 mt-1 justify-center bg-white px-3 py-0.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors'>
                <span className='text-[10px] font-bold text-blue-600'>
                  步骤 {activeGuideStepIdx + 1} / {sortedSteps.length}
                </span>
                <ChevronRight size={12} className='text-slate-400 rotate-90' />
              </button>
            </div>
            <button
              onClick={() => setShowHistoryOverlay(true)}
              className='p-2 bg-amber-50 rounded-full text-amber-600 hover:bg-amber-100 transition-colors shadow-sm'>
              <History size={18} />
            </button>
          </div>

          {/* 检查点跳转浮层 */}
          {showStepJump && (
            <div className='absolute inset-0 z-[190] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300'>
              <div className='w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300'>
                <div className='p-6 border-b border-slate-100 flex items-center justify-between'>
                  <h3 className='text-sm font-black text-slate-900'>
                    跳转检查点
                  </h3>
                  <button
                    onClick={() => setShowStepJump(false)}
                    className='p-2 bg-slate-100 rounded-full text-slate-500'>
                    <X size={16} />
                  </button>
                </div>
                <div className='max-h-[400px] overflow-y-auto p-4 space-y-2 scrollbar-hide'>
                  {sortedSteps.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveGuideStepIdx(idx)
                        setShowStepJump(false)
                      }}
                      className={`w-full p-4 rounded-2xl text-left transition-all border ${idx === activeGuideStepIdx ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-300'}`}>
                      <div className='flex justify-between items-center'>
                        <span className='text-xs font-black'>
                          第 {idx + 1} 步: {s.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 帮助内容浮层 */}
          {showHelp && currentStep && (
            <div className='absolute inset-0 z-[190] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300'>
              <div className='w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300'>
                <div className='p-6 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white'>
                  <div className='flex items-center space-x-2'>
                    <Info size={18} />
                    <h3 className='text-sm font-black'>专家帮助与技巧</h3>
                  </div>
                  <button
                    onClick={() => setShowHelp(false)}
                    className='p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors'>
                    <X size={16} />
                  </button>
                </div>
                <div className='p-8 space-y-4'>
                  <div className='p-5 bg-blue-50 rounded-3xl border border-blue-100'>
                    <p className='text-xs text-blue-800 leading-relaxed font-medium italic'>
                      "
                      {currentStep.helpContent ||
                        '该步骤暂无特定的专家建议，请严格按照操作说明进行。'}
                      "
                    </p>
                  </div>
                  <button
                    onClick={() => setShowHelp(false)}
                    className='w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all'>
                    明白了
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep ? (
            <>
              <div className='flex-1 overflow-y-auto space-y-6 scrollbar-hide pb-36'>
                <div className='bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-5'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <span className='bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg'>
                        步骤 {activeGuideStepIdx + 1}
                      </span>
                      <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                        {currentStep.stage}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowHelp(true)}
                      className='p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors'>
                      <Info size={16} />
                    </button>
                  </div>
                  <h3 className='text-base font-black text-slate-900 leading-tight'>
                    {currentStep.title}
                  </h3>

                  {/* 多媒体内容展示 */}
                  {(currentStep.imageUrl ||
                    currentStep.videoUrl ||
                    currentStep.pdfUrl ||
                    currentStep.mediaUrl ||
                    (currentStep.imageUrls &&
                      currentStep.imageUrls.length > 0) ||
                    (currentStep.videoUrls &&
                      currentStep.videoUrls.length > 0) ||
                    (currentStep.pdfUrls &&
                      currentStep.pdfUrls.length > 0)) && (
                    <div className='space-y-4'>
                      {/* 图片展示 */}
                      {(
                        currentStep.imageUrls ||
                        (currentStep.imageUrl ? [currentStep.imageUrl] : [])
                      ).map((url, idx) => {
                        const mediaResource = MOCK_MEDIA_RESOURCES.find(
                          (m) => m.url === url
                        )
                        return (
                          <div key={`img-${idx}`} className='space-y-2'>
                            {mediaResource?.description && (
                              <div className='px-4 py-2 bg-indigo-50/50 border-l-4 border-indigo-400 rounded-r-xl'>
                                <p className='text-[11px] font-bold text-indigo-700 leading-relaxed'>
                                  <span className='opacity-50 mr-1'>#</span>{' '}
                                  {mediaResource.description}
                                </p>
                              </div>
                            )}
                            <div className='relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 group'>
                              <img
                                src={url}
                                className='w-full aspect-video object-cover'
                                alt={`操作示意图 ${idx + 1}`}
                              />
                              <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none'>
                                <Maximize2 size={24} className='text-white' />
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {/* 视频展示 */}
                      {(
                        currentStep.videoUrls ||
                        (currentStep.videoUrl ? [currentStep.videoUrl] : [])
                      ).map((url, idx) => {
                        const mediaResource = MOCK_MEDIA_RESOURCES.find(
                          (m) => m.url === url
                        )
                        return (
                          <div key={`vid-${idx}`} className='space-y-2'>
                            {mediaResource?.description && (
                              <div className='px-4 py-2 bg-indigo-50/50 border-l-4 border-indigo-400 rounded-r-xl'>
                                <p className='text-[11px] font-bold text-indigo-700 leading-relaxed'>
                                  <span className='opacity-50 mr-1'>#</span>{' '}
                                  {mediaResource.description}
                                </p>
                              </div>
                            )}
                            <div className='relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-black aspect-video group'>
                              <video
                                src={url}
                                className='w-full h-full object-contain'
                                poster={currentStep.imageUrl}
                              />
                              <button
                                className='absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all'
                                onClick={(e) => {
                                  const video = e.currentTarget
                                    .previousElementSibling as HTMLVideoElement
                                  if (video.paused) {
                                    video.play()
                                    video.controls = true
                                    ;(
                                      e.currentTarget as HTMLElement
                                    ).style.display = 'none'
                                  }
                                }}>
                                <div className='w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl'>
                                  <PlayCircle
                                    size={32}
                                    className='text-blue-600 ml-1'
                                  />
                                </div>
                              </button>
                            </div>
                          </div>
                        )
                      })}

                      {/* PDF 展示 */}
                      {(
                        currentStep.pdfUrls ||
                        (currentStep.pdfUrl
                          ? [currentStep.pdfUrl]
                          : currentStep.mediaType === 'pdf' &&
                              currentStep.mediaUrl
                            ? [currentStep.mediaUrl]
                            : [])
                      ).map((url, idx) => {
                        const mediaResource = MOCK_MEDIA_RESOURCES.find(
                          (m) => m.url === url
                        )
                        return (
                          <div key={`pdf-${idx}`} className='space-y-2'>
                            {mediaResource?.description && (
                              <div className='px-4 py-2 bg-indigo-50/50 border-l-4 border-indigo-400 rounded-r-xl'>
                                <p className='text-[11px] font-bold text-indigo-700 leading-relaxed'>
                                  <span className='opacity-50 mr-1'>#</span>{' '}
                                  {mediaResource.description}
                                </p>
                              </div>
                            )}
                            <div className='p-6 flex flex-col items-center justify-center space-y-4 bg-rose-50 border border-rose-100 rounded-[2rem]'>
                              <div className='p-3 bg-white text-rose-500 rounded-2xl shadow-sm'>
                                <FileText size={24} />
                              </div>
                              <div className='text-center'>
                                <p className='text-[11px] font-black text-rose-900'>
                                  关联技术参考手册 {idx + 1}
                                </p>
                                <p className='text-[9px] text-rose-400 mt-1 uppercase font-bold tracking-tighter'>
                                  Technical_Doc_Reference_{idx + 1}.pdf
                                </p>
                              </div>
                              <button
                                onClick={() => setPreviewPdfUrl(url)}
                                className='w-full py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center shadow-lg shadow-rose-200 active:scale-95 transition-all'>
                                <FileSearch size={14} className='mr-2' />{' '}
                                在线查阅 PDF 文档
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* 操作说明 */}
                  {currentStep.instruction && (
                    <div className='space-y-3'>
                      <div className='flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2'>
                        <Hammer size={12} className='text-blue-500' />
                        <span>操作说明</span>
                      </div>
                      <p className='text-[13px] text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100'>
                        {currentStep.instruction}
                      </p>
                    </div>
                  )}

                  {/* 判断方法 */}
                  {currentStep.judgmentMethod && (
                    <div className='space-y-3'>
                      <div className='flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2'>
                        <CheckCircle2 size={12} className='text-emerald-500' />
                        <span>判断方法</span>
                      </div>
                      <div className='p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl'>
                        <p className='text-[13px] text-emerald-900 leading-relaxed font-bold'>
                          {currentStep.judgmentMethod}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className='space-y-3'>
                    <div className='flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2'>
                      <FileText size={12} className='text-blue-500' />
                      <span>步骤描述</span>
                    </div>
                    <p className='text-[13px] text-slate-700 leading-relaxed font-medium'>
                      {currentStep.description}
                    </p>
                  </div>

                  {currentStep.safetyWarning && (
                    <div className='bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start space-x-3'>
                      <AlertTriangle
                        className='text-rose-500 shrink-0 mt-0.5'
                        size={16}
                      />
                      <div>
                        <p className='text-[10px] font-black text-rose-600 uppercase tracking-widest'>
                          安全警示 / Safety First
                        </p>
                        <p className='text-[11px] text-rose-800 font-bold mt-1 leading-snug'>
                          {currentStep.safetyWarning}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className='absolute bottom-20 left-0 right-0 px-4 pt-10 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-40 flex space-x-3'>
                <button
                  onClick={() => {
                    setSubmissionSource('CLOSE')
                    setStep('FINAL_SUBMIT')
                  }}
                  className='flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all'>
                  CLOSE 结束
                </button>
                <button
                  onClick={() => {
                    if (activeGuideStepIdx < sortedSteps.length - 1) {
                      setActiveGuideStepIdx((prev) => prev + 1)
                    } else {
                      setSubmissionSource('PASS')
                      setStep('FINAL_SUBMIT')
                    }
                  }}
                  className='flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 flex items-center justify-center space-x-2 active:scale-95 transition-all'>
                  <span>
                    {activeGuideStepIdx === sortedSteps.length - 1
                      ? 'PASS 完工'
                      : '下一步'}
                  </span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className='flex flex-col items-center justify-center h-64 text-slate-400 italic'>
              <AlertCircle size={40} className='mb-2 opacity-20' />
              该指南暂无具体步骤数据。
            </div>
          )}
        </div>
      )
    }

    if (step === 'REPAIR_DETAIL' && viewingRepairRecord) {
      const guide = MOCK_GUIDES.find(
        (g) => g.id === viewingRepairRecord.guideId
      )
      const device = MOCK_DEVICES.find((d) => d.id === guide?.deviceId)
      return (
        <div className='flex flex-col h-full animate-in slide-in-from-right-4 duration-300'>
          <div className='flex items-center justify-between py-2 border-b border-slate-100 mb-4 bg-slate-50 shrink-0'>
            <button
              onClick={() => setStep('DASHBOARD')}
              className='p-2 text-slate-500'>
              <ArrowLeft size={20} />
            </button>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-md'>
                <ClipboardCheck size={18} />
              </div>
              <span className='font-black text-sm text-slate-900'>
                维修任务详情
              </span>
            </div>
            <div className='w-10'></div>
          </div>

          <div className='flex-1 space-y-6 overflow-y-auto scrollbar-hide pb-20'>
            <div className='bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-base font-black text-slate-900'>
                    {device?.model}
                  </h3>
                  <p className='text-[10px] font-mono text-slate-400 uppercase'>
                    {device?.sn}
                  </p>
                </div>
                <div className='text-right'>
                  <span className='text-[10px] font-black bg-amber-100 text-amber-600 px-2 py-1 rounded-lg uppercase tracking-wider'>
                    {guide?.faultCode}
                  </span>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 pt-2 border-t border-slate-50'>
                <div className='space-y-1'>
                  <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                    开始时间
                  </p>
                  <p className='text-xs font-bold text-slate-700'>
                    {new Date(viewingRepairRecord.startTime).toLocaleString()}
                  </p>
                </div>
                <div className='space-y-1'>
                  <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                    指派工程师
                  </p>
                  <p className='text-xs font-bold text-slate-700'>
                    {MOCK_USER.name}
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-3 px-1'>
              <h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center'>
                <AlertTriangle size={12} className='mr-1.5 text-amber-500' />{' '}
                当前进展
              </h4>
              <div className='bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4'>
                <div className='flex items-start space-x-3'>
                  <div className='p-2 bg-blue-50 text-blue-600 rounded-xl'>
                    <Info size={16} />
                  </div>
                  <div>
                    <p className='text-xs font-bold text-slate-800 leading-relaxed'>
                      {viewingRepairRecord.treatment}
                    </p>
                  </div>
                </div>
                <div className='pt-3 border-t border-slate-50 flex items-center justify-between'>
                  <span className='text-[10px] font-black text-slate-400 uppercase'>
                    已完成步骤
                  </span>
                  <span className='text-xs font-black text-blue-600'>
                    {viewingRepairRecord.completedSteps.length} /{' '}
                    {guide?.steps.length}
                  </span>
                </div>
                <div className='w-full h-1.5 bg-slate-100 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-blue-600 rounded-full transition-all duration-500'
                    style={{
                      width: `${(viewingRepairRecord.completedSteps.length / (guide?.steps.length || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedDevice(device || null)
                setSelectedGuide(guide || null)
                setActiveGuideStepIdx(viewingRepairRecord.completedSteps.length)
                setStep('GUIDE')
              }}
              className='w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center space-x-2'>
              <span>继续执行 SOP</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )
    }

    if (step === 'FINAL_SUBMIT' && selectedGuide) {
      return (
        <div className='flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500'>
          <div className='flex items-center justify-between py-4 border-b border-slate-100 mb-6 shrink-0'>
            <button
              onClick={() => setStep('GUIDE')}
              className='p-2 text-slate-500'>
              <ArrowLeft size={20} />
            </button>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md'>
                <ClipboardCheck size={18} />
              </div>
              <span className='font-black text-sm text-slate-900'>
                执行与反馈记录
              </span>
            </div>
            <div className='w-10'></div>
          </div>

          <div className='flex-1 space-y-6 overflow-y-auto scrollbar-hide pb-24 px-1'>
            <div className='bg-blue-50 p-5 rounded-3xl border border-blue-100 space-y-2'>
              <p className='text-[10px] font-black text-blue-600 uppercase tracking-widest'>
                当前完成进度
              </p>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-black text-slate-800'>
                  {selectedGuide.faultCode}
                </h4>
                <span className='text-xs font-black text-blue-700'>
                  {activeGuideStepIdx + 1} / {sortedSteps.length} 步骤
                </span>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                  操作记录 / 执行说明
                </label>
                <div className='relative'>
                  <select
                    value={repairActionText}
                    onChange={(e) => setRepairActionText(e.target.value)}
                    className='w-full p-5 bg-white border border-slate-200 rounded-3xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all appearance-none pr-12'>
                    <option value='' disabled>
                      请选择本次执行结果...
                    </option>
                    <option value='已完成维修，设备恢复正常'>
                      已完成维修，设备恢复正常
                    </option>
                    <option value='已更换备件，设备运行正常'>
                      已更换备件，设备运行正常
                    </option>
                    <option value='已完成清洁保养'>
                      已完成清洁保养
                    </option>
                    <option value='已完成校准调试'>
                      已完成校准调试
                    </option>
                    <option value='发现新问题，需进一步排查'>
                      发现新问题，需进一步排查
                    </option>
                  </select>
                  <ChevronDown
                    size={16}
                    className='absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
                  />
                </div>
              </div>

              <div className='flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100'>
                <input
                  type='checkbox'
                  id='newIssueCheck'
                  checked={isNewIssue}
                  onChange={(e) => setIsNewIssue(e.target.checked)}
                  className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
                />
                <label
                  htmlFor='newIssueCheck'
                  className='text-[11px] font-black text-rose-600'>
                  这是 SOP 中未提到的新发现/新故障（标记为新问题）
                </label>
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                  上传现场照片
                </label>
                <div className='grid grid-cols-2 gap-3'>
                  {repairPhotos.map((photo, idx) => (
                    <div key={idx} className='relative aspect-square group'>
                      <img
                        src={photo}
                        className='w-full h-full object-cover rounded-2xl border border-slate-100 shadow-sm'
                        alt='维修照片'
                      />
                      <button
                        onClick={() =>
                          setRepairPhotos((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className='absolute -top-2 -right-2 p-1 bg-white text-rose-500 rounded-full shadow-md border border-slate-100'>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {repairPhotos.length < 4 && (
                    <button
                      onClick={() =>
                        setRepairPhotos((prev) => [
                          ...prev,
                          'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400'
                        ])
                      }
                      className='aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all bg-white'>
                      <Camera size={24} />
                      <span className='text-[9px] font-bold uppercase tracking-widest'>
                        添加照片
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className='p-4 bg-white border-t border-slate-100 sticky bottom-20 z-30'>
            <button
              onClick={() => {
                if (!repairActionText.trim()) {
                  alert('请填写操作记录')
                  return
                }
                setStep('REPAIR_REPORT')
              }}
              className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center space-x-2 active:scale-95 transition-all ${!repairActionText.trim() ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-black'}`}>
              <Send size={18} />
              <span>确认提交执行记录</span>
            </button>
          </div>
        </div>
      )
    }

    if (step === 'REPAIR_REPORT' && selectedDevice) {
      const now = new Date()
      const timeStr = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(
        now.getHours()
      ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
        now.getSeconds()
      ).padStart(2, '0')}`

      return (
        <div className='flex flex-col h-full animate-in slide-in-from-right-4 duration-300 bg-slate-50'>
          {/* 顶部导航 */}
          <div className='flex items-center justify-between px-4 py-3 bg-[#2979ff] text-white shrink-0'>
            <button onClick={() => setStep('FINAL_SUBMIT')} className='p-1'>
              <ArrowLeft size={22} />
            </button>
            <span className='text-base font-bold'>维修</span>
            <button className='text-sm opacity-90'>维修记录</button>
          </div>

          <div className='flex-1 overflow-y-auto pb-24'>
            {/* 设备状态栏 */}
            <div className='px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between'>
              <span className='text-sm font-bold text-slate-800 uppercase'>
                {selectedDevice.id} | {selectedDevice.name}
              </span>
              <span className='text-xs font-bold text-amber-500'>维修中</span>
            </div>

            {/* 维修信息表单 */}
            <div className='px-4 py-4 space-y-5'>
              <h3 className='text-base font-bold text-slate-900'>维修信息</h3>

              <div className='space-y-4 text-sm'>
                <div className='flex items-center'>
                  <span className='w-20 text-slate-500'>维修时间：</span>
                  <span className='text-slate-700'>{timeStr}</span>
                </div>

                <div className='flex items-center'>
                  <span className='w-20 text-slate-500'>维修位置：</span>
                  <select
                    value={repairLocation}
                    onChange={(e) => setRepairLocation(e.target.value)}
                    className='flex-1 p-0 bg-transparent text-slate-400 outline-none'>
                    <option value=''>选择位置</option>
                    <option value='A区-01'>A区-01</option>
                    <option value='B区-05'>B区-05</option>
                  </select>
                </div>

                <div className='flex items-center'>
                  <span className='w-20 text-slate-500'>维修内容：</span>
                  <select
                    value={repairContent}
                    onChange={(e) => setRepairContent(e.target.value)}
                    className='flex-1 p-0 bg-transparent text-slate-400 outline-none'>
                    <option value=''>选择内容</option>
                    <option value='更换传感器'>更换传感器</option>
                    <option value='清洁透镜'>清洁透镜</option>
                    <option value='固件升级'>固件升级</option>
                  </select>
                </div>

                <div className='flex flex-col space-y-2'>
                  <span className='text-slate-500'>情况说明：</span>
                  <textarea
                    value={repairActionText}
                    onChange={(e) => setRepairActionText(e.target.value)}
                    className='w-full p-3 bg-white border border-slate-200 rounded-lg h-24 text-sm outline-none'
                  />
                </div>

                <div className='flex flex-col space-y-2'>
                  <span className='text-slate-500'>拍照说明：</span>
                  <div className='flex flex-wrap gap-2'>
                    {repairPhotos.map((photo, idx) => (
                      <div key={idx} className='w-16 h-16 relative'>
                        <img
                          src={photo}
                          className='w-full h-full object-cover rounded-lg'
                          alt='维修照片'
                        />
                        <button
                          onClick={() =>
                            setRepairPhotos((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className='absolute -top-1 -right-1 bg-white text-rose-500 rounded-full shadow-sm'>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {repairPhotos.length < 4 && (
                      <button
                        onClick={() =>
                          setRepairPhotos((prev) => [
                            ...prev,
                            'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400'
                          ])
                        }
                        className='w-16 h-16 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-300 bg-white'>
                        <Plus size={24} />
                      </button>
                    )}
                  </div>
                </div>

                <div className='flex items-center'>
                  <span className='w-20 text-slate-500'>维修状态：</span>
                  <select
                    value={repairStatus}
                    onChange={(e) => setRepairStatus(e.target.value)}
                    className='flex-1 p-0 bg-transparent text-slate-400 outline-none'>
                    <option value='维修中'>选择状态</option>
                    <option value='已完成'>已完成</option>
                    <option value='待料中'>待料中</option>
                  </select>
                </div>

                <div className='flex items-center'>
                  <span className='w-20 text-slate-500'>备件添加：</span>
                  <button className='px-3 py-1 bg-emerald-500 text-white text-xs rounded-full font-bold active:scale-95'>
                    领取备件
                  </button>
                </div>
              </div>

              <div className='pt-4 space-y-3'>
                <h4 className='text-sm font-bold text-slate-700'>
                  最近一次维修记录
                </h4>
                <div className='bg-emerald-100/50 p-4 rounded-2xl relative border border-emerald-100'>
                  <div className='space-y-2 text-xs'>
                    <p className='font-bold text-slate-800'>
                      SMD-05 | Lead Molding
                    </p>
                    <p className='text-slate-600'>报修时间：2026-08-21 08:14:36</p>
                    <p className='text-slate-600'>问题类型：预见性维护</p>
                    <p className='text-slate-600'>负责人：鲁文申</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400'
                  />
                </div>
                <p className='text-[10px] text-slate-400 font-bold'>
                  最近一次该问题类型维修记录
                </p>
              </div>

              {/* 完成提交按钮 */}
              <button
                onClick={() => {
                  setRepairActionText('')
                  setRepairPhotos([])
                  setRepairLocation('')
                  setRepairContent('')
                  setRepairStatus('维修中')
                  setSubmissionSource(null)
                  setIsNewIssue(false)
                  setStep('DASHBOARD')
                }}
                className='w-full py-3.5 bg-emerald-500 text-white rounded-full font-bold text-sm shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center space-x-2'>
                <CheckCircle2 size={18} />
                <span>完成提交</span>
              </button>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className='absolute bottom-0 left-0 right-0 p-4 bg-slate-50/80 backdrop-blur-md'>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() => {
                  setRepairActionText('')
                  setRepairPhotos([])
                  setRepairLocation('')
                  setRepairContent('')
                  setRepairStatus('维修中')
                  setSubmissionSource(null)
                  setIsNewIssue(false)
                  setStep('DASHBOARD')
                }}
                className='w-28 py-3 bg-slate-200 text-slate-600 rounded-full font-bold text-sm active:scale-95 transition-all'>
                完成
              </button>
              <button
                onClick={async () => {
                  setIsSubmittingRepair(true)
                  try {
                    const payload = {
                      guideId: selectedGuide.id,
                      deviceId: selectedDevice?.id,
                      actionText: repairActionText,
                      location: repairLocation,
                      content: repairContent,
                      status: repairStatus,
                      photos: repairPhotos,
                      source: submissionSource || 'APP',
                      isNewIssue
                    }
                    // 模拟 API 调用
                    const response = await fetch(
                      '/backend/repair-records/complete-final',
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                      }
                    )
                    const result = await response.json()
                    if (result.code === 200) {
                      alert('维修报告已成功提交！')
                      setRepairActionText('')
                      setRepairPhotos([])
                      setRepairLocation('')
                      setRepairContent('')
                      setRepairStatus('维修中')
                      setSubmissionSource(null)
                      setIsNewIssue(false)
                      setStep('DASHBOARD')
                    } else {
                      alert('提交失败: ' + result.message)
                    }
                  } catch (error) {
                    console.error('提交失败:', error)
                    alert('提交成功 (模拟模式)')
                    setStep('DASHBOARD')
                  } finally {
                    setIsSubmittingRepair(false)
                  }
                }}
                disabled={isSubmittingRepair}
                className='flex-1 py-3 bg-[#2979ff] text-white rounded-full font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center'>
                {isSubmittingRepair ? (
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                ) : (
                  '提交'
                )}
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (step === 'SUBMIT_INQUIRY' && selectedGuide) {
      const currentStep = selectedGuide.steps[activeGuideStepIdx]
      return (
        <div className='flex flex-col h-full animate-in slide-in-from-right-4 duration-300'>
          <div className='flex items-center justify-between py-2 border-b border-slate-100 mb-4 bg-slate-50 shrink-0'>
            <button
              onClick={() => setStep('GUIDE')}
              className='p-2 text-slate-500'>
              <ArrowLeft size={20} />
            </button>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md'>
                <MessageSquare size={18} />
              </div>
              <span className='font-black text-sm text-slate-900'>
                现场疑问反馈
              </span>
            </div>
            <div className='w-10'></div>
          </div>
          <div className='flex-1 space-y-6 overflow-y-auto scrollbar-hide pb-20'>
            <div className='p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1'>
              <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                当前步骤内容
              </p>
              <h4 className='text-sm font-black text-slate-800'>
                {currentStep.title}
              </h4>
              <p className='text-[11px] text-slate-500 line-clamp-2 italic'>
                {currentStep.description}
              </p>
            </div>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                  详细描述您的问题
                </label>
                <textarea
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  placeholder='请具体说明在该步骤操作中遇到的难点或不一致之处...'
                  className='w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs min-h-[160px] outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner'
                />
              </div>

              <div className='flex items-center space-x-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100'>
                <input
                  type='checkbox'
                  id='newInquiryIssueCheck'
                  checked={isNewIssue}
                  onChange={(e) => setIsNewIssue(e.target.checked)}
                  className='w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500'
                />
                <label
                  htmlFor='newInquiryIssueCheck'
                  className='text-[11px] font-black text-rose-600'>
                  这是 SOP 中未提到的全新情况（标记为脱离步骤的新发现）
                </label>
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                  附件/现场照片 (可选)
                </label>
                {inquiryPhoto ? (
                  <div className='relative group'>
                    <img
                      src={inquiryPhoto}
                      className='w-full h-40 object-cover rounded-2xl border-2 border-emerald-500 shadow-lg'
                      alt='现场照片'
                    />
                    <button
                      onClick={() => setInquiryPhoto(null)}
                      className='absolute top-2 right-2 p-1.5 bg-white text-rose-500 rounded-full shadow-md'>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleInquiryPhoto}
                    className='w-full p-10 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all bg-white'>
                    <Camera size={32} />
                    <span className='text-[10px] font-bold uppercase tracking-widest'>
                      拍照或上传现场图片
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className='p-4 bg-white border-t border-slate-100 sticky bottom-20 z-30'>
            <button
              disabled={!inquiryText.trim() || isSubmittingInquiry}
              onClick={handleSubmitInquiry}
              className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center space-x-2 active:scale-95 transition-all ${!inquiryText.trim() || isSubmittingInquiry ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
              {isSubmittingInquiry ? (
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              ) : (
                <>
                  <Send size={18} />
                  <span>提交至后台记录</span>
                </>
              )}
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className='p-10 text-center text-slate-400 text-xs'>加载中...</div>
    )
  }

  const renderDeviceDetail = () => {
    if (!viewingRequest) return null
    const device = MOCK_DEVICES.find((d) => d.id === viewingRequest.deviceId)

    return (
      <div className='flex flex-col h-full bg-[#f4f7f9] animate-in slide-in-from-right-4 duration-300 overflow-y-auto pb-20'>
        {/* Header */}
        <div className='bg-blue-600 px-4 py-4 flex items-center relative shrink-0'>
          <button
            onClick={() => setStep('DASHBOARD')}
            className='absolute left-4 text-white p-1 hover:bg-white/10 rounded-full transition-colors'>
            <ArrowLeft size={20} />
          </button>
          <h1 className='text-white text-lg font-bold mx-auto'>设备详情</h1>
        </div>

        {/* Sub Header */}
        <div className='bg-white px-4 py-3 border-b border-slate-100 flex justify-between items-center shrink-0'>
          <div className='font-bold text-slate-800 text-sm'>
            {viewingRequest.deviceSN} &nbsp;&nbsp; | &nbsp;&nbsp; {viewingRequest.deviceName}
          </div>
          <span className='text-xs font-bold text-amber-500'>维修中</span>
        </div>

        {/* Info Section */}
        <div className='bg-white mt-2 px-4 py-5 space-y-4'>
          <h2 className='text-base font-black text-slate-900 flex items-center'>
            报修信息
          </h2>
          <div className='space-y-3 text-[13px] text-slate-600'>
            <div className='flex items-start'>
              <span className='w-20 shrink-0 font-medium'>设备名称:</span>
              <span className='font-bold text-slate-800'>{viewingRequest.deviceSN} | {viewingRequest.deviceName}</span>
            </div>
            <div className='flex items-start'>
              <span className='w-20 shrink-0 font-medium'>报修时间:</span>
              <span className='font-bold text-slate-800'>{viewingRequest.requestTime}</span>
            </div>
            <div className='flex items-start'>
              <span className='w-20 shrink-0 font-medium'>报修人:</span>
              <span className='font-bold text-slate-800'>{viewingRequest.requester}</span>
            </div>
            <div className='flex items-start'>
              <span className='w-20 shrink-0 font-medium'>问题类型:</span>
              <span className='font-bold text-slate-800'>预见性维护</span>
            </div>
            <div className='flex items-start'>
              <span className='w-20 shrink-0 font-medium'>问题描述:</span>
              <span className='font-bold text-slate-800'>{viewingRequest.description || '测试保修'}</span>
            </div>
            <div className='flex items-start'>
              <span className='w-20 shrink-0 font-medium'>相关图片:</span>
              <span className='font-bold text-slate-800'></span>
            </div>
            <div className='flex items-start'>
              <span className='w-20 shrink-0 font-medium'>关联批号:</span>
              <span className='font-bold text-slate-800'></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='grid grid-cols-2 gap-4 px-4 py-6 bg-white border-t border-slate-50'>
          <button className='py-4 bg-[#00c853] text-white rounded-xl font-black text-sm shadow-sm active:scale-95 transition-all'>
            无需维修
          </button>
          <button
            onClick={() => {
              setStep('ALARM_SELECT')
            }}
            className='py-4 bg-[#2979ff] text-white rounded-xl font-black text-sm shadow-sm active:scale-95 transition-all'>
            维修
          </button>
          <button className='py-4 bg-[#ffc107] text-white rounded-xl font-black text-sm shadow-sm active:scale-95 transition-all'>
            周PM
          </button>
          <button className='py-4 bg-[#ff1744] text-white rounded-xl font-black text-sm shadow-sm active:scale-95 transition-all'>
            周PM复查
          </button>
        </div>

        {/* Recent Repair Section */}
        <div className='px-4 mt-6'>
          <div className='flex justify-between items-center mb-3'>
            <h3 className='text-[13px] font-black text-slate-800'>最近一次报修信息</h3>
            <button className='text-xs font-bold text-blue-600'>更多</button>
          </div>
          <div className='bg-[#fdf6e3] rounded-2xl p-4 shadow-sm border border-amber-100/50 relative group active:scale-[0.98] transition-all'>
            <div className='flex justify-between items-start mb-3'>
              <h3 className='font-black text-slate-800 text-sm'>
                {viewingRequest.deviceSN} | {viewingRequest.deviceName}
              </h3>
              <ChevronRight size={16} className='text-slate-400' />
            </div>
            <div className='space-y-2 text-[11px] text-slate-600 font-medium'>
              <div className='flex items-center space-x-2'>
                <span className='opacity-60'>报修时间:</span>
                <span>{viewingRequest.requestTime}</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='opacity-60'>问题类型:</span>
                <span>预见性维护</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='opacity-60'>报修人:</span>
                <span>{viewingRequest.requester}</span>
              </div>
            </div>
            <div className='mt-4 flex justify-end'>
              <span className='text-[10px] font-black text-slate-800'>
                维修状态：<span className='text-amber-600'>维修中</span>
              </span>
            </div>
          </div>
        </div>

        {/* Recent PM Section */}
        <div className='px-4 mt-6'>
          <div className='flex justify-between items-center mb-3'>
            <h3 className='text-[13px] font-black text-slate-800'>最近一次周PM信息</h3>
            <button className='text-xs font-bold text-blue-600'>更多</button>
          </div>
          <div className='bg-emerald-50/50 h-8 rounded-xl border border-dashed border-emerald-200'></div>
        </div>
      </div>
    )
  }

  const renderDashboard = () => {
    return (
      <div className='flex flex-col h-full bg-slate-50 animate-in fade-in duration-500'>
        {/* Header */}
        <div className='bg-blue-600 px-4 py-4 flex items-center justify-center relative'>
          <h1 className='text-white text-lg font-bold'>鲁文申在线</h1>
        </div>

        {/* Quick Actions */}
        <div className='bg-white grid grid-cols-4 py-6 px-2 border-b border-slate-100'>
          <div className='flex flex-col items-center space-y-2 group active:scale-95 transition-all'>
            <div className='p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors'>
              <Hammer size={24} />
            </div>
            <span className='text-xs font-bold text-slate-600'>报修</span>
          </div>
          <div className='flex flex-col items-center space-y-2 group active:scale-95 transition-all'>
            <div className='p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors'>
              <Cpu size={24} />
            </div>
            <span className='text-xs font-bold text-slate-600'>设备</span>
          </div>
          <div className='flex flex-col items-center space-y-2 group active:scale-95 transition-all'>
            <div className='p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors'>
              <Package size={24} />
            </div>
            <span className='text-xs font-bold text-slate-600'>备件</span>
          </div>
          <div className='flex flex-col items-center space-y-2 group active:scale-95 transition-all'>
            <div className='p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors'>
              <LayoutGrid size={24} />
            </div>
            <span className='text-xs font-bold text-slate-600'>模具</span>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex bg-white border-b border-slate-100'>
          <button
            onClick={() => setDashboardTab('EQUIPMENT')}
            className={`flex-1 py-3 text-xs font-bold transition-all relative ${dashboardTab === 'EQUIPMENT' ? 'text-blue-600' : 'text-slate-400'}`}>
            待处理设备任务
            {dashboardTab === 'EQUIPMENT' && (
              <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-blue-600 rounded-full' />
            )}
          </button>
          <button
            onClick={() => setDashboardTab('PM')}
            className={`flex-1 py-3 text-xs font-bold transition-all relative ${dashboardTab === 'PM' ? 'text-blue-600' : 'text-slate-400'}`}>
            待处理周PM(16)
            {dashboardTab === 'PM' && (
              <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-blue-600 rounded-full' />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {dashboardTab === 'EQUIPMENT' ? (
            <>
              {MOCK_REPAIR_REQUESTS.map((req) => (
                <div
                  key={req.id}
                  onClick={() => {
                    const device = MOCK_DEVICES.find((d) => d.id === req.deviceId)
                    if (device) {
                      setSelectedDevice(device)
                      setViewingRequest(req)
                      setStep('DEVICE_DETAIL')
                    }
                  }}
                  className='bg-[#fdf6e3] rounded-2xl p-4 shadow-sm border border-amber-100/50 relative group active:scale-[0.98] transition-all'>
                  <div className='flex justify-between items-start mb-3'>
                    <h3 className='font-black text-slate-800 text-sm'>
                      {req.deviceSN} | {req.deviceName}
                    </h3>
                    <ChevronRight
                      size={16}
                      className='text-slate-400 group-hover:translate-x-1 transition-transform'
                    />
                  </div>

                  <div className='space-y-2 text-[11px] text-slate-600 font-medium'>
                    <div className='flex items-center space-x-2'>
                      <span className='opacity-60'>报修时间:</span>
                      <span>{req.requestTime}</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='opacity-60'>问题类型:</span>
                      <span>预见性维护</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='opacity-60'>报修人:</span>
                      <span>{req.requester}</span>
                    </div>
                  </div>

                  <div className='mt-4 flex justify-end'>
                    <span className='text-[10px] font-black text-amber-600 bg-amber-100/50 px-2 py-1 rounded-lg'>
                      状态：维修中
                    </span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className='flex flex-col items-center justify-center py-20 text-slate-300'>
              <ClipboardList size={48} className='mb-4 opacity-20' />
              <p className='text-xs font-bold'>暂无周 PM 任务</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderMessages = () => (
    <div className='flex flex-col h-full bg-slate-50 animate-in fade-in duration-500'>
      <div className='bg-blue-600 px-4 py-4 flex items-center justify-center relative'>
        <h1 className='text-white text-lg font-bold'>消息中心</h1>
      </div>
      <div className='flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4'>
        <Bell size={48} className='opacity-20' />
        <p className='text-xs font-bold'>暂无新消息</p>
      </div>
    </div>
  )

  const renderProfile = () => (
    <div className='space-y-6 flex flex-col h-full animate-in fade-in duration-500 pb-20'>
      <div className='bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center'>
        <div className='relative mb-4'>
          <img
            src={MOCK_USER.avatar}
            className='w-24 h-24 rounded-full border-4 border-white shadow-xl'
            alt='avatar'
          />
          <div className='absolute bottom-1 right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white'></div>
        </div>
        <h2 className='text-xl font-black text-slate-900'>{MOCK_USER.name}</h2>
        <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1'>
          {MOCK_USER.role} · {MOCK_USER.employeeId}
        </p>
        <div className='mt-4 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest'>
          {MOCK_USER.department}
        </div>

        <button
          onClick={() => {
            setIsAppAuthenticated(false)
            setStep('APP_LOGIN')
            setActiveTab('HOME')
          }}
          className='mt-6 flex items-center space-x-2 px-6 py-2 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors'>
          <LogOut size={14} />
          <span>退出登陆</span>
        </button>
      </div>
    </div>
  )

  const renderNavBar = () => (
    <div className='absolute bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-[150] px-6 flex items-center justify-around rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]'>
      <button
        onClick={() => {
          setActiveTab('HOME')
          setStep('DASHBOARD')
        }}
        className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'HOME' ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
        <div
          className={`p-2 rounded-xl transition-all ${activeTab === 'HOME' ? 'bg-blue-50' : 'bg-transparent'}`}>
          <LayoutGrid size={22} />
        </div>
        <span className='text-[10px] font-black uppercase tracking-widest'>
          首页
        </span>
      </button>

      <button
        onClick={() => setActiveTab('MESSAGE')}
        className={`flex flex-col items-center space-y-1 transition-all relative ${activeTab === 'MESSAGE' ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
        <div
          className={`p-2 rounded-xl transition-all ${activeTab === 'MESSAGE' ? 'bg-blue-50' : 'bg-transparent'}`}>
          <Bell size={22} />
        </div>
        <span className='text-[10px] font-black uppercase tracking-widest'>
          消息
        </span>
        <div className='absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm'>
          4
        </div>
      </button>

      <button
        onClick={() => setActiveTab('PROFILE')}
        className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'PROFILE' ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
        <div
          className={`p-2 rounded-xl transition-all ${activeTab === 'PROFILE' ? 'bg-blue-50' : 'bg-transparent'}`}>
          <UserIcon size={22} />
        </div>
        <span className='text-[10px] font-black uppercase tracking-widest'>
          我的
        </span>
      </button>
    </div>
  )

  return (
    <div className='flex justify-center items-center py-4 min-h-[calc(100vh-140px)]'>
      <div className='relative border-slate-900 bg-slate-900 border-[10px] rounded-[4rem] h-[740px] w-[350px] shadow-2xl overflow-hidden hidden md:block'>
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-[1.5rem] z-[120] flex items-center justify-center space-x-2'>
          <div className='w-1.5 h-1.5 bg-slate-800 rounded-full'></div>
          <div className='w-10 h-1 bg-slate-800 rounded-full'></div>
        </div>
        <div className='w-full h-full bg-slate-50 overflow-y-auto scrollbar-hide rounded-[3.2rem] pt-8 relative flex flex-col'>
          <div className='px-4 flex-1 flex flex-col overflow-hidden relative'>
            {step === 'APP_LOGIN'
              ? renderContent()
              : activeTab === 'HOME'
                ? renderContent()
                : activeTab === 'MESSAGE'
                  ? renderMessages()
                  : renderProfile()}
          </div>
          {step !== 'APP_LOGIN' && renderNavBar()}
        </div>
      </div>
      <div className='md:hidden w-full px-4 h-[740px] bg-slate-50 overflow-y-auto rounded-3xl shadow-lg border border-slate-200 relative flex flex-col'>
        <div className='pt-8 flex-1 flex flex-col overflow-hidden'>
          {step === 'APP_LOGIN'
            ? renderContent()
            : activeTab === 'HOME'
              ? renderContent()
              : activeTab === 'MESSAGE'
                ? renderMessages()
                : renderProfile()}
        </div>
        {step !== 'APP_LOGIN' && renderNavBar()}
      </div>

      {previewPdfUrl && (
        <PDFPreviewModal
          url={previewPdfUrl}
          onClose={() => setPreviewPdfUrl(null)}
        />
      )}
    </div>
  )
}

const PDFPreviewModal: React.FC<{ url: string; onClose: () => void }> = ({
  url,
  onClose
}) => (
  <div className='fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex flex-col animate-in fade-in duration-300'>
    <div className='p-4 flex items-center justify-between text-white border-b border-white/10'>
      <div className='flex items-center space-x-3'>
        <div className='p-2 bg-rose-500 rounded-xl'>
          <FileText size={20} />
        </div>
        <div>
          <h3 className='text-sm font-black'>技术文档预览</h3>
          <p className='text-[10px] opacity-60'>Technical_Manual.pdf</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className='p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all'>
        <X size={24} />
      </button>
    </div>
    <div className='flex-1 bg-slate-800 flex items-center justify-center p-4'>
      {/* 模拟 PDF 渲染 */}
      <div className='w-full max-w-lg aspect-[1/1.414] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden relative group'>
        <div className='absolute inset-0 bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10'>
          <div className='text-center p-10'>
            <ExternalLink size={48} className='mx-auto text-slate-300 mb-4' />
            <p className='text-xs font-black text-slate-400 uppercase tracking-widest'>
              正在尝试在外部浏览器打开...
            </p>
            <a
              href={url}
              target='_blank'
              rel='noreferrer'
              className='mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase'>
              手动跳转
            </a>
          </div>
        </div>
        <div className='p-10 space-y-6'>
          <div className='h-4 bg-slate-100 rounded-full w-3/4'></div>
          <div className='h-4 bg-slate-100 rounded-full w-1/2'></div>
          <div className='space-y-3 pt-10'>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className='h-2 bg-slate-50 rounded-full'
                style={{ width: `${Math.random() * 40 + 60}%` }}></div>
            ))}
          </div>
          <div className='aspect-video bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center'>
            <ImageIcon size={48} className='text-slate-100' />
          </div>
        </div>
      </div>
    </div>
    <div className='p-6 bg-slate-900 border-t border-white/10 text-center'>
      <p className='text-[10px] text-white/40 font-bold mb-4 uppercase tracking-widest'>
        该文档已由加密通道传输，严禁外传
      </p>
      <button
        onClick={onClose}
        className='w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all'>
        退出预览
      </button>
    </div>
  </div>
)

export default EngineerApp
