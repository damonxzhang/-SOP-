import React, { useState } from 'react'
import {
  Mail,
  MailOpen,
  Trash2,
  Send,
  Package,
  Wrench,
  User,
  Clock
} from 'lucide-react'
import { EmailNotification } from '../../types'

interface EmailInboxProps {
  emails: EmailNotification[]
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}

const EmailInbox: React.FC<EmailInboxProps> = ({
  emails,
  onMarkRead,
  onDelete
}) => {
  const [viewingEmail, setViewingEmail] = useState<EmailNotification | null>(
    null
  )

  const unreadCount = emails.filter((e) => e.status === 'unread').length

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      {/* 页面标题 */}
      <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6'>
        <div className='flex items-center space-x-5'>
          <div className='p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl shadow-blue-100 rotate-1'>
            <Mail size={28} />
          </div>
          <div>
            <h2 className='text-2xl font-black text-slate-900 tracking-tight'>
              模拟邮件收件箱
            </h2>
            <p className='text-sm text-slate-500'>
              展示现场提问推送的报修提醒邮件（模拟接收，共 {emails.length} 封，
              {unreadCount > 0 ? `${unreadCount} 封未读` : '全部已读'}）
            </p>
          </div>
        </div>
      </div>

      {/* 邮件列表 */}
      <div className='bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden'>
        {emails.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 px-8 text-center'>
            <div className='w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4'>
              <Mail className='w-8 h-8 text-slate-300' />
            </div>
            <p className='text-sm font-black text-slate-500'>暂无邮件</p>
            <p className='text-xs text-slate-400 mt-1'>
              前往「现场提问记录」点击推送邮件按钮，即可在此模拟收到报修提醒
            </p>
          </div>
        ) : (
          <ul className='divide-y divide-slate-100'>
            {emails.map((email) => (
              <li
                key={email.id}
                className={`p-6 cursor-pointer transition-colors hover:bg-slate-50/60 ${
                  email.status === 'unread' ? 'bg-blue-50/40' : ''
                }`}
                onClick={() => {
                  setViewingEmail(email)
                  if (email.status === 'unread') onMarkRead(email.id)
                }}>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex items-start space-x-4 min-w-0'>
                    <div
                      className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        email.status === 'unread'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                      {email.status === 'unread' ? (
                        <Mail size={18} />
                      ) : (
                        <MailOpen size={18} />
                      )}
                    </div>
                    <div className='min-w-0'>
                      <div className='flex items-center space-x-2'>
                        {email.status === 'unread' && (
                          <span className='w-2 h-2 bg-blue-600 rounded-full shrink-0' />
                        )}
                        <p className='text-sm font-black text-slate-800 truncate'>
                          {email.subject}
                        </p>
                      </div>
                      <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-2'>
                        <span className='inline-flex items-center text-[10px] font-bold text-slate-500'>
                          <Package size={12} className='mr-1 text-blue-500' />
                          {email.deviceName}
                        </span>
                        <span className='inline-flex items-center text-[10px] font-bold text-slate-500'>
                          <Wrench size={12} className='mr-1 text-amber-500' />
                          报修类型：{email.repairType}
                          （{email.faultCode}）
                        </span>
                        <span className='inline-flex items-center text-[10px] font-bold text-slate-500'>
                          <User size={12} className='mr-1 text-emerald-500' />
                          {email.requester}
                        </span>
                        <span className='inline-flex items-center text-[10px] font-bold text-slate-400'>
                          <Clock size={12} className='mr-1' />
                          {email.sendTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(email.id)
                    }}
                    title='删除邮件'
                    className='shrink-0 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90'>
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 邮件详情弹窗 */}
      {viewingEmail && (
        <div
          className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[80]'
          onClick={() => setViewingEmail(null)}>
          <div
            className='bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200'
            onClick={(e) => e.stopPropagation()}>
            {/* 弹窗头部 */}
            <div className='px-8 py-6 border-b border-slate-100 flex items-start justify-between gap-4'>
              <div>
                <div className='flex items-center space-x-2 mb-2'>
                  <span className='inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase'>
                    <Send size={10} className='mr-1' />
                    已接收
                  </span>
                  {viewingEmail.status === 'unread' && (
                    <span className='inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[10px] font-black uppercase'>
                      未读
                    </span>
                  )}
                </div>
                <h3 className='text-lg font-black text-slate-900'>
                  {viewingEmail.subject}
                </h3>
              </div>
              <button
                onClick={() => setViewingEmail(null)}
                className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all active:scale-90'>
                <Mail size={16} />
              </button>
            </div>

            {/* 邮件正文 */}
            <div className='px-8 py-6 space-y-5'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='p-4 bg-slate-50 rounded-2xl border border-slate-100'>
                  <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>
                    设备名称
                  </p>
                  <p className='text-sm font-bold text-slate-800'>
                    {viewingEmail.deviceName}
                  </p>
                </div>
                <div className='p-4 bg-slate-50 rounded-2xl border border-slate-100'>
                  <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>
                    报修类型
                  </p>
                  <p className='text-sm font-bold text-slate-800'>
                    {viewingEmail.repairType}
                    <span className='ml-2 text-xs font-black text-amber-600'>
                      {viewingEmail.faultCode}
                    </span>
                  </p>
                </div>
                <div className='p-4 bg-slate-50 rounded-2xl border border-slate-100'>
                  <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>
                    提交人
                  </p>
                  <p className='text-sm font-bold text-slate-800'>
                    {viewingEmail.requester}
                  </p>
                </div>
                <div className='p-4 bg-slate-50 rounded-2xl border border-slate-100'>
                  <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>
                    提交时间
                  </p>
                  <p className='text-sm font-bold text-slate-800'>
                    {viewingEmail.sendTime}
                  </p>
                </div>
              </div>

              <div>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2'>
                  反馈意见
                </p>
                <div className='p-5 bg-blue-50/50 rounded-2xl border border-blue-100'>
                  <p className='text-sm text-slate-700 leading-relaxed'>
                    "{viewingEmail.feedback}"
                  </p>
                </div>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className='px-8 py-5 border-t border-slate-100 flex items-center justify-end bg-slate-50/50'>
              <button
                onClick={() => setViewingEmail(null)}
                className='px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all active:scale-95'>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailInbox
