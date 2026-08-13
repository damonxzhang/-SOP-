import React from 'react'
import {
  User as UserIcon,
  Camera,
  MessageCircleCode
} from 'lucide-react'
import { User, StepInquiry } from '../../types'

interface PersonalInfoProps {
  currentUser: User | null
  inquiries: StepInquiry[]
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ currentUser, inquiries }) => {
  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6'>
        <div className='flex items-center space-x-5'>
          <div className='p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl shadow-blue-100 rotate-1'>
            <UserIcon size={28} />
          </div>
          <div>
            <h2 className='text-2xl font-black text-slate-900 tracking-tight'>
              个人中心
            </h2>
            <p className='text-sm text-slate-500'>
              管理您的账户信息、安全设置与偏好配置
            </p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-1 space-y-6'>
          <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center text-center'>
            <div className='relative mb-6'>
              <img
                src={currentUser?.avatar}
                className='w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-2xl bg-slate-100'
                alt=''
              />
              <button className='absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform active:scale-95'>
                <Camera size={20} />
              </button>
            </div>
            <h3 className='text-xl font-black text-slate-900'>
              {currentUser?.name}
            </h3>
            <p className='text-xs font-black text-blue-600 uppercase tracking-widest mt-1'>
              系统管理员
            </p>
            <div className='w-full h-px bg-slate-100 my-6' />
            <div className='w-full space-y-4 text-left'>
              <div className='flex items-center justify-between'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  员工工号
                </span>
                <span className='text-xs font-bold text-slate-700 font-mono'>
                  {currentUser?.employeeId}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  所属部门
                </span>
                <span className='text-xs font-bold text-slate-700'>
                  {currentUser?.department}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  入职时间
                </span>
                <span className='text-xs font-bold text-slate-700'>
                  2023-05-15
                </span>
              </div>
            </div>
          </div>

          <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm'>
            <h4 className='text-sm font-black text-slate-800 mb-6 flex items-center'>
              已有步骤疑问
            </h4>
            <div className='space-y-4'>
              {inquiries.slice(0, 3).map((inq) => (
                <div key={inq.id} className='flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100'>
                  <div className='w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center'>
                    <MessageCircleCode size={16} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs font-black text-slate-800 truncate'>
                      {inq.question}
                    </p>
                    <p className='text-[10px] text-slate-400 truncate'>
                      {inq.context?.faultCode || '无代码'} / {inq.context?.stepTitle || '无标题'}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${inq.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {inq.status === 'pending' ? '待处理' : '已处理'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='lg:col-span-2 space-y-6'>
          <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm'>
            <h3 className='text-lg font-black text-slate-900 mb-6'>账户安全设置</h3>
            <div className='space-y-6'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  登录密码
                </label>
                <div className='flex space-x-3'>
                  <input
                    type='password'
                    placeholder='••••••••'
                    className='flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner'
                  />
                  <button className='px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all active:scale-95'>
                    修改
                  </button>
                </div>
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  邮箱地址
                </label>
                <input
                  type='email'
                  value={currentUser?.email}
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  手机号码
                </label>
                <input
                  type='tel'
                  value={currentUser?.phone}
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalInfo