import React, { useState, useEffect, useMemo } from 'react'
import {
  BookOpen,
  Search,
  RefreshCcw,
  ChevronDown,
  ChevronRight,
  History,
  ClipboardList,
  Layers,
  Users
} from 'lucide-react'
import { MaintenanceGuide, RepairRecord, Device, User } from '../../types'
import { MOCK_RECORDS } from '../../constants'

interface SOPUsageRecordProps {
  guides: MaintenanceGuide[]
  devices: Device[]
  users: User[]
}

const SOPUsageRecord: React.FC<SOPUsageRecordProps> = ({
  guides,
  devices,
  users
}) => {
  const [records, setRecords] = useState<RepairRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [guideFilter, setGuideFilter] = useState('all')
  const [deviceFilter, setDeviceFilter] = useState('all')
  const [engineerFilter, setEngineerFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 尝试从后端拉取维修记录，后端未就绪时使用模拟数据
  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/backend/repair-records/list')
      .then((r) => r.json())
      .then((res) => {
        if (mounted && res.code === 200 && Array.isArray(res.data?.list)) {
          setRecords(res.data.list)
        } else if (mounted) {
          setRecords(MOCK_RECORDS)
        }
      })
      .catch(() => {
        if (mounted) setRecords(MOCK_RECORDS)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const guideOf = (record: RepairRecord) =>
    guides.find((g) => g.id === record.guideId)

  const deviceOf = (record: RepairRecord) => {
    const guide = guideOf(record)
    if (guide) return devices.find((d) => d.id === guide.deviceId)
    return null
  }

  const engineerOf = (record: RepairRecord) =>
    users.find((u) => u.id === record.engineerId)

  const stepTitles = (record: RepairRecord) => {
    const guide = guideOf(record)
    if (!guide) return []
    return record.completedSteps
      .map((sid) => guide.steps.find((s) => s.id === sid))
      .filter((s) => !!s)
  }

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const guide = guideOf(r)
      const device = deviceOf(r)
      const engineer = engineerOf(r)
      const searchLower = search.toLowerCase()
      const matchSearch =
        !search ||
        (guide &&
          (guide.faultCode.toLowerCase().includes(searchLower) ||
            guide.faultCategory.toLowerCase().includes(searchLower) ||
            guide.faultPhenomenon.toLowerCase().includes(searchLower)))
      const matchGuide = guideFilter === 'all' || r.guideId === guideFilter
      const matchDevice =
        deviceFilter === 'all' || guide?.deviceId === deviceFilter
      const matchEngineer =
        engineerFilter === 'all' || r.engineerId === engineerFilter
      return (
        matchSearch && matchGuide && matchDevice && matchEngineer
      )
    })
  }, [records, search, guideFilter, deviceFilter, engineerFilter, guides, devices, users])

  const totalStepUsage = useMemo(
    () => records.reduce((sum, r) => sum + r.completedSteps.length, 0),
    [records]
  )
  const usedGuideCount = useMemo(
    () => new Set(records.map((r) => r.guideId)).size,
    [records]
  )
  const engineerCount = useMemo(
    () => new Set(records.map((r) => r.engineerId)).size,
    [records]
  )

  const resetFilters = () => {
    setSearch('')
    setGuideFilter('all')
    setDeviceFilter('all')
    setEngineerFilter('all')
  }

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      {/* 顶部标题 */}
      <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6'>
        <div className='flex items-center space-x-5'>
          <div className='p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl shadow-blue-100 -rotate-1'>
            <History size={28} />
          </div>
          <div>
            <h2 className='text-2xl font-black text-slate-900 tracking-tight'>
              SOP 库的使用记录
            </h2>
            <p className='text-sm text-slate-500'>
              记录每一次维修中使用的标准 SOP 库及其操作步骤，形成可追溯的维修轨迹
            </p>
          </div>
        </div>
        {loading && (
          <span className='inline-flex items-center px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black'>
            数据加载中...
          </span>
        )}
      </div>

      {/* 统计卡片 */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white rounded-2xl border border-slate-200 p-5 shadow-sm'>
          <div className='flex items-center space-x-2 text-slate-400'>
            <ClipboardList size={16} className='text-blue-500' />
            <span className='text-[10px] font-black uppercase tracking-widest'>
              维修记录
            </span>
          </div>
          <p className='text-3xl font-black text-blue-600 mt-3'>{records.length}</p>
          <p className='text-[10px] text-slate-400 font-bold mt-1'>使用过 SOP 的维修任务</p>
        </div>
        <div className='bg-white rounded-2xl border border-slate-200 p-5 shadow-sm'>
          <div className='flex items-center space-x-2 text-slate-400'>
            <BookOpen size={16} className='text-indigo-500' />
            <span className='text-[10px] font-black uppercase tracking-widest'>
              涉及 SOP
            </span>
          </div>
          <p className='text-3xl font-black text-indigo-600 mt-3'>{usedGuideCount}</p>
          <p className='text-[10px] text-slate-400 font-bold mt-1'>被引用的标准 SOP 库</p>
        </div>
        <div className='bg-white rounded-2xl border border-slate-200 p-5 shadow-sm'>
          <div className='flex items-center space-x-2 text-slate-400'>
            <Layers size={16} className='text-emerald-500' />
            <span className='text-[10px] font-black uppercase tracking-widest'>
              步骤执行
            </span>
          </div>
          <p className='text-3xl font-black text-emerald-600 mt-3'>{totalStepUsage}</p>
          <p className='text-[10px] text-slate-400 font-bold mt-1'>累计执行的操作步骤</p>
        </div>
        <div className='bg-white rounded-2xl border border-slate-200 p-5 shadow-sm'>
          <div className='flex items-center space-x-2 text-slate-400'>
            <Users size={16} className='text-amber-500' />
            <span className='text-[10px] font-black uppercase tracking-widest'>
              工程师
            </span>
          </div>
          <p className='text-3xl font-black text-amber-600 mt-3'>{engineerCount}</p>
          <p className='text-[10px] text-slate-400 font-bold mt-1'>参与执行的工程师</p>
        </div>
      </div>

      {/* 筛选区 */}
      <div className='bg-white px-8 py-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-wrap items-center gap-4'>
        <div className='flex-1 relative min-w-[200px]'>
          <Search
            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-300'
            size={16}
          />
          <input
            placeholder='搜索故障码、故障分类或故障现象...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner'
          />
        </div>
        <select
          value={guideFilter}
          onChange={(e) => setGuideFilter(e.target.value)}
          className='p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'>
          <option value='all'>全部 SOP 库</option>
          {guides.map((g) => (
            <option key={g.id} value={g.id}>
              {g.faultCode} · {g.faultCategory}
            </option>
          ))}
        </select>
        <select
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          className='p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'>
          <option value='all'>全部设备</option>
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.model}
            </option>
          ))}
        </select>
        <select
          value={engineerFilter}
          onChange={(e) => setEngineerFilter(e.target.value)}
          className='p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'>
          <option value='all'>全部工程师</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <button
          onClick={resetFilters}
          className='px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition-all active:scale-95'>
          <RefreshCcw size={14} className='inline mr-1' />
          重置
        </button>
      </div>

      {/* 使用记录清单 */}
      <div className='bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden'>
        <div className='px-8 py-5 border-b border-slate-100'>
          <h3 className='text-sm font-black text-slate-800 flex items-center'>
            <ClipboardList size={16} className='mr-2 text-blue-600' />
            使用记录清单（{filteredRecords.length}）
          </h3>
          <p className='text-[10px] font-bold text-slate-400 mt-1'>
            每条记录对应一次维修任务，展开可查看本次维修使用了该 SOP 的哪些操作步骤
          </p>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead className='bg-slate-50/50'>
              <tr>
                <th className='px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  维修记录
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  报修单号
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  维修单号
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  报警代码
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  设备
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  使用的 SOP 库
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  工程师
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  操作步骤
                </th>
                <th className='px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  状态
                </th>
                <th className='px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right'>
                  详情
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {filteredRecords.map((r) => {
                const guide = guideOf(r)
                const device = deviceOf(r)
                const engineer = engineerOf(r)
                const steps = stepTitles(r)
                const isExpanded = expandedId === r.id
                return (
                  <React.Fragment key={r.id}>
                    <tr className='hover:bg-slate-50/50 transition-colors'>
                      <td className='px-8 py-4'>
                        <p className='text-xs font-black text-slate-800'>
                          {new Date(r.startTime).toLocaleDateString('zh-CN')}{' '}
                          {new Date(r.startTime).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className='text-[10px] font-mono text-slate-400 uppercase'>
                          {r.id}
                        </p>
                      </td>
                      <td className='px-4 py-4'>
                        <span className='inline-block px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[10px] font-black font-mono'>
                          {r.repairOrderNo || '-'}
                        </span>
                      </td>
                      <td className='px-4 py-4'>
                        <span className='inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black font-mono'>
                          {r.maintenanceOrderNo || '-'}
                        </span>
                      </td>
                      <td className='px-4 py-4'>
                        <span className='inline-block px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[10px] font-black font-mono'>
                          {guide?.faultCode || r.context?.faultCode || '-'}
                        </span>
                      </td>
                      <td className='px-4 py-4'>
                        <p className='text-xs font-black text-slate-800'>
                          {device?.model || guide?.deviceId || '-'}
                        </p>
                        <p className='text-[10px] font-mono text-slate-400 uppercase'>
                          {device?.sn || ''}
                        </p>
                      </td>
                      <td className='px-4 py-4'>
                        {guide ? (
                          <>
                            <span className='inline-block px-2 py-0.5 bg-slate-900 text-white rounded-md text-[10px] font-black uppercase mr-1'>
                              {guide.faultCode}
                            </span>
                            <p className='text-xs font-bold text-slate-700 mt-1'>
                              {guide.faultCategory}
                            </p>
                            <p className='text-[10px] text-slate-400 font-bold'>
                              v{guide.version} · {guide.scope}
                            </p>
                          </>
                        ) : (
                          <span className='text-xs text-slate-400'>未知 SOP</span>
                        )}
                      </td>
                      <td className='px-4 py-4'>
                        <p className='text-xs font-bold text-slate-600'>
                          {engineer?.name || '未知工程师'}
                        </p>
                      </td>
                      <td className='px-4 py-4'>
                        <span className='inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black'>
                          <Layers size={11} className='mr-1' />
                          {r.completedSteps.length} 个步骤
                        </span>
                      </td>
                      <td className='px-4 py-4'>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            r.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}>
                          {r.status === 'completed' ? '已完成' : '进行中'}
                        </span>
                      </td>
                      <td className='px-8 py-4 text-right'>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : r.id)}
                          className='inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl text-[10px] font-black transition-all active:scale-95'>
                          {isExpanded ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                          步骤明细
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className='bg-slate-50/50'>
                        <td colSpan={10} className='px-8 py-5'>
                          <div className='space-y-2'>
                            <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2'>
                              本次维修执行的操作步骤
                            </p>
                            {steps.length > 0 ? (
                              steps.map((s, i) => (
                                <div
                                  key={s.id}
                                  className='flex items-start space-x-3 bg-white border border-slate-100 rounded-2xl px-4 py-3'>
                                  <div className='w-6 h-6 shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-lg text-[10px] font-black'>
                                    {i + 1}
                                  </div>
                                  <div className='flex-1'>
                                    <div className='flex items-center space-x-2'>
                                      <span className='px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black'>
                                        {s.stage}
                                      </span>
                                      <p className='text-xs font-black text-slate-800'>
                                        {s.title}
                                      </p>
                                    </div>
                                    {s.description && (
                                      <p className='text-[10px] text-slate-400 font-medium mt-1'>
                                        {s.description}
                                      </p>
                                    )}
                                  </div>
                                  <span className='text-[9px] font-mono text-slate-300 uppercase shrink-0'>
                                    {s.id}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className='text-xs text-slate-400'>
                                该记录未关联到具体步骤
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
              {filteredRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className='px-8 py-14 text-center text-slate-400 text-sm'>
                    暂无匹配的使用记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SOPUsageRecord
