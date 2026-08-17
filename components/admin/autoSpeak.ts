// 语音自动播报开关（localStorage 持久化，默认关闭，避免进后台时自动播放）
const STORAGE_KEY = 'sop_auto_speak_enabled'
const CHANGE_EVENT = 'sop-auto-speak-changed'

export const isAutoSpeakEnabled = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export const setAutoSpeakEnabled = (v: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEY, v ? '1' : '0')
  } catch {
    /* ignore */
  }
}

// 开关变化时通知各模块（统计看板/预防性维护）重新评估播报行为
export const notifyAutoSpeakChanged = (): void => {
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export const subscribeAutoSpeak = (cb: () => void): (() => void) => {
  window.addEventListener(CHANGE_EVENT, cb)
  return () => window.removeEventListener(CHANGE_EVENT, cb)
}
