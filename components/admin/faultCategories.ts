// 故障分类（SOP / 报警内容下拉的分类）统一存取
// localStorage 持久化，后台「故障分类管理」修改后通过事件通知其它模块刷新

const STORAGE_KEY = 'sop_fault_categories'
const CHANGE_EVENT = 'sop-fault-categories-changed'

export const DEFAULT_FAULT_CATEGORIES = [
  '传感器污染',
  '腔室密封失效',
  '机械手卡顿',
  '射频匹配失败',
  '冷却水路堵塞'
]

export const loadFaultCategories = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_FAULT_CATEGORIES.map((c) => c)
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
        .map((c) => (typeof c === 'string' ? c : ''))
        .filter(Boolean)
    }
    return DEFAULT_FAULT_CATEGORIES.map((c) => c)
  } catch {
    return DEFAULT_FAULT_CATEGORIES.map((c) => c)
  }
}

export const saveFaultCategories = (categories: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
  } catch {
    /* ignore */
  }
}

// 分类变化时通知各模块（SOP 编辑器下拉、PDA 报警内容等）重新加载
export const notifyFaultCategoriesChanged = (): void => {
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export const subscribeFaultCategories = (cb: () => void): (() => void) => {
  window.addEventListener(CHANGE_EVENT, cb)
  return () => window.removeEventListener(CHANGE_EVENT, cb)
}
