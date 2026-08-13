import {
  MachineTypeInfo,
  SparePart,
  ReplacementRecord,
  ThresholdAdjustLog,
  PartAlertStatus
} from '../../types'

// ================= 模拟基础数据 =================

export const MOCK_MACHINE_TYPES: MachineTypeInfo[] = [
  { id: 'mt-1', name: 'Y-series', createdAt: '2026-01-01' },
  { id: 'mt-2', name: 'YPM', createdAt: '2026-01-01' }
]

export const MOCK_PARTS: SparePart[] = [
  { id: 'sp-1', machineType: 'Y-series', code: 'SP-YS-001', name: '光罩传送机械臂', model: 'Y-ARM-01', installPosition: 'A1 轴', standardLifecycleDays: 180, safetyFactor: 0.9 },
  { id: 'sp-2', machineType: 'Y-series', code: 'SP-YS-002', name: '晶圆真空吸盘', model: 'Y-GRP-01', installPosition: '传输腔体', standardLifecycleDays: 150, safetyFactor: 0.9 },
  { id: 'sp-3', machineType: 'Y-series', code: 'SP-YS-003', name: '聚焦透镜组', model: 'Y-LEN-01', installPosition: '光学头单元', standardLifecycleDays: 365, safetyFactor: 0.9 },
  { id: 'sp-4', machineType: 'Y-series', code: 'SP-YS-004', name: '真空规传感器', model: 'Y-VAC-01', installPosition: '真空腔壁', standardLifecycleDays: 120, safetyFactor: 0.9 },
  { id: 'sp-5', machineType: 'YPM', code: 'SP-YPM-001', name: '激光二极管模组', model: 'YPM-LD-01', installPosition: '光源单元', standardLifecycleDays: 240, safetyFactor: 0.9 },
  { id: 'sp-6', machineType: 'YPM', code: 'SP-YPM-002', name: '冷却循环泵', model: 'YPM-PMP-01', installPosition: '冷却单元', standardLifecycleDays: 200, safetyFactor: 0.9 },
  { id: 'sp-7', machineType: 'YPM', code: 'SP-YPM-003', name: '步进电机', model: 'YPM-MOT-01', installPosition: '扫描轴', standardLifecycleDays: 300, safetyFactor: 0.9 },
  { id: 'sp-8', machineType: 'YPM', code: 'SP-YPM-004', name: '空气过滤器', model: 'YPM-FIL-01', installPosition: '气路单元', standardLifecycleDays: 90, safetyFactor: 0.9 }
]

// 返回 N 天前的日期字符串（模拟数据相对当天生成，保证演示时红/黄/正常三种状态并存）
const daysAgo = (n: number): string => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const MOCK_RECORDS: ReplacementRecord[] = [
  { id: 'r-001', orderNo: 'PMR-20250915-001', deviceNo: 'YP-001', partId: 'sp-5', partCode: 'SP-YPM-001', partName: '激光二极管模组', model: 'YPM-LD-01', installPosition: '光源单元', replaceDate: daysAgo(249), reason: 'periodic', operator: '张伟', createdAt: '2025-09-15 09:00:00' },
  { id: 'r-002', orderNo: 'PMR-20260112-001', deviceNo: 'YP-001', partId: 'sp-5', partCode: 'SP-YPM-001', partName: '激光二极管模组', model: 'YPM-LD-01', installPosition: '光源单元', replaceDate: daysAgo(130), reason: 'failure', failureReason: '输出功率衰减至阈值以下', operator: '张伟', createdAt: '2026-01-12 14:30:00' },
  { id: 'r-003', orderNo: 'PMR-20251210-001', deviceNo: 'YP-002', partId: 'sp-6', partCode: 'SP-YPM-002', partName: '冷却循环泵', model: 'YPM-PMP-01', installPosition: '冷却单元', replaceDate: daysAgo(151), reason: 'periodic', operator: '李强', createdAt: '2025-12-10 10:20:00' },
  { id: 'r-004', orderNo: 'PMR-20260205-001', deviceNo: 'YP-002', partId: 'sp-6', partCode: 'SP-YPM-002', partName: '冷却循环泵', model: 'YPM-PMP-01', installPosition: '冷却单元', replaceDate: daysAgo(94), reason: 'failure', failureReason: '轴承异响，工作电流偏高', operator: '李强', createdAt: '2026-02-05 16:45:00' },
  { id: 'r-005', orderNo: 'PMR-20260209-001', deviceNo: 'YP-003', partId: 'sp-8', partCode: 'SP-YPM-004', partName: '空气过滤器', model: 'YPM-FIL-01', installPosition: '气路单元', replaceDate: daysAgo(89), reason: 'periodic', operator: '赵敏', createdAt: '2026-02-09 08:50:00' },
  { id: 'r-006', orderNo: 'PMR-20260329-001', deviceNo: 'YP-003', partId: 'sp-8', partCode: 'SP-YPM-004', partName: '空气过滤器', model: 'YPM-FIL-01', installPosition: '气路单元', replaceDate: daysAgo(41), reason: 'periodic', operator: '赵敏', createdAt: '2026-03-29 11:05:00' },
  { id: 'r-007', orderNo: 'PMR-20251220-001', deviceNo: 'YS-001', partId: 'sp-1', partCode: 'SP-YS-001', partName: '光罩传送机械臂', model: 'Y-ARM-01', installPosition: 'A1 轴', replaceDate: daysAgo(141), reason: 'failure', failureReason: '传动皮带断裂', operator: '王海', createdAt: '2025-12-20 13:10:00' },
  { id: 'r-008', orderNo: 'PMR-20260220-001', deviceNo: 'YS-001', partId: 'sp-1', partCode: 'SP-YS-001', partName: '光罩传送机械臂', model: 'Y-ARM-01', installPosition: 'A1 轴', replaceDate: daysAgo(79), reason: 'periodic', operator: '王海', createdAt: '2026-02-20 09:40:00' },
  { id: 'r-009', orderNo: 'PMR-20260415-001', deviceNo: 'YS-001', partId: 'sp-1', partCode: 'SP-YS-001', partName: '光罩传送机械臂', model: 'Y-ARM-01', installPosition: 'A1 轴', replaceDate: daysAgo(25), reason: 'periodic', operator: '王海', createdAt: '2026-04-15 15:25:00' },
  { id: 'r-010', orderNo: 'PMR-20260301-001', deviceNo: 'YS-002', partId: 'sp-2', partCode: 'SP-YS-002', partName: '晶圆真空吸盘', model: 'Y-GRP-01', installPosition: '传输腔体', replaceDate: daysAgo(70), reason: 'periodic', operator: '陈静', createdAt: '2026-03-01 10:15:00' },
  { id: 'r-011', orderNo: 'PMR-20260428-001', deviceNo: 'YS-002', partId: 'sp-2', partCode: 'SP-YS-002', partName: '晶圆真空吸盘', model: 'Y-GRP-01', installPosition: '传输腔体', replaceDate: daysAgo(12), reason: 'periodic', operator: '陈静', createdAt: '2026-04-28 14:00:00' },
  { id: 'r-012', orderNo: 'PMR-20260401-001', deviceNo: 'YS-003', partId: 'sp-3', partCode: 'SP-YS-003', partName: '聚焦透镜组', model: 'Y-LEN-01', installPosition: '光学头单元', replaceDate: daysAgo(39), reason: 'periodic', operator: '刘洋', createdAt: '2026-04-01 09:30:00' },
  { id: 'r-013', orderNo: 'PMR-20260310-001', deviceNo: 'YP-003', partId: 'sp-7', partCode: 'SP-YPM-003', partName: '步进电机', model: 'YPM-MOT-01', installPosition: '扫描轴', replaceDate: daysAgo(61), reason: 'periodic', operator: '赵敏', createdAt: '2026-03-10 11:50:00' },
  { id: 'r-014', orderNo: 'PMR-20260420-001', deviceNo: 'YP-003', partId: 'sp-7', partCode: 'SP-YPM-003', partName: '步进电机', model: 'YPM-MOT-01', installPosition: '扫描轴', replaceDate: daysAgo(20), reason: 'periodic', operator: '赵敏', createdAt: '2026-04-20 10:10:00' }
]

export const MOCK_LOGS: ThresholdAdjustLog[] = [
  { id: 'log-1', partId: 'sp-5', partName: '激光二极管模组', field: '安全系数', beforeValue: 0.95, afterValue: 0.9, operator: '王工', operateTime: '2026-03-02 10:00:00' },
  { id: 'log-2', partId: 'sp-6', partName: '冷却循环泵', field: '安全系数', beforeValue: 0.9, afterValue: 0.85, operator: '王工', operateTime: '2026-03-15 14:30:00' }
]

// ================= 工具函数 =================

const dayDiff = (from: string, to: string): number => {
  const d1 = new Date(from + 'T00:00:00').getTime()
  const d2 = new Date(to + 'T00:00:00').getTime()
  return Math.round((d2 - d1) / 86400000)
}

const dayDiffToToday = (dateStr: string): number => {
  const d1 = new Date(dateStr + 'T00:00:00').getTime()
  return Math.max(0, Math.floor((Date.now() - d1) / 86400000))
}

export const todayStr = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const nowStr = (): string => {
  const d = new Date()
  return `${todayStr()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ================= 生命周期与预警测算 =================

// 基于更换记录计算各备件三要素维度的预警状态（加权平均寿命 × 安全系数 = 预警阈值）
export const computeAlertStatuses = (records: ReplacementRecord[], parts: SparePart[]): PartAlertStatus[] => {
  const map = new Map<string, ReplacementRecord[]>()
  records.forEach((r) => {
    const key = `${r.deviceNo}|${r.model}|${r.installPosition}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  })
  const list: PartAlertStatus[] = []
  map.forEach((recs) => {
    const sorted = [...recs].sort((a, b) => a.replaceDate.localeCompare(b.replaceDate))
    const part = parts.find((p) => p.id === sorted[0].partId)
    const std = part?.standardLifecycleDays || 180
    const gaps: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(dayDiff(sorted[i - 1].replaceDate, sorted[i].replaceDate))
    }
    // 加权平均：越新的记录权重越高
    let avgLifecycle: number
    if (gaps.length === 0) {
      avgLifecycle = std
    } else {
      const weights = gaps.map((_, i) => i + 1)
      const totalW = weights.reduce((a, b) => a + b, 0)
      avgLifecycle = Math.round(gaps.reduce((s, g, i) => s + g * weights[i], 0) / totalW)
    }
    const safetyFactor = part?.safetyFactor ?? 0.9
    const thresholdDays = Math.round(avgLifecycle * safetyFactor)
    const last = sorted[sorted.length - 1]
    const usedDays = dayDiffToToday(last.replaceDate)
    const remainDays = thresholdDays - usedDays
    const level = remainDays <= 0 ? 'red' : remainDays <= 5 ? 'yellow' : 'normal'
    list.push({
      key: `${last.deviceNo}|${last.model}|${last.installPosition}`,
      deviceNo: last.deviceNo,
      partId: last.partId,
      partCode: last.partCode,
      partName: last.partName,
      model: last.model,
      installPosition: last.installPosition,
      lastReplaceDate: last.replaceDate,
      thresholdDays,
      usedDays,
      remainDays,
      level,
      recordsCount: sorted.length,
      avgLifecycleDays: avgLifecycle
    })
  })
  return list.sort((a, b) => a.remainDays - b.remainDays)
}
