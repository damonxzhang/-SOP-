import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Cpu,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Edit3,
  FileText
} from 'lucide-react'
import { MaintenanceGuide, Device } from '../../types'

interface SOPLibraryProps {
  guides: MaintenanceGuide[]
  devices: Device[]
  onSaveGuide: (guide: MaintenanceGuide) => void
  onToggleGuideStatus: (guideId: string) => void
  onEditGuide: (guide: MaintenanceGuide) => void
  guideSearch: string
  setGuideSearch: (search: string) => void
  guideDeviceFilter: string
  setGuideDeviceFilter: (filter: string) => void
  pagination: {
    page: number
    limit: number
    total: number
  }
  onPageChange: (page: number) => void
}

const SOPLibrary: React.FC<SOPLibraryProps> = ({
  guides,
  devices,
  onSaveGuide,
  onToggleGuideStatus,
  onEditGuide,
  guideSearch,
  setGuideSearch,
  guideDeviceFilter,
  setGuideDeviceFilter,
  pagination,
  onPageChange
}) => {
  const filteredGuidesList = useMemo(() => {
    return guides.filter((g) => {
      const searchLower = guideSearch.toLowerCase()
      const matchSearch =
        g.faultCode.toLowerCase().includes(searchLower) ||
        g.faultCategory.toLowerCase().includes(searchLower)
      const matchDevice =
        guideDeviceFilter === 'all' || g.deviceId === guideDeviceFilter
      return matchSearch && matchDevice
    })
  }, [guides, guideSearch, guideDeviceFilter])

  const handleAddGuide = () => {
    const newGuide: MaintenanceGuide = {
      id: `g${Date.now()}`,
      deviceId: 'd1',
      faultCode: 'CODE-' + Math.floor(1000 + Math.random() * 9000),
      faultCategory: '新故障分类',
      operationType: '预防性维护',
      scope: '全系统',
      faultPhenomenon: '',
      version: '1.0.0',
      steps: [],
      published: false,
      totalOccurrenceCount: 0
    }
    onEditGuide(newGuide)
  }

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6'>
        <div className='flex items-center space-x-5'>
          <div className='p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl shadow-blue-100 rotate-1'>
            <FileText size={28} />
          </div>
          <div>
            <h2 className='text-2xl font-black text-slate-900 tracking-tight'>
              企业级标准 SOP 库
            </h2>
            <p className='text-sm text-slate-500'>
              知识资产数字化管理，沉淀专家经验，驱动作业标准化
            </p>
          </div>
        </div>
        <button
          onClick={handleAddGuide}
          className='px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center shadow-2xl hover:bg-blue-600 transition-all active:scale-95'>
          <Plus size={20} className='mr-2' /> 新增规程手册
        </button>
      </div>
      <div className='bg-white px-8 py-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-wrap items-center gap-4'>
        <div className='relative group'>
          <div className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors'>
            <Cpu size={14} />
          </div>
          <select
            value={guideDeviceFilter}
            onChange={(e) => setGuideDeviceFilter(e.target.value)}
            className='pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none shadow-inner'>
            <option value='all'>所有机台型号</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.model}
              </option>
            ))}
          </select>
        </div>
        <div className='flex-1 relative min-w-[200px]'>
          <Search
            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-300'
            size={16}
          />
          <input
            placeholder='搜索故障码或 SOP 名称...'
            value={guideSearch}
            onChange={(e) => setGuideSearch(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner'
          />
        </div>
      </div>
      <div className='grid grid-cols-1 gap-4'>
        {filteredGuidesList.length > 0 ? (
          filteredGuidesList.map((g) => (
            <div
              key={g.id}
              className='bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row items-start md:items-center justify-between group'>
              <div className='flex items-start md:items-center space-x-6'>
                <div className='hidden sm:flex flex-col items-center justify-center w-16 h-16 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors'>
                  <FileText size={28} />
                </div>
                <div className='space-y-1'>
                  <div className='flex items-center space-x-3'>
                    <span className='text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md uppercase'>
                      {g.faultCode}
                    </span>
                    <span className='text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase'>
                      v{g.version}
                    </span>
                    {g.published ? (
                      <span className='text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md uppercase flex items-center'>
                        <ShieldCheck size={10} className='mr-1' /> 已启用
                      </span>
                    ) : (
                      <span className='text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md uppercase flex items-center'>
                        <ShieldAlert size={10} className='mr-1' /> 已禁用
                      </span>
                    )}
                  </div>
                  <h3 className='text-lg font-black text-slate-800'>
                    {g.faultCategory}
                  </h3>
                  <p className='text-xs text-slate-500 line-clamp-1 italic max-w-md'>
                    {g.faultPhenomenon}
                  </p>
                  <div className='flex items-center space-x-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider pt-1'>
                    <span className='flex items-center'>
                      <Cpu size={12} className='mr-1' />
                      {devices.find((d) => d.id === g.deviceId)?.model}
                    </span>
                    <span className='flex items-center'>
                      <Layers size={12} className='mr-1' />
                      {g.steps.length} 个步骤
                    </span>
                  </div>
                </div>
              </div>
              <div className='mt-4 md:mt-0 flex items-center space-x-2'>
                <button
                  onClick={() => onToggleGuideStatus(g.id)}
                  className={`flex items-center px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm ${
                    g.published
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                  }`}>
                  {g.published ? (
                    <>
                      <Lock size={14} className='mr-2' /> 禁用
                    </>
                  ) : (
                    <>
                      <Unlock size={14} className='mr-2' /> 启用
                    </>
                  )}
                </button>
                <button
                  onClick={() => onEditGuide(g)}
                  className='flex items-center px-4 py-2 bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black transition-all shadow-sm'>
                  <Edit3 size={14} className='mr-2' /> 编辑
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className='py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 text-slate-300'>
            <Search size={48} className='mb-4 opacity-20' />
            <p className='text-sm font-black uppercase tracking-widest'>
              未找到匹配的 SOP
            </p>
          </div>
        )}
      </div>
      {/* 分页控件 */}
      {pagination.total > 0 && (
        <div className='flex items-center justify-center mt-8'>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${pagination.page === 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white'}`}>
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
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${pagination.page >= Math.ceil(pagination.total / pagination.limit) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white'}`}>
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SOPLibrary
