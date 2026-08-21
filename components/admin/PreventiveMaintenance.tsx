import React, { useMemo, useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
import {
  ShieldAlert,
  Database,
  ClipboardList,
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  Search,
  Download,
  UserCog,
  Wrench,
  Bell,
  AlertOctagon,
  RefreshCcw,
  Save,
  X,
  Check,
  Clock,
  TrendingUp,
  Package,
  Boxes,
  Calendar,
  Lock,
  ChevronRight,
  CircleCheck,
  TriangleAlert,
  Volume2,
  Sparkles,
  Target,
  ArrowLeft
} from 'lucide-react'
import {
  SparePart,
  MachineTypeInfo,
  ReplacementRecord,
  ThresholdAdjustLog,
  PartAlertStatus
} from '../../types'
import {
  MOCK_MACHINE_TYPES,
  MOCK_PARTS,
  MOCK_RECORDS,
  MOCK_LOGS,
  todayStr,
  nowStr,
  dayDiff,
  dayDiffToToday,
  computeAlertStatuses
} from './pmShared'
import { isAutoSpeakEnabled, subscribeAutoSpeak } from './autoSpeak'

// ================= 主组件 =================

interface PreventiveMaintenanceProps {
  isAdmin?: boolean // 仅管理员可删除更换记录
}

const PreventiveMaintenance: React.FC<PreventiveMaintenanceProps> = ({
  isAdmin = false
}) => {
  const [activeTab, setActiveTab] = useState('预警看板')
  // 分级权限：管理员(可删除) / 设备工程师(可全部操作) / 技术员(仅录入与查询)
  const [role, setRole] = useState<'ADMIN' | 'ENGINEER' | 'TECHNICIAN'>(
    'ENGINEER'
  )
  const isEngineer = role !== 'TECHNICIAN'
  // 管理员身份：外部登录用户为管理员，或页面内切换为管理员
  const effectiveIsAdmin = isAdmin || role === 'ADMIN'

  // 基础数据
  const [machineTypes, setMachineTypes] = useState<MachineTypeInfo[]>(MOCK_MACHINE_TYPES)
  const [parts, setParts] = useState<SparePart[]>(MOCK_PARTS)
  // 更换记录
  const [records, setRecords] = useState<ReplacementRecord[]>(MOCK_RECORDS)
  // 修正日志
  const [adjustLogs, setAdjustLogs] = useState<ThresholdAdjustLog[]>(MOCK_LOGS)

  // 弹窗/表单状态
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [showAddMachine, setShowAddMachine] = useState(false)
  const [newMachineName, setNewMachineName] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  // 更换记录筛选
  const [filterDevice, setFilterDevice] = useState('')
  const [filterPart, setFilterPart] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [filterReason, setFilterReason] = useState('all')

  // 新增更换记录表单
  const [formDeviceNo, setFormDeviceNo] = useState('')
  const [formMachineType, setFormMachineType] = useState('Y-series')
  const [formPartName, setFormPartName] = useState('')
  const [formModel, setFormModel] = useState('')
  const [formPosition, setFormPosition] = useState('')
  const [formDate, setFormDate] = useState(todayStr())
  const [formReason, setFormReason] = useState<'periodic' | 'failure'>('periodic')
  const [formFailureReason, setFormFailureReason] = useState('')
  const [formOperator, setFormOperator] = useState('张伟')

  // 安全系数修正草稿
  const [factorDrafts, setFactorDrafts] = useState<Record<string, string>>({})

  // 初始寿命修正草稿
  const [lifecycleDrafts, setLifecycleDrafts] = useState<Record<string, string>>({})

  // 更换规律预测二级页
  const [showPrediction, setShowPrediction] = useState(false)

  // 红牌持续弹窗
  const [redPopupDismissed, setRedPopupDismissed] = useState(false)

  // ============ 生命周期与预警测算 ============

  const alertStatuses = useMemo<PartAlertStatus[]>(() => computeAlertStatuses(records, parts), [records, parts])

  const redAlerts = alertStatuses.filter((a) => a.level === 'red')
  const yellowAlerts = alertStatuses.filter((a) => a.level === 'yellow')

  // ============ 语音播报：红牌过期自动提醒 ============
  const redAlertsRef = useRef<PartAlertStatus[]>([])
  redAlertsRef.current = redAlerts

  const speakRedAlerts = () => {
    const list = redAlertsRef.current
    if (list.length === 0) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setToast('当前浏览器不支持语音播报')
      return
    }
    const texts = list.map((a) => `设备${a.deviceNo}的${a.partName}，已超期${Math.abs(a.remainDays)}天`)
    const speech = `警告！检测到${list.length}个备件已过期。${texts.join('。')}。请立即安排更换！`
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(speech)
    utter.lang = 'zh-CN'
    utter.rate = 0.9
    utter.pitch = 1
    window.speechSynthesis.speak(utter)
    setToast('已语音播报过期备件提醒')
  }

  // 检测到红牌时自动播报（需在后台开启「语音自动播报」开关；红牌数量变化时触发，避免重复播报）
  const lastAnnouncedCountRef = useRef<number | null>(null)
  useEffect(() => {
    if (!isAutoSpeakEnabled() || redAlerts.length === 0) {
      lastAnnouncedCountRef.current = null
      return
    }
    if (lastAnnouncedCountRef.current !== redAlerts.length) {
      lastAnnouncedCountRef.current = redAlerts.length
      speakRedAlerts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redAlerts.length])

  // 监听后台开关变化：开启时若存在红牌立即播报，关闭时取消正在播放的语音
  useEffect(() => {
    return subscribeAutoSpeak(() => {
      if (isAutoSpeakEnabled()) {
        lastAnnouncedCountRef.current = null
        if (redAlertsRef.current.length > 0) speakRedAlerts()
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 红牌持续弹窗：存在红牌且未被忽略时展示；红牌数量变化时重新触发
  useEffect(() => {
    if (redAlerts.length > 0) setRedPopupDismissed(false)
  }, [redAlerts.length])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  // ============ 更换记录操作 ============

  const genOrderNo = () => {
    const d = new Date()
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    const count = records.filter((r) => r.orderNo.startsWith(`PMR-${ymd}`)).length
    return `PMR-${ymd}-${String(count + 1).padStart(3, '0')}`
  }

  const availableParts = useMemo(
    () => parts.filter((p) => p.machineType === formMachineType),
    [parts, formMachineType]
  )
  const partNames = Array.from(new Set(availableParts.map((p) => p.name)))
  const modelsForName = availableParts.filter((p) => p.name === formPartName).map((p) => p.model)
  const positionsForPart = availableParts.filter((p) => p.name === formPartName && p.model === formModel).map((p) => p.installPosition)

  const handleSubmitRecord = () => {
    if (!formDeviceNo.trim() || !formPartName || !formModel || !formPosition || !formDate) {
      setToast('请完整填写必填项（设备编号、备件名称、型号、安装位置、更换日期）')
      return
    }
    const part = availableParts.find((p) => p.name === formPartName && p.model === formModel && p.installPosition === formPosition)
    const record: ReplacementRecord = {
      id: `r-${Date.now()}`,
      orderNo: genOrderNo(),
      deviceNo: formDeviceNo.trim(),
      partId: part?.id || '',
      partCode: part?.code || '-',
      partName: formPartName,
      model: formModel,
      installPosition: formPosition,
      replaceDate: formDate,
      reason: formReason,
      failureReason: formReason === 'failure' ? formFailureReason.trim() || undefined : undefined,
      operator: formOperator,
      createdAt: nowStr()
    }
    setRecords((prev) => [record, ...prev])
    setShowAddRecord(false)
    setToast(`更换记录已提交，单号：${record.orderNo}（已触发周期自动重算）`)
    setFormDeviceNo('')
    setFormPartName('')
    setFormModel('')
    setFormPosition('')
    setFormReason('periodic')
    setFormFailureReason('')
  }

  // 删除更换记录（仅管理员可操作）
  const handleDeleteRecord = (id: string) => {
    if (!effectiveIsAdmin) {
      setToast('仅管理员可删除更换记录')
      return
    }
    const target = records.find((r) => r.id === id)
    if (!window.confirm(`确认删除更换记录「${target?.orderNo || id}」？删除后该备件的生命周期将自动重算。`)) return
    setRecords((prev) => prev.filter((r) => r.id !== id))
    setToast('更换记录已删除（已触发周期自动重算）')
  }

  // 预填更换表单并打开录入弹窗（红牌弹窗与预警卡片共用）
  const prefillAndOpenRecord = (a: PartAlertStatus) => {
    setFormDeviceNo(a.deviceNo)
    setFormMachineType(parts.find((p) => p.id === a.partId)?.machineType || 'Y-series')
    setFormPartName(a.partName)
    setFormModel(a.model)
    setFormPosition(a.installPosition)
    setShowAddRecord(true)
  }

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filterDevice && !r.deviceNo.toLowerCase().includes(filterDevice.toLowerCase())) return false
      if (filterPart && !r.partName.toLowerCase().includes(filterPart.toLowerCase())) return false
      if (filterFrom && r.replaceDate < filterFrom) return false
      if (filterTo && r.replaceDate > filterTo) return false
      if (filterReason !== 'all' && r.reason !== filterReason) return false
      return true
    })
  }, [records, filterDevice, filterPart, filterFrom, filterTo, filterReason])

  // 每条记录的实际使用时长
  const recordUsage = (r: ReplacementRecord): number => {
    const sameKey = records
      .filter((x) => x.deviceNo === r.deviceNo && x.model === r.model && x.installPosition === r.installPosition)
      .sort((a, b) => a.replaceDate.localeCompare(b.replaceDate))
    const idx = sameKey.findIndex((x) => x.id === r.id)
    if (idx === -1) return 0
    const cur = sameKey[idx]
    const next = sameKey[idx + 1]
    return next ? dayDiff(cur.replaceDate, next.replaceDate) : dayDiffToToday(cur.replaceDate)
  }

  const handleExportExcel = () => {
    const rows = filteredRecords.map((r) => ({
      更换单号: r.orderNo,
      设备编号: r.deviceNo,
      备件编码: r.partCode,
      备件名称: r.partName,
      型号: r.model,
      安装位置: r.installPosition,
      更换日期: r.replaceDate,
      更换原因: r.reason === 'periodic' ? '正常周期更换' : '突发故障损坏',
      实际使用时长_天: recordUsage(r),
      失效原因: r.failureReason || '-',
      操作人: r.operator
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '备件更换台账')
    XLSX.writeFile(wb, `备件更换台账_${todayStr()}.xlsx`)
    setToast(`已导出 ${rows.length} 条台账记录到 Excel`)
  }

  // ============ 更换规律预测分析 ============

  const addDays = (dateStr: string, days: number): string => {
    const d = new Date(dateStr + 'T00:00:00')
    d.setDate(d.getDate() + days)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  // 预测结果项
  const predictionResults = useMemo(() => {
    // 1. 按「设备编号 + 型号 + 安装位置」三要素分组
    const map = new Map<string, ReplacementRecord[]>()
    records.forEach((r) => {
      const key = `${r.deviceNo}|${r.model}|${r.installPosition}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(r)
    })

    // 2. 计算每个组的历史更换间隔与规律明确度
    const groupInfos = Array.from(map.entries()).map(([key, recs]) => {
      const sorted = [...recs].sort((a, b) => a.replaceDate.localeCompare(b.replaceDate))
      const gaps: number[] = []
      for (let i = 1; i < sorted.length; i++) {
        gaps.push(dayDiff(sorted[i - 1].replaceDate, sorted[i].replaceDate))
      }
      const failureCount = sorted.filter((r) => r.reason === 'failure').length
      const mean = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0
      const variance = gaps.length ? gaps.reduce((a, g) => a + (g - mean) ** 2, 0) / gaps.length : 0
      const cv = mean > 0 ? Math.sqrt(variance) / mean : 0
      return { key, recs: sorted, gaps, mean, cv, failureCount, last: sorted[sorted.length - 1] }
    })

    // 3. 规律明确的组（≥2 次间隔、无突发故障、间隔稳定）作为「参考规律来源」
    const clearGroups = groupInfos.filter((g) => g.gaps.length >= 2 && g.failureCount === 0 && g.cv <= 0.5)
    const refByModel = new Map<string, number[]>()
    const refAll: number[] = []
    clearGroups.forEach((g) => {
      g.gaps.forEach((gap) => {
        refAll.push(gap)
        const model = g.last.model
        if (!refByModel.has(model)) refByModel.set(model, [])
        refByModel.get(model)!.push(gap)
      })
    })

    // 4. 筛选「非明确性」备件并给出预测建议
    const results: Array<{
      key: string
      deviceNo: string
      partName: string
      model: string
      installPosition: string
      recordCount: number
      failureCount: number
      lastReplaceDate: string
      usedDays: number
      ownGaps: number[]
      cv: number
      reasons: string[]
      refAvgDays: number
      predictedDays: number
      predictedDate: string
    }> = []
    groupInfos.forEach((g) => {
      const reasons: string[] = []
      if (g.gaps.length < 2) {
        reasons.push(g.gaps.length === 0 ? '仅 1 次更换记录，无法独立判断周期' : '更换次数过少，自身规律不明确')
      }
      if (g.failureCount > 0) reasons.push(`含 ${g.failureCount} 次突发故障更换，间隔不稳定`)
      if (g.gaps.length >= 2 && g.cv > 0.5) reasons.push(`更换间隔波动大（变异系数 ${(g.cv * 100).toFixed(0)}%）`)
      if (reasons.length === 0) return

      // 参考其他备件的更换规律：优先同型号，其次全部明确组
      const refGaps = (refByModel.get(g.last.model) || []).length ? refByModel.get(g.last.model)! : refAll
      const refAvg = refGaps.length ? Math.round(refGaps.reduce((a, b) => a + b, 0) / refGaps.length) : 0
      const ownMean = g.mean > 0 ? Math.round(g.mean) : 0
      const predictedDays = refAvg > 0 ? Math.round(refAvg * 0.9) : ownMean || 90
      results.push({
        key: g.key,
        deviceNo: g.last.deviceNo,
        partName: g.last.partName,
        model: g.last.model,
        installPosition: g.last.installPosition,
        recordCount: g.recs.length,
        failureCount: g.failureCount,
        lastReplaceDate: g.last.replaceDate,
        usedDays: dayDiffToToday(g.last.replaceDate),
        ownGaps: g.gaps,
        cv: g.cv,
        reasons,
        refAvgDays: refAvg,
        predictedDays,
        predictedDate: addDays(g.last.replaceDate, predictedDays)
      })
    })
    // 只保留更换次数充足、可统计出规律信息的备件；更换次数过少（无法统计）的直接剔除
    return results
      .filter((r) => r.recordCount >= 2)
      .sort((a, b) => a.predictedDays - b.predictedDays)
  }, [records])

  // ============ 安全系数修正 ============

  const handleSaveFactor = (alert: PartAlertStatus) => {
    const draft = parseFloat(factorDrafts[alert.partId] ?? '')
    if (isNaN(draft) || draft <= 0 || draft > 1.5) {
      setToast('安全系数需在 0~1.5 之间')
      return
    }
    const oldFactor = parts.find((p) => p.id === alert.partId)?.safetyFactor ?? 0.9
    if (oldFactor === draft) {
      setToast('数值未发生变化')
      return
    }
    setParts((prev) => prev.map((p) => (p.id === alert.partId ? { ...p, safetyFactor: draft } : p)))
    setAdjustLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        partId: alert.partId,
        partName: alert.partName,
        field: '安全系数',
        beforeValue: oldFactor,
        afterValue: draft,
        operator: formOperator,
        operateTime: nowStr()
      },
      ...prev
    ])
    setFactorDrafts((prev) => ({ ...prev, [alert.partId]: '' }))
    setToast(`安全系数已由 ${oldFactor} 调整为 ${draft}，预警阈值已联动更新`)
  }

  // ============ 初始寿命修正 ============

  const handleSaveLifecycle = (alert: PartAlertStatus) => {
    const draft = parseInt(lifecycleDrafts[alert.partId] ?? '', 10)
    if (isNaN(draft) || draft <= 0) {
      setToast('初始寿命需为正整数')
      return
    }
    const oldLifecycle = parts.find((p) => p.id === alert.partId)?.standardLifecycleDays
    if (oldLifecycle === draft) {
      setToast('数值未发生变化')
      return
    }
    setParts((prev) => prev.map((p) => (p.id === alert.partId ? { ...p, standardLifecycleDays: draft } : p)))
    setAdjustLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        partId: alert.partId,
        partName: alert.partName,
        field: '初始寿命',
        beforeValue: oldLifecycle ?? 0,
        afterValue: draft,
        operator: formOperator,
        operateTime: nowStr()
      },
      ...prev
    ])
    setLifecycleDrafts((prev) => ({ ...prev, [alert.partId]: '' }))
    setToast(`初始寿命已由 ${oldLifecycle} 天调整为 ${draft} 天`)
  }

  // ============ 基础数据操作 ============

  const handleAddMachine = () => {
    if (!newMachineName.trim()) {
      setToast('请输入机型名称')
      return
    }
    setMachineTypes((prev) => [...prev, { id: `mt-${Date.now()}`, name: newMachineName.trim(), createdAt: todayStr() }])
    setShowAddMachine(false)
    setNewMachineName('')
    setToast(`已新增机型分类：${newMachineName.trim()}`)
  }

  const handleDeletePart = (id: string) => {
    if (confirm('确定删除该备件？已关联的历史更换记录将保留。')) {
      setParts((prev) => prev.filter((p) => p.id !== id))
      setToast('备件已删除')
    }
  }

  // ============ 渲染：预警看板 ============

  const renderDashboard = () => {
    const levelStyle = (level: string) => {
      if (level === 'red') return 'border-rose-200 bg-rose-50/80 shadow-rose-100'
      if (level === 'yellow') return 'border-amber-200 bg-amber-50/80 shadow-amber-100'
      return 'border-emerald-200 bg-emerald-50/60 shadow-emerald-100'
    }
    const levelBadge = (level: string) => {
      if (level === 'red')
        return <span className='inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-600 text-white'>红牌 · 已到期</span>
      if (level === 'yellow')
        return <span className='inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500 text-white'>黄牌 · 即将到期</span>
      return <span className='inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500 text-white'>正常</span>
    }
    return (
      <div className='space-y-6 animate-in fade-in duration-500'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
          <div className='bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center space-x-4'>
            <div className='p-3 bg-emerald-100 text-emerald-600 rounded-2xl'><CircleCheck size={22} /></div>
            <div>
              <p className='text-2xl font-black text-slate-900'>{alertStatuses.filter((a) => a.level === 'normal').length}</p>
              <p className='text-xs font-bold text-slate-400'>正常设备/备件</p>
            </div>
          </div>
          <div className='bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center space-x-4'>
            <div className='p-3 bg-amber-100 text-amber-600 rounded-2xl'><TriangleAlert size={22} /></div>
            <div>
              <p className='text-2xl font-black text-amber-500'>{yellowAlerts.length}</p>
              <p className='text-xs font-bold text-slate-400'>黄牌预警（5天内）</p>
            </div>
          </div>
          <div className='bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center space-x-4'>
            <div className='p-3 bg-rose-100 text-rose-600 rounded-2xl'><AlertOctagon size={22} /></div>
            <div className='flex-1'>
              <p className='text-2xl font-black text-rose-600'>{redAlerts.length}</p>
              <p className='text-xs font-bold text-slate-400'>红牌强制拦截</p>
            </div>
            {redAlerts.length > 0 && (
              <button
                onClick={speakRedAlerts}
                title='语音播报过期备件'
                className='flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-200'>
                <Volume2 size={15} />
                <span className='text-[10px] font-black'>语音播报</span>
              </button>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {alertStatuses.map((a) => (
            <div
              key={a.key}
              className={`p-6 rounded-[2rem] border shadow-sm transition-all ${levelStyle(a.level)} ${a.level === 'red' ? 'animate-pulse' : ''}`}>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <div className='flex items-center space-x-2 mb-1'>
                    <Package size={14} className={a.level === 'red' ? 'text-rose-500' : a.level === 'yellow' ? 'text-amber-500' : 'text-emerald-500'} />
                    <span className='text-xs font-black text-slate-500'>{a.deviceNo}</span>
                    <ChevronRight size={12} className='text-slate-300' />
                    <span className='text-sm font-black text-slate-800'>{a.partName}</span>
                  </div>
                  <p className='text-[10px] font-bold text-slate-400'>{a.model} / {a.installPosition}</p>
                </div>
                {levelBadge(a.level)}
              </div>

              <div className='mt-4 grid grid-cols-3 gap-3'>
                <div className='bg-white/80 rounded-xl p-3 border border-slate-100'>
                  <p className='text-[9px] font-black text-slate-400 uppercase'>已使用</p>
                  <p className='text-lg font-black text-slate-800'>{a.usedDays}<span className='text-[10px] text-slate-400'> 天</span></p>
                </div>
                <div className='bg-white/80 rounded-xl p-3 border border-slate-100'>
                  <p className='text-[9px] font-black text-slate-400 uppercase'>预警阈值</p>
                  <p className='text-lg font-black text-slate-800'>{a.thresholdDays}<span className='text-[10px] text-slate-400'> 天</span></p>
                </div>
                <div className={`rounded-xl p-3 border ${a.level === 'red' ? 'bg-rose-600 text-white border-rose-600' : a.level === 'yellow' ? 'bg-amber-500 text-white border-amber-500' : 'bg-emerald-500 text-white border-emerald-500'}`}>
                  <p className='text-[9px] font-black text-white/70 uppercase'>剩余</p>
                  <p className='text-lg font-black'>{a.remainDays <= 0 ? '已超期' : `${a.remainDays} 天`}</p>
                </div>
              </div>

              <div className='mt-3 flex items-center justify-between text-[10px] font-bold text-slate-400'>
                <span>最近更换：{a.lastReplaceDate}</span>
                <span>平均寿命：{a.avgLifecycleDays} 天 · 历史 {a.recordsCount} 次</span>
              </div>

              {a.level !== 'normal' && (
                <button
                  onClick={() => prefillAndOpenRecord(a)}
                  className={`mt-4 w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 text-white transition-all active:scale-95 ${
                    a.level === 'red'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200'
                      : 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200'
                  }`}>
                  <RefreshCcw size={14} />
                  <span>{a.level === 'red' ? '立即更换（解除红牌）' : '立即更换'}</span>
                </button>
              )}
            </div>
          ))}
          {alertStatuses.length === 0 && (
            <div className='col-span-full py-16 text-center text-slate-400 text-sm'>暂无备件更换记录，请先录入更换记录</div>
          )}
        </div>
      </div>
    )
  }

  // ============ 渲染：基础数据管理 ============

  const renderBaseData = () => {
    const filteredParts = machineFilter === 'all' ? parts : parts.filter((p) => p.machineType === machineFilter)

    const submitPart = () => {
      if (!partModal) return
      const { machineType, code, name, model, installPosition, standardLifecycleDays, safetyFactor } = partModal
      if (!code.trim() || !name.trim() || !model.trim() || !installPosition.trim()) {
        setToast('请完整填写备件编码、名称、型号、安装位置')
        return
      }
      if (partModal.id) {
        setParts((prev) =>
          prev.map((p) => (p.id === partModal.id ? { ...p, machineType, code, name, model, installPosition, standardLifecycleDays, safetyFactor } : p))
        )
        setToast('备件信息已更新')
      } else {
        setParts((prev) => [
          { id: `sp-${Date.now()}`, machineType, code, name, model, installPosition, standardLifecycleDays, safetyFactor },
          ...prev
        ])
        setToast('备件已加入备件库')
      }
      setPartModal(null)
    }

    return (
      <div className='space-y-6 animate-in fade-in duration-500'>
        <div className='bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-sm font-black text-slate-800 flex items-center'>
              <Boxes size={16} className='mr-2 text-blue-600' /> 机型分类
            </h3>
          </div>
          <div className='flex flex-wrap gap-3'>
            <button
              onClick={() => setMachineFilter('all')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${machineFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              全部机型
            </button>
            {machineTypes.map((mt) => (
              <button
                key={mt.id}
                onClick={() => setMachineFilter(mt.name)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${machineFilter === mt.name ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {mt.name}
              </button>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden'>
          <div className='px-6 py-5 flex items-center justify-between border-b border-slate-100'>
            <h3 className='text-sm font-black text-slate-800 flex items-center'>
              <Database size={16} className='mr-2 text-blue-600' /> 备件库字典（{filteredParts.length}）
            </h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead className='bg-slate-50/50'>
                <tr>
                  <th className='px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>机型</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>备件编码</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>备件名称</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>型号</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>安装位置</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>标准周期</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>安全系数</th>
                  {isEngineer && <th className='px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right'>操作</th>}
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {filteredParts.map((p) => (
                  <tr key={p.id} className='hover:bg-slate-50/50 transition-colors'>
                    <td className='px-6 py-4'>
                      <span className='px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black'>{p.machineType}</span>
                    </td>
                    <td className='px-4 py-4 text-xs font-bold text-slate-600'>{p.code}</td>
                    <td className='px-4 py-4 text-xs font-black text-slate-800'>{p.name}</td>
                    <td className='px-4 py-4 text-xs font-bold text-slate-600'>{p.model}</td>
                    <td className='px-4 py-4 text-xs font-bold text-slate-600'>{p.installPosition}</td>
                    <td className='px-4 py-4 text-xs font-bold text-slate-600'>{p.standardLifecycleDays} 天</td>
                    <td className='px-4 py-4 text-xs font-black text-amber-600'>{p.safetyFactor}</td>
                    {isEngineer && (
                      <td className='px-6 py-4 text-right'>
                        <div className='flex items-center justify-end space-x-2'>
                          <button
                            onClick={() =>
                              setPartModal({
                                id: p.id,
                                machineType: p.machineType,
                                code: p.code,
                                name: p.name,
                                model: p.model,
                                installPosition: p.installPosition,
                                standardLifecycleDays: p.standardLifecycleDays,
                                safetyFactor: p.safetyFactor
                              })
                            }
                            className='p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:text-blue-600 hover:border-blue-600 transition-all active:scale-90'>
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePart(p.id)}
                            className='p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:text-rose-600 hover:border-rose-600 transition-all active:scale-90'>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredParts.length === 0 && (
                  <tr><td colSpan={8} className='px-6 py-12 text-center text-slate-400 text-sm'>该机型下暂无备件</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!isEngineer && (
          <div className='bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-4 flex items-center text-xs font-bold text-slate-400'>
            <Lock size={14} className='mr-2' /> 当前角色为「技术员」，基础数据仅可查看，维护操作由设备工程师完成
          </div>
        )}

        {/* 备件编辑弹窗 */}
        {partModal && (
          <div className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[80]' onClick={() => setPartModal(null)}>
            <div className='bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200' onClick={(e) => e.stopPropagation()}>
              <div className='px-8 py-6 border-b border-slate-100 flex items-center justify-between'>
                <h3 className='text-lg font-black text-slate-900'>{partModal.id ? '编辑备件' : '新增备件'}</h3>
                <button onClick={() => setPartModal(null)} className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all'>
                  <X size={16} />
                </button>
              </div>
              <div className='px-8 py-6 space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>所属机型（下拉）</label>
                    <select
                      value={partModal.machineType}
                      onChange={(e) => setPartModal({ ...partModal, machineType: e.target.value })}
                      className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'>
                      {machineTypes.map((mt) => (
                        <option key={mt.id} value={mt.name}>{mt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className='space-y-1.5'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>备件编码</label>
                    <input
                      value={partModal.code}
                      onChange={(e) => setPartModal({ ...partModal, code: e.target.value })}
                      placeholder='如 SP-YS-001'
                      className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>备件名称</label>
                    <input
                      value={partModal.name}
                      onChange={(e) => setPartModal({ ...partModal, name: e.target.value })}
                      placeholder='如 光罩传送机械臂'
                      className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>型号</label>
                    <input
                      value={partModal.model}
                      onChange={(e) => setPartModal({ ...partModal, model: e.target.value })}
                      placeholder='如 Y-ARM-01'
                      className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>安装位置</label>
                    <input
                      value={partModal.installPosition}
                      onChange={(e) => setPartModal({ ...partModal, installPosition: e.target.value })}
                      placeholder='如 A1 轴'
                      className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>标准更换周期（天）</label>
                    <input
                      type='number'
                      value={partModal.standardLifecycleDays}
                      onChange={(e) => setPartModal({ ...partModal, standardLifecycleDays: Number(e.target.value) })}
                      className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                    />
                  </div>
                </div>
                <div className='space-y-1.5'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>安全系数（0~1.5，预警阈值 = 平均寿命 × 安全系数）</label>
                  <input
                    type='number'
                    step='0.05'
                    value={partModal.safetyFactor}
                    onChange={(e) => setPartModal({ ...partModal, safetyFactor: Number(e.target.value) })}
                    className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                  />
                </div>
              </div>
              <div className='px-8 py-5 border-t border-slate-100 flex items-center justify-end bg-slate-50/50'>
                <button onClick={() => setPartModal(null)} className='px-8 py-3 text-slate-500 font-black text-sm hover:text-slate-800 transition-colors mr-4'>取消</button>
                <button onClick={submitPart} className='flex items-center px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-95'>
                  <Save size={16} className='mr-2' /> 保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============ 基础数据内部状态（提升到顶层，保证 hooks 顺序稳定） ============

  const [machineFilter, setMachineFilter] = useState('all')
  const [partModal, setPartModal] = useState<{
    id?: string
    machineType: string
    code: string
    name: string
    model: string
    installPosition: string
    standardLifecycleDays: number
    safetyFactor: number
  } | null>(null)

  // ============ 渲染：更换记录 ============

  const renderRecords = () => {
    return (
      <div className='space-y-6 animate-in fade-in duration-500'>
        {/* 筛选栏 */}
        <div className='bg-white px-6 py-5 rounded-[2rem] border border-slate-200 shadow-sm'>
          <div className='flex flex-wrap items-center gap-4'>
            <div className='flex-1 min-w-[160px] relative'>
              <Search size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-300' />
              <input
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                placeholder='设备编号'
                className='w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
              />
            </div>
            <div className='flex-1 min-w-[160px]'>
              <select
                value={filterPart}
                onChange={(e) => setFilterPart(e.target.value)}
                className='w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'>
                <option value=''>全部备件</option>
                {Array.from(new Set(parts.map((p) => p.name))).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className='flex items-center space-x-2'>
              <Calendar size={14} className='text-slate-300' />
              <input
                type='date'
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className='p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
              />
              <span className='text-slate-400 text-xs font-bold'>至</span>
              <input
                type='date'
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className='p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
              />
            </div>
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className='p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'>
              <option value='all'>全部更换原因</option>
              <option value='periodic'>正常周期更换</option>
              <option value='failure'>突发故障损坏</option>
            </select>
            <button
              onClick={() => {
                setFilterDevice('')
                setFilterPart('')
                setFilterFrom('')
                setFilterTo('')
                setFilterReason('all')
              }}
              className='px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition-all active:scale-95'>
              <RefreshCcw size={14} className='inline mr-1' />重置
            </button>
          </div>
        </div>

        {/* 台账表 */}
        <div className='bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden'>
          <div className='px-6 py-5 flex items-center justify-between border-b border-slate-100'>
            <div>
              <h3 className='text-sm font-black text-slate-800 flex items-center'>
                <ClipboardList size={16} className='mr-2 text-blue-600' /> 备件更换台账（{filteredRecords.length}）
              </h3>
              <p className='text-[10px] font-bold text-slate-400 mt-1'>
                生命周期以「设备编号 + 型号 + 安装位置」三要素独立归类
              </p>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() => setShowPrediction(true)}
                className='flex items-center space-x-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-black hover:bg-violet-700 transition-all active:scale-95'>
                <Sparkles size={14} /> 规律预测
              </button>
              <button
                onClick={handleExportExcel}
                className='flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all active:scale-95'>
                <Download size={14} /> 导出 Excel
              </button>
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead className='bg-slate-50/50'>
                <tr>
                  <th className='px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>更换单号</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>设备编号</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>备件 / 型号</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>安装位置</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>更换日期</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>更换原因</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>使用时长</th>
                  <th className='px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>操作人</th>
                  {effectiveIsAdmin && (
                    <th className='px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right'>操作</th>
                  )}
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {filteredRecords.map((r) => (
                  <tr key={r.id} className='hover:bg-slate-50/50 transition-colors'>
                    <td className='px-6 py-4'>
                      <span className='px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black'>{r.orderNo}</span>
                    </td>
                    <td className='px-4 py-4 text-xs font-black text-slate-800'>{r.deviceNo}</td>
                    <td className='px-4 py-4'>
                      <p className='text-xs font-black text-slate-800'>{r.partName}</p>
                      <p className='text-[10px] text-slate-400 font-bold'>{r.partCode} / {r.model}</p>
                    </td>
                    <td className='px-4 py-4 text-xs font-bold text-slate-600'>{r.installPosition}</td>
                    <td className='px-4 py-4 text-xs font-bold text-slate-600'>{r.replaceDate}</td>
                    <td className='px-4 py-4'>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${r.reason === 'periodic' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {r.reason === 'periodic' ? '正常周期更换' : '突发故障'}
                      </span>
                      {r.failureReason && (
                        <p className='text-[10px] text-rose-400 font-bold mt-1'>{r.failureReason}</p>
                      )}
                    </td>
                    <td className='px-4 py-4 text-xs font-black text-slate-800'>{recordUsage(r)}<span className='text-[10px] text-slate-400'> 天</span></td>
                    <td className='px-6 py-4 text-xs font-bold text-slate-600'>{r.operator}</td>
                    {effectiveIsAdmin && (
                      <td className='px-6 py-4 text-right'>
                        <button
                          onClick={() => handleDeleteRecord(r.id)}
                          className='p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95'
                          title='删除记录'>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr><td colSpan={effectiveIsAdmin ? 9 : 8} className='px-6 py-12 text-center text-slate-400 text-sm'>暂无符合条件的更换记录</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ============ 渲染：更换规律预测二级页 ============

  const renderPrediction = () => {
    return (
      <div className='fixed inset-0 z-[90] bg-slate-100 overflow-y-auto animate-in fade-in duration-300'>
        {/* 顶部导航 */}
        <div className='sticky top-0 z-10 bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-lg'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={() => setShowPrediction(false)}
              className='p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-95'>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className='text-sm font-black flex items-center'>
                <Sparkles size={16} className='mr-2 text-violet-400' /> 备件更换规律预测
              </h2>
              <p className='text-[10px] text-slate-400 font-bold mt-0.5'>
                筛查非明确性备件 · 参考其他备件更换规律推算建议周期
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPrediction(false)}
            className='p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-95'>
            <X size={16} />
          </button>
        </div>

        <div className='max-w-6xl mx-auto px-6 py-6 space-y-6'>
          {/* 预测结果列表 */}
          {predictionResults.length === 0 ? (
            <div className='bg-white rounded-[2rem] border border-slate-200 shadow-sm p-16 text-center space-y-4'>
              <div className='p-5 bg-emerald-50 rounded-full w-fit mx-auto'>
                <CircleCheck size={32} className='text-emerald-500' />
              </div>
              <p className='text-sm font-black text-slate-800'>所有备件均具备明确的更换规律</p>
              <p className='text-xs text-slate-400 font-bold'>无需参考其他备件进行预测</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {predictionResults.map((p) => {
                const remaining = p.predictedDays - p.usedDays
                const overdue = remaining <= 0
                return (
                  <div key={p.key} className='bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden'>
                    {/* 头部 */}
                    <div className='px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3'>
                      <div className='flex items-center space-x-3'>
                        <div className='p-2.5 bg-violet-50 text-violet-600 rounded-xl'>
                          <Target size={18} />
                        </div>
                        <div>
                          <h3 className='text-sm font-black text-slate-800'>
                            {p.deviceNo} <span className='text-slate-300 font-black mx-1'>|</span> {p.partName}
                          </h3>
                          <p className='text-[10px] font-mono text-slate-400 mt-0.5'>
                            {p.model} · {p.installPosition}
                          </p>
                        </div>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {p.reasons.map((r, i) => (
                          <span key={i} className='inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black'>
                            <AlertOctagon size={11} className='mr-1' /> {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className='px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6'>
                      {/* 自身历史 */}
                      <div>
                        <h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3'>自身更换历史</h4>
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between text-xs'>
                            <span className='text-slate-500 font-bold'>更换次数</span>
                            <span className='font-black text-slate-800'>{p.recordCount} 次{p.failureCount > 0 && <span className='text-rose-500'>（故障 {p.failureCount} 次）</span>}</span>
                          </div>
                          <div className='flex items-center justify-between text-xs'>
                            <span className='text-slate-500 font-bold'>间隔样本</span>
                            <span className='font-black text-slate-800 font-mono'>
                              {p.ownGaps.length ? p.ownGaps.join(' / ') : '—'}
                            </span>
                          </div>
                          <div className='flex items-center justify-between text-xs'>
                            <span className='text-slate-500 font-bold'>最近更换</span>
                            <span className='font-black text-slate-800'>{p.lastReplaceDate}（{p.usedDays} 天前）</span>
                          </div>
                        </div>
                      </div>

                      {/* 参考规律 */}
                      <div className='border-l border-slate-100 pl-6'>
                        <h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3'>参考规律（其他备件）</h4>
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between text-xs'>
                            <span className='text-slate-500 font-bold'>参考平均周期</span>
                            <span className='font-black text-emerald-600'>{p.refAvgDays > 0 ? `${p.refAvgDays} 天` : '暂无同型参考'}</span>
                          </div>
                          <div className='flex items-center justify-between text-xs'>
                            <span className='text-slate-500 font-bold'>建议更换周期</span>
                            <span className='font-black text-violet-600'>{p.predictedDays} 天（×0.9）</span>
                          </div>
                          <div className='flex items-center justify-between text-xs'>
                            <span className='text-slate-500 font-bold'>预测更换日期</span>
                            <span className='font-black text-slate-800'>{p.predictedDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* 预测结论 */}
                      <div className={`border-l pl-6 flex flex-col justify-center ${overdue ? 'border-rose-200' : 'border-emerald-200'}`}>
                        <div className={`rounded-2xl p-4 ${overdue ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          <p className='text-[10px] font-black uppercase tracking-widest mb-1'>
                            {overdue ? '建议尽快更换' : '距预测更换'}
                          </p>
                          <p className='text-2xl font-black'>
                            {overdue ? `已超 ${-remaining} 天` : `${remaining} 天`}
                          </p>
                          <p className='text-[10px] font-bold mt-1 opacity-70'>
                            按参考规律推算，建议在 {p.predictedDate} 前完成更换
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============ 渲染：周期测算与参数配置 ============

  const renderConfig = () => {
    return (
      <div className='space-y-6 animate-in fade-in duration-500'>
        <div className='bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-start text-xs font-bold text-blue-700'>
          <TrendingUp size={16} className='mr-2 mt-0.5 shrink-0' />
          <span>
            算法说明：系统按「设备编号 + 型号 + 安装位置」三要素独立归类，对历史更换间隔进行<b>加权平均</b>（越新的记录权重越高）得出平均实际使用寿命；
            预警阈值 = 平均寿命 × 安全系数。每新增一条更换记录即实时重算。
            <span className='text-red-500'>如果更换记录出现删除记录的情况，需要手动更新，重新计算一下当前的备件生命周期，会做全量计算。</span>
          </span>
        </div>

        {/* 备件周期表 */}
        <div className='bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden'>
          <div className='px-6 py-5 border-b border-slate-100 flex items-center justify-between'>
            <h3 className='text-sm font-black text-slate-800 flex items-center'>
              <SlidersHorizontal size={16} className='mr-2 text-blue-600' /> 备件生命周期测算与阈值配置
            </h3>
            {!isEngineer && (
              <span className='inline-flex items-center px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black'>
                <Lock size={11} className='mr-1' /> 技术员只读
              </span>
            )}
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead className='bg-slate-50/50'>
                <tr>
                  <th className='px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>设备 / 备件</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>历史更换</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>初始寿命</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>平均寿命</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>安全系数</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>预警阈值</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>过期时间</th>
                  <th className='px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest'>预警时间</th>
                  <th className='px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right'>操作</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {alertStatuses.map((a) => {
                  const currentFactor = parts.find((p) => p.id === a.partId)?.safetyFactor ?? 0.9
                  const stdLifecycle = parts.find((p) => p.id === a.partId)?.standardLifecycleDays
                  // 过期时间 = 最近更换日期 + 预警阈值天数
                  const nextDate = new Date(a.lastReplaceDate + 'T00:00:00')
                  nextDate.setDate(nextDate.getDate() + a.thresholdDays)
                  const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`
                  // 预警时间 = 过期时间 - 7 天
                  const warnDate = new Date(nextDate)
                  warnDate.setDate(warnDate.getDate() - 7)
                  const warnDateStr = `${warnDate.getFullYear()}-${String(warnDate.getMonth() + 1).padStart(2, '0')}-${String(warnDate.getDate()).padStart(2, '0')}`
                  return (
                    <tr key={a.key} className='hover:bg-slate-50/50 transition-colors'>
                      <td className='px-6 py-4'>
                        <p className='text-xs font-black text-slate-800'>{a.deviceNo} · {a.partName}</p>
                        <p className='text-[10px] text-slate-400 font-bold'>{a.model} / {a.installPosition}</p>
                      </td>
                      <td className='px-4 py-4 text-xs font-bold text-slate-600'>{a.recordsCount} 次</td>
                      {isEngineer ? (
                        <td className='px-4 py-4'>
                          <div className='flex items-center space-x-1.5'>
                            <input
                              type='number'
                              min='1'
                              placeholder={String(stdLifecycle ?? '')}
                              value={lifecycleDrafts[a.partId] ?? ''}
                              onChange={(e) => setLifecycleDrafts((prev) => ({ ...prev, [a.partId]: e.target.value }))}
                              className='w-16 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                            />
                            <span className='text-[10px] text-slate-400'>天</span>
                            <button
                              onClick={() => handleSaveLifecycle(a)}
                              className='px-2 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition-all active:scale-95'>
                              保存
                            </button>
                          </div>
                        </td>
                      ) : (
                        <td className='px-4 py-4 text-xs font-black text-slate-800'>{stdLifecycle ?? '—'}<span className='text-[10px] text-slate-400'> 天</span></td>
                      )}
                      <td className='px-4 py-4 text-xs font-black text-slate-800'>{a.avgLifecycleDays}<span className='text-[10px] text-slate-400'> 天</span></td>
                      <td className='px-4 py-4 text-xs font-black text-amber-600'>{currentFactor}</td>
                      <td className='px-4 py-4'>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${a.level === 'red' ? 'bg-rose-100 text-rose-600' : a.level === 'yellow' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {a.thresholdDays} 天
                        </span>
                      </td>
                      <td className='px-4 py-4'>
                        <span className={`text-xs font-bold ${a.level === 'red' ? 'text-rose-600' : a.level === 'yellow' ? 'text-amber-600' : 'text-slate-600'}`}>{nextDateStr}</span>
                      </td>
                      <td className='px-4 py-4 text-xs font-bold text-slate-600'>{warnDateStr}</td>
                      <td className='px-6 py-4 text-right'>
                        {isEngineer ? (
                          <div className='flex items-center justify-end space-x-2'>
                            <input
                              type='number'
                              step='0.05'
                              min='0'
                              max='1.5'
                              placeholder={String(currentFactor)}
                              value={factorDrafts[a.partId] ?? ''}
                              onChange={(e) => setFactorDrafts((prev) => ({ ...prev, [a.partId]: e.target.value }))}
                              className='w-20 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                            />
                            <button
                              onClick={() => handleSaveFactor(a)}
                              className='px-3 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition-all active:scale-95'>
                              保存
                            </button>
                          </div>
                        ) : (
                          <span className='text-[10px] font-bold text-slate-300'>只读</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ============ 渲染：红牌持续弹窗 ============

  const renderRedPopup = () => {
    if (redAlerts.length === 0 || redPopupDismissed) return null
    return (
      <div className='fixed inset-0 bg-rose-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90]'>
        <div className='bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200'>
          <div className='px-8 py-6 bg-rose-600 text-white'>
            <div className='flex items-center space-x-3'>
              <div className='p-3 bg-white/20 rounded-2xl animate-pulse'><AlertOctagon size={26} /></div>
              <div>
                <h3 className='text-lg font-black'>红牌强制拦截提醒</h3>
                <p className='text-xs font-bold text-rose-100'>以下备件已达到或超过最优更换节点，请尽快录入更换记录完成闭环</p>
              </div>
            </div>
          </div>
          <div className='px-8 py-6 space-y-3 max-h-[40vh] overflow-y-auto'>
            {redAlerts.map((a) => (
              <div key={a.key} className='p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between'>
                <div>
                  <p className='text-sm font-black text-slate-800'>{a.deviceNo} · {a.partName}</p>
                  <p className='text-[10px] font-bold text-slate-400'>{a.model} / {a.installPosition} · 已超期 {Math.abs(a.remainDays)} 天</p>
                </div>
                <button
                  onClick={() => prefillAndOpenRecord(a)}
                  className='shrink-0 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black hover:bg-rose-700 transition-all active:scale-95'>
                  录入更换
                </button>
              </div>
            ))}
          </div>
          <div className='px-8 py-5 border-t border-slate-100 flex items-center justify-end bg-slate-50/50'>
            <button
              onClick={() => setRedPopupDismissed(true)}
              className='px-8 py-3 text-slate-500 font-black text-sm hover:text-slate-800 transition-colors mr-4'>
              稍后处理
            </button>
            <button
              onClick={() => setShowAddRecord(true)}
              className='px-8 py-3 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-all active:scale-95'>
              去录入更换记录
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============ 渲染：新增更换记录弹窗 ============

  const renderAddRecordModal = () => {
    if (!showAddRecord) return null
    return (
      <div className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[85]' onClick={() => setShowAddRecord(false)}>
        <div className='bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200' onClick={(e) => e.stopPropagation()}>
          <div className='px-8 py-6 border-b border-slate-100 flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-black text-slate-900'>新增更换记录</h3>
              <p className='text-[10px] font-bold text-slate-400 mt-0.5'>提交后系统自动生成单号并实时重算更换周期</p>
            </div>
            <button onClick={() => setShowAddRecord(false)} className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all'>
              <X size={16} />
            </button>
          </div>

          <div className='px-8 py-6 space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>绑定设备编号 *</label>
                <input
                  value={formDeviceNo}
                  onChange={(e) => setFormDeviceNo(e.target.value)}
                  placeholder='如 YP-001'
                  className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>更换日期 *</label>
                <input
                  type='date'
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>所属机型（下拉防呆）*</label>
              <select
                value={formMachineType}
                onChange={(e) => {
                  setFormMachineType(e.target.value)
                  setFormPartName('')
                  setFormModel('')
                  setFormPosition('')
                }}
                className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'>
                {machineTypes.map((mt) => (
                  <option key={mt.id} value={mt.name}>{mt.name}</option>
                ))}
              </select>
            </div>

            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-1.5'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>备件名称（下拉）*</label>
                <select
                  value={formPartName}
                  onChange={(e) => {
                    setFormPartName(e.target.value)
                    setFormModel('')
                    setFormPosition('')
                  }}
                  className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'>
                  <option value=''>请选择</option>
                  {partNames.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className='space-y-1.5'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>型号（下拉）*</label>
                <select
                  value={formModel}
                  onChange={(e) => {
                    setFormModel(e.target.value)
                    setFormPosition('')
                  }}
                  disabled={!formPartName}
                  className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50'
                >
                  <option value=''>请选择</option>
                  {modelsForName.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className='space-y-1.5'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>安装位置（下拉）*</label>
                <select
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  disabled={!formModel}
                  className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50'
                >
                  <option value=''>请选择</option>
                  {positionsForPart.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>更换原因 *</label>
              <div className='flex space-x-4'>
                <label className='flex items-center space-x-2 cursor-pointer'>
                  <input
                    type='radio'
                    checked={formReason === 'periodic'}
                    onChange={() => setFormReason('periodic')}
                    className='w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded'
                  />
                  <span className='text-xs font-black text-slate-700'>正常周期更换</span>
                </label>
                <label className='flex items-center space-x-2 cursor-pointer'>
                  <input
                    type='radio'
                    checked={formReason === 'failure'}
                    onChange={() => setFormReason('failure')}
                    className='w-4 h-4 text-rose-600 focus:ring-rose-500 border-slate-300 rounded'
                  />
                  <span className='text-xs font-black text-slate-700'>突发故障损坏</span>
                </label>
              </div>
            </div>

            {formReason === 'failure' && (
              <div className='space-y-1.5'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>失效原因（可选）</label>
                <input
                  value={formFailureReason}
                  onChange={(e) => setFormFailureReason(e.target.value)}
                  placeholder='如 轴承异响、功率衰减等'
                  className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all'
                />
              </div>
            )}

            <div className='space-y-1.5'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>操作人</label>
              <input
                value={formOperator}
                onChange={(e) => setFormOperator(e.target.value)}
                className='w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
              />
            </div>
          </div>

          <div className='px-8 py-5 border-t border-slate-100 flex items-center justify-end bg-slate-50/50'>
            <button onClick={() => setShowAddRecord(false)} className='px-8 py-3 text-slate-500 font-black text-sm hover:text-slate-800 transition-colors mr-4'>取消</button>
            <button onClick={handleSubmitRecord} className='flex items-center px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-95'>
              <Check size={16} className='mr-2' /> 提交记录
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============ 主渲染 ============

  const navTabs = [
    { id: '预警看板', icon: <ShieldAlert size={16} /> },
    { id: '基础数据', icon: <Database size={16} /> },
    { id: '更换记录', icon: <ClipboardList size={16} /> },
    { id: '周期测算', icon: <SlidersHorizontal size={16} /> }
  ]

  return (
    <div className='space-y-6'>
      {/* 顶部：标题 + 角色切换 */}
      <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6'>
        <div className='flex items-center space-x-5'>
          <div className='p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl shadow-indigo-100 rotate-1'>
            <Wrench size={28} />
          </div>
          <div>
            <h2 className='text-2xl font-black text-slate-900 tracking-tight'>预防性维护管理</h2>
            <p className='text-sm text-slate-500'>备件生命周期管理 · 智能周期测算 · 多级预警拦截</p>
          </div>
        </div>
        <div className='flex items-center space-x-3'>
          <div className='flex items-center bg-slate-100 rounded-2xl p-1.5'>
            <UserCog size={14} className='mr-2 ml-2 text-slate-400' />
            <button
              onClick={() => setRole('ADMIN')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${role === 'ADMIN' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
              管理员
            </button>
            <button
              onClick={() => setRole('ENGINEER')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${role === 'ENGINEER' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
              设备工程师
            </button>
            <button
              onClick={() => setRole('TECHNICIAN')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${role === 'TECHNICIAN' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
              技术员
            </button>
          </div>
          {role === 'TECHNICIAN' && (
            <span className='inline-flex items-center px-3 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black'>
              <Lock size={11} className='mr-1' /> 技术员模式：仅可录入与查询
            </span>
          )}
          {role === 'ADMIN' && (
            <span className='inline-flex items-center px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black'>
              <Lock size={11} className='mr-1' /> 管理员模式：可删除更换记录
            </span>
          )}
        </div>
      </div>

      {/* 子模块导航 */}
      <div className='flex items-center space-x-2 flex-wrap gap-y-2'>
        {navTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            disabled={!isEngineer && t.id === '基础数据'}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all active:scale-95 ${
              activeTab === t.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : !isEngineer && t.id === '基础数据'
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-600 hover:text-indigo-600'
            }`}>
            {t.icon}
            <span>{t.id}</span>
            {!isEngineer && t.id === '基础数据' && <Lock size={11} />}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      {activeTab === '预警看板' && renderDashboard()}
      {activeTab === '基础数据' && renderBaseData()}
      {activeTab === '更换记录' && renderRecords()}
      {activeTab === '周期测算' && renderConfig()}

      {/* 全局浮层 */}
      {toast && (
        <div className='fixed top-20 right-6 z-[100] animate-in slide-in-from-top-4 duration-300'>
          <div className='flex items-center space-x-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-emerald-200 max-w-md'>
            <Check size={18} className='shrink-0' />
            <span className='text-sm font-bold'>{toast}</span>
          </div>
        </div>
      )}

      {renderRedPopup()}
      {renderAddRecordModal()}
      {showPrediction && renderPrediction()}

      {/* 新增机型弹窗 */}
      {showAddMachine && (
        <div className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[80]' onClick={() => setShowAddMachine(false)}>
          <div className='bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200' onClick={(e) => e.stopPropagation()}>
            <div className='px-8 py-6 border-b border-slate-100 flex items-center justify-between'>
              <h3 className='text-lg font-black text-slate-900'>新增机型分类</h3>
              <button onClick={() => setShowAddMachine(false)} className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all'>
                <X size={16} />
              </button>
            </div>
            <div className='px-8 py-6'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>机型名称</label>
              <input
                value={newMachineName}
                onChange={(e) => setNewMachineName(e.target.value)}
                placeholder='如 Y-series、YPM'
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddMachine()}
                className='w-full mt-2 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
              />
            </div>
            <div className='px-8 py-5 border-t border-slate-100 flex items-center justify-end bg-slate-50/50'>
              <button onClick={() => setShowAddMachine(false)} className='px-8 py-3 text-slate-500 font-black text-sm hover:text-slate-800 transition-colors mr-4'>取消</button>
              <button onClick={handleAddMachine} className='flex items-center px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-95'>
                <Plus size={16} className='mr-2' /> 新增
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PreventiveMaintenance
