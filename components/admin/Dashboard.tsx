import React from 'react'
import { Clock, BadgeCheck, MessageCircleCode, BarChart3 } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from 'recharts'
import { StepInquiry } from '../../types'

interface DashboardProps {
  inquiries: StepInquiry[]
}

const Dashboard: React.FC<DashboardProps> = ({ inquiries }) => {
  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
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
    </div>
  )
}

export default Dashboard
