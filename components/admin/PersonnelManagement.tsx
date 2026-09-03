import React from 'react'
import { ContactRound, RefreshCcw } from 'lucide-react'
import { User } from '../../types'

interface PersonnelManagementProps {
  users: User[]
  isLoadingUsers: boolean
  pagination: {
    page: number
    limit: number
    total: number
  }
  onPageChange: (page: number) => void
}

const PersonDisplay = (v?: string) => (v && v.trim() ? v : '—')

const PersonnelManagement: React.FC<PersonnelManagementProps> = ({
  users,
  isLoadingUsers,
  pagination,
  onPageChange
}) => {
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit))

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6'>
        <div className='flex items-center space-x-5'>
          <div className='p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl shadow-blue-100 rotate-1'>
            <ContactRound size={28} />
          </div>
          <div>
            <h2 className='text-2xl font-black text-slate-900 tracking-tight'>
              人员管理
            </h2>
            <p className='text-sm text-slate-500'>
              系统用户基本信息一览（名字 / 工号 / PID / 邮箱 / 部门 / 职务）
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-3'>
          <span className='px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black border border-slate-100 uppercase tracking-widest'>
            共 {pagination.total} 人
          </span>
          {isLoadingUsers && (
            <RefreshCcw className='text-blue-500 animate-spin' size={16} />
          )}
        </div>
      </div>

      <div className='bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead className='bg-slate-50/50'>
              <tr>
                <th className='px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  名字
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  工号
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  PID
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  邮箱
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  部门
                </th>
                <th className='px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  职务
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-8 py-16 text-center text-sm text-slate-400 font-bold'>
                    {isLoadingUsers ? '人员数据加载中...' : '暂无人员数据'}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className='hover:bg-slate-50/50 transition-colors group'>
                    <td className='px-8 py-5'>
                      <div className='flex items-center space-x-3'>
                        <img
                          src={u.avatar}
                          className='w-10 h-10 rounded-xl bg-slate-100'
                          alt=''
                        />
                        <p className='text-sm font-black text-slate-900'>
                          {u.name}
                        </p>
                      </div>
                    </td>
                    <td className='px-4 py-5 text-xs font-mono text-slate-600'>
                      {PersonDisplay(u.employeeId)}
                    </td>
                    <td className='px-4 py-5 text-xs font-mono text-slate-600'>
                      {PersonDisplay(u.pid)}
                    </td>
                    <td className='px-4 py-5 text-xs text-slate-600'>
                      {PersonDisplay(u.email)}
                    </td>
                    <td className='px-4 py-5 text-xs text-slate-600'>
                      {PersonDisplay(u.department)}
                    </td>
                    <td className='px-8 py-5'>
                      <span className='px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black tracking-tight'>
                        {PersonDisplay(u.position)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination.total > 0 && (
          <div className='flex items-center justify-center mt-6 pb-6'>
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${pagination.page === 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white'}`}>
                上一页
              </button>
              <span className='text-xs font-black text-slate-600'>
                {pagination.page} / {totalPages}
              </span>
              <button
                onClick={() =>
                  onPageChange(Math.min(totalPages, pagination.page + 1))
                }
                disabled={pagination.page >= totalPages}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${pagination.page >= totalPages ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white'}`}>
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PersonnelManagement
