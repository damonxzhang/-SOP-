import React from 'react'
import { MessageSquare, Search, Eye, Pencil } from 'lucide-react'
import { StepInquiry } from '../../types'

interface InquiryListProps {
  inquiries: StepInquiry[]
  filteredInquiries: StepInquiry[]
  inquiryFaultCodeFilter: string
  setInquiryFaultCodeFilter: (filter: string) => void
  inquiryStatusFilter: 'all' | 'pending' | 'resolved'
  setInquiryStatusFilter: (filter: 'all' | 'pending' | 'resolved') => void
  onViewInquiry: (inquiry: StepInquiry) => void
  onEditInquiry: (inquiry: StepInquiry) => void
  pagination: {
    page: number
    limit: number
    total: number
  }
  onPageChange: (page: number) => void
}

const InquiryList: React.FC<InquiryListProps> = ({
  inquiries,
  filteredInquiries,
  inquiryFaultCodeFilter,
  setInquiryFaultCodeFilter,
  inquiryStatusFilter,
  setInquiryStatusFilter,
  onViewInquiry,
  onEditInquiry,
  pagination,
  onPageChange
}) => {
  const statusTabs: { key: 'all' | 'pending' | 'resolved'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '未处理' },
    { key: 'resolved', label: '已处理' }
  ]
  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6'>
        <div className='flex items-center space-x-5'>
          <div className='p-4 bg-amber-600 text-white rounded-[1.5rem] shadow-2xl shadow-amber-100 rotate-1'>
            <MessageSquare size={28} />
          </div>
          <div>
            <h2 className='text-2xl font-black text-slate-900 tracking-tight'>
              现场提问记录
            </h2>
            <p className='text-sm text-slate-500'>
              实时捕获维修过程中的疑问，沉淀技术经验，提升团队协作效率
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white px-8 py-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-wrap items-center gap-4'>
        <div className='flex-1 relative min-w-[200px]'>
          <Search
            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-300'
            size={16}
          />
          <input
            placeholder='搜索故障码...'
            value={inquiryFaultCodeFilter}
            onChange={(e) => setInquiryFaultCodeFilter(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-inner'
          />
        </div>
        <div className='flex items-center gap-1.5'>
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setInquiryStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${
                inquiryStatusFilter === tab.key
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className='bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead className='bg-slate-50/50'>
              <tr>
                <th className='px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  提问信息
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  问题描述
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  状态
                </th>
                <th className='px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right'>
                  操作
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {filteredInquiries.map((inq) => (
                <tr
                  key={inq.id}
                  className='hover:bg-slate-50/50 transition-colors'>
                  <td className='px-8 py-6'>
                    <div className='space-y-1'>
                      <div className='flex items-center space-x-2'>
                        <span className='text-[10px] font-black px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md uppercase'>
                          {inq.isNewIssue ? '新问题' : '已有步骤疑问'}
                        </span>
                      </div>
                      <span className='text-[9px] text-slate-400 font-bold mt-1 italic'>
                        {inq.context?.faultCode || '无代码'} /{' '}
                        {inq.context?.stepTitle || '无标题'}
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-6'>
                    <p className='text-xs text-slate-600 line-clamp-1 italic'>
                      "{inq.question}"
                    </p>
                  </td>
                  <td className='px-4 py-6'>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${inq.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {inq.status === 'pending' ? '待处理' : '已处理'}
                    </span>
                  </td>
                  <td className='px-8 py-6 text-right'>
                    <div className='flex items-center justify-end space-x-2'>
                      {inq.status === 'pending' && (
                        <button
                          onClick={() => onEditInquiry(inq)}
                          title='编辑回复'
                          className='flex items-center space-x-1.5 px-3 py-2.5 bg-amber-600 text-white rounded-xl text-[10px] font-black hover:bg-amber-700 transition-all shadow-sm active:scale-90'>
                          <Pencil size={13} /> 编辑
                        </button>
                      )}
                      <button
                        onClick={() => onViewInquiry(inq)}
                        title='查看详情'
                        className='flex items-center space-x-1.5 px-3 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm active:scale-90'>
                        <Eye size={13} /> 查看
                      </button>
                    </div>
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
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${pagination.page === 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-slate-600 hover:bg-amber-600 hover:text-white'}`}>
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
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${pagination.page >= Math.ceil(pagination.total / pagination.limit) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-slate-600 hover:bg-amber-600 hover:text-white'}`}>
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InquiryList
