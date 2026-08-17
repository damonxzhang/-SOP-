import React, { useEffect, useRef, useState } from 'react'
import { Clock, BadgeCheck, MessageCircleCode, BarChart3, Volume2, AlertOctagon } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from 'recharts'
import { StepInquiry, PartAlertStatus } from '../../types'
import { MOCK_PARTS, MOCK_RECORDS, computeAlertStatuses } from './pmShared'
import { isAutoSpeakEnabled, subscribeAutoSpeak } from './autoSpeak'

interface DashboardProps {
  inquiries: StepInquiry[]
}

const Dashboard: React.FC<DashboardProps> = ({ inquiries }) => {
  // ============ 过期备件语音播报（与预防性维护同源数据） ============
  const [alertStatuses] = useState<PartAlertStatus[]>(() => computeAlertStatuses(MOCK_RECORDS, MOCK_PARTS))
  const [toast, setToast] = useState<string | null>(null)

  const redAlerts = alertStatuses.filter((a) => a.level === 'red')

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

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      {redAlerts.length > 0 && (
        <div className='bg-rose-50 border-2 border-rose-200 rounded-[2rem] px-6 py-4 flex items-center justify-between gap-4 animate-pulse'>
          <div className='flex items-center space-x-3'>
            <div className='p-2.5 bg-rose-600 text-white rounded-2xl'><AlertOctagon size={20} /></div>
            <div>
              <p className='text-sm font-black text-rose-700'>
                检测到 {redAlerts.length} 个备件已过期
              </p>
              <p className='text-[10px] font-bold text-rose-500'>
                {redAlerts.map((a) => `${a.deviceNo} · ${a.partName}`).join('，')}，请立即安排更换
              </p>
            </div>
          </div>
          <button
            onClick={speakRedAlerts}
            title='语音播报过期备件'
            className='flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-200 shrink-0'>
            <Volume2 size={15} />
            <span className='text-[10px] font-black'>语音播报</span>
          </button>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center text-center'>
          <div className='p-4 bg-blue-50 rounded-[1.5rem] text-blue-600 mb-4'>
            <Clock size={24} />
          </div>
          <h3 className='text-lg font-black text-slate-900 mb-1'>3.4h</h3>
          <p className='text-sm text-slate-500'>平均修复时间 (MTTR)</p>
          <span className='text-xs font-black text-emerald-600 mt-2'>-12%</span>
        </div>
        <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center text-center'>
          <div className='p-4 bg-emerald-50 rounded-[1.5rem] text-emerald-600 mb-4'>
            <BadgeCheck size={24} />
          </div>
          <h3 className='text-lg font-black text-slate-900 mb-1'>98.2%</h3>
          <p className='text-sm text-slate-500'>SOP 依同率</p>
          <span className='text-xs font-black text-emerald-600 mt-2'>
            +2.1%
          </span>
        </div>
        <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center text-center'>
          <div className='p-4 bg-amber-50 rounded-[1.5rem] text-amber-600 mb-4'>
            <MessageCircleCode size={24} />
          </div>
          <h3 className='text-lg font-black text-slate-900 mb-1'>
            {inquiries.filter((i) => i.status === 'pending').length}
          </h3>
          <p className='text-sm text-slate-500'>未处理提问</p>
          <span className='text-xs font-black text-amber-600 mt-2'>High</span>
        </div>
        <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center text-center'>
          <div className='p-4 bg-rose-50 rounded-[1.5rem] text-rose-600 mb-4'>
            <BarChart3 size={24} />
          </div>
          <h3 className='text-lg font-black text-slate-900 mb-1'>14%</h3>
          <p className='text-sm text-slate-500'>高危操作占比</p>
          <span className='text-xs font-black text-emerald-600 mt-2'>-3%</span>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6'>
        <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm h-80'>
          <div className='flex items-center justify-between mb-6'>
            <h4 className='text-sm font-black text-slate-800 flex items-center'>
              <BarChart3 size={18} className='mr-2 text-blue-500' />{' '}
              故障趋势分布 (近7日)
            </h4>
          </div>
          <div className='h-[200px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={[
                  { name: '周一', count: 12 },
                  { name: '周二', count: 19 },
                  { name: '周三', count: 15 },
                  { name: '周四', count: 22 },
                  { name: '周五', count: 18 },
                  { name: '周六', count: 7 },
                  { name: '周日', count: 5 }
                ]}>
                <defs>
                  <linearGradient id='colorCount' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                  stroke='#f1f5f9'
                />
                <XAxis
                  dataKey='name'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  dx={-10}
                />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: '1rem',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area
                  type='monotone'
                  dataKey='count'
                  stroke='#3b82f6'
                  strokeWidth={3}
                  fillOpacity={1}
                  fill='url(#colorCount)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {toast && (
        <div className='fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl'>
          {toast}
        </div>
      )}
    </div>
  )
}

export default Dashboard
