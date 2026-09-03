import React from 'react'
import {
  Users,
  Search,
  RefreshCcw,
  Settings,
  UserCheck,
  UserMinus,
  Trash2
} from 'lucide-react'
import { User, Role } from '../../types'

interface UserManagementProps {
  users: User[]
  isLoadingUsers: boolean
  onEditUser: (user: User) => void
  onDeleteUser: (userId: string) => void
  pagination: {
    page: number
    limit: number
    total: number
  }
  onPageChange: (page: number) => void
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  isLoadingUsers,
  onEditUser,
  onDeleteUser,
  pagination,
  onPageChange
}) => {
  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6'>
        <div className='flex items-center space-x-5'>
          <div className='p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl shadow-indigo-100 rotate-1'>
            <Users size={28} />
          </div>
          <div>
            <h2 className='text-2xl font-black text-slate-900 tracking-tight'>
              工程师权限矩阵
            </h2>
            <p className='text-sm text-slate-500'>
              基于角色的访问控制 (RBAC)，定义资产操作红线与管理颗粒度
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden'>
        <div className='px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div className='flex space-x-3'>
            <span className='px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black border border-slate-100 uppercase tracking-widest'>
              活跃账户: {users.filter((u) => u.status === 'active').length}
            </span>
            <span className='px-4 py-1.5 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black border border-rose-100 uppercase tracking-widest'>
              已停用: {users.filter((u) => u.status === 'disabled').length}
            </span>
          </div>
          <div className='relative'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-300'
              size={16}
            />
            <input
              placeholder='输入姓名或工号快速搜索...'
              className='pl-10 pr-10 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-inner'
            />
            {isLoadingUsers && (
              <RefreshCcw
                className='absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin'
                size={14}
              />
            )}
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead className='bg-slate-50/50'>
              <tr>
                <th className='px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  工程师基本面
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  角色等级
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  最后登录
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  状态
                </th>
                <th className='px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right'>
                  管理操作
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className='hover:bg-slate-50/50 transition-colors group'>
                  <td className='px-8 py-6'>
                    <div className='flex items-center space-x-3'>
                      <img
                        src={u.avatar}
                        className='w-10 h-10 rounded-xl bg-slate-100'
                        alt=''
                      />
                      <div>
                        <p className='text-sm font-black text-slate-900'>
                          {u.name}
                        </p>
                        <p className='text-[10px] text-slate-400 font-mono tracking-tighter uppercase'>
                          {u.employeeId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-6'>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${u.role === Role.ADMIN ? 'bg-rose-50 text-rose-600' : u.role === Role.SENIOR_ENGINEER ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className='px-4 py-6 text-[10px] text-slate-500 font-mono'>
                    {u.lastLogin || '--'}
                  </td>
                  <td className='px-4 py-6'>
                    {u.status === 'active' ? (
                      <span className='text-emerald-600 flex items-center text-[10px] font-black uppercase'>
                        <UserCheck size={12} className='mr-1' /> 正常
                      </span>
                    ) : (
                      <span className='text-slate-400 flex items-center text-[10px] font-black uppercase'>
                        <UserMinus size={12} className='mr-1' /> 已冻结
                      </span>
                    )}
                  </td>
                  <td className='px-8 py-6 text-right space-x-2'>
                    <button
                      onClick={() => onEditUser(u)}
                      className='p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm active:scale-90'>
                      <Settings size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteUser(u.id)}
                      className='p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-600 transition-all shadow-sm active:scale-90'>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 分页控件 */}
        {pagination.total > 0 && (
          <div className='flex items-center justify-center mt-6 pb-6'>
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${pagination.page === 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-slate-600 hover:bg-indigo-600 hover:text-white'}`}>
                上一页
              </button>
              <span className='text-xs font-black text-slate-600'>
                {pagination.page} /{' '}
                {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                onClick={() =>
                  onPageChange(
                    Math.min(
                      Math.ceil(pagination.total / pagination.limit),
                      pagination.page + 1
                    )
                  )
                }
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.limit)
                }
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${pagination.page >= Math.ceil(pagination.total / pagination.limit) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-slate-600 hover:bg-indigo-600 hover:text-white'}`}>
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserManagement
