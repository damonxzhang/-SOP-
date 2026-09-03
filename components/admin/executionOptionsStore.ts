// 执行说明选项（PDA「操作记录 / 执行说明」下拉选项）统一存取
// localStorage 持久化，后台「执行说明选项管理」修改后实时同步到 PDA 端
// 每个选项带启用/禁用状态，禁用后不会出现在 PDA 下拉框中
// 注意：文件名与 ExecutionOptions.tsx 组件区分，避免 Windows 大小写不敏感导致误解析

export interface ExecutionOption {
  id: string
  text: string
  enabled: boolean
}

const STORAGE_KEY = 'sop_execution_options'
const CHANGE_EVENT = 'sop-execution-options-changed'

export const DEFAULT_EXECUTION_OPTIONS: ExecutionOption[] = [
  { id: 'opt-1', text: '已完成维修，设备恢复正常', enabled: true },
  { id: 'opt-2', text: '已更换备件，设备运行正常', enabled: true },
  { id: 'opt-3', text: '已完成清洁保养', enabled: true },
  { id: 'opt-4', text: '已完成校准调试', enabled: true },
  { id: 'opt-5', text: '发现新问题，需进一步排查', enabled: true }
]

export const nextOptionId = (): string =>
  `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export const loadExecutionOptions = (): ExecutionOption[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_EXECUTION_OPTIONS.map((o) => ({ ...o }))
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      // 兼容旧版本存储的纯字符串数组
      if (parsed.every((i) => typeof i === 'string')) {
        return parsed.map((text, idx) => ({
          id: `opt-${idx + 1}`,
          text,
          enabled: true
        }))
      }
      if (
        parsed.every(
          (i) => i && typeof i === 'object' && typeof i.text === 'string'
        )
      ) {
        return (parsed as ExecutionOption[]).map((o) => ({
          id: o.id || nextOptionId(),
          text: o.text,
          enabled: o.enabled !== false
        }))
      }
    }
    return DEFAULT_EXECUTION_OPTIONS.map((o) => ({ ...o }))
  } catch {
    return DEFAULT_EXECUTION_OPTIONS.map((o) => ({ ...o }))
  }
}

export const saveExecutionOptions = (opts: ExecutionOption[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(opts))
  } catch {
    /* ignore */
  }
}

// PDA 端仅取启用中的选项文本
export const loadEnabledOptionTexts = (): string[] =>
  loadExecutionOptions()
    .filter((o) => o.enabled && o.text.trim())
    .map((o) => o.text.trim())

// 选项变化时通知各模块（PDA 端）重新加载
export const notifyExecutionOptionsChanged = (): void => {
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export const subscribeExecutionOptions = (cb: () => void): (() => void) => {
  window.addEventListener(CHANGE_EVENT, cb)
  return () => window.removeEventListener(CHANGE_EVENT, cb)
}
