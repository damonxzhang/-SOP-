import React, { useState, useRef, useMemo } from 'react'
import {
  Plus,
  Trash2,
  ListChecks,
  RotateCcw,
  Search,
  X,
  Edit3
} from 'lucide-react'
import {
  loadExecutionOptions,
  saveExecutionOptions,
  notifyExecutionOptionsChanged,
  DEFAULT_EXECUTION_OPTIONS,
  nextOptionId,
  ExecutionOption
} from './executionOptionsStore'

type ModalState = { mode: 'add' } | { mode: 'edit'; option: ExecutionOption } | null

const ExecutionOptions: React.FC = () => {
  const [options, setOptions] = useState<ExecutionOption[]>(loadExecutionOptions)
  const [keyword, setKeyword] = useState('')
  const [modal, setModal] = useState<ModalState>(null)
  const [draftText, setDraftText] = useState('')
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const flash = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2200)
  }

  const persist = (next: ExecutionOption[]) => {
    setOptions(next)
    saveExecutionOptions(next)
    notifyExecutionOptionsChanged()
  }

  // 查询：按关键词过滤
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return options
    return options.filter((o) => o.text.toLowerCase().includes(kw))
  }, [options, keyword])

  const enabledCount = options.filter((o) => o.enabled).length

  // 校验文本是否重复（排除当前编辑项）
  const hasDuplicate = (text: string, excludeId?: string) => {
    const t = text.trim()
    return options.some(
      (o) => o.id !== excludeId && o.text.trim().toLowerCase() === t.toLowerCase()
    )
  }

  // ============ 新增 / 编辑弹窗 ============
  const openAdd = () => {
    setDraftText('')
    setModal({ mode: 'add' })
  }
  const openEdit = (option: ExecutionOption) => {
    setDraftText(option.text)
    setModal({ mode: 'edit', option })
  }

  const handleModalConfirm = () => {
    const text = draftText.trim()
    if (!text) {
      flash('请输入选项内容')
      inputRef.current?.focus()
      return
    }
    if (hasDuplicate(text, modal?.mode === 'edit' ? modal.option.id : undefined)) {
      flash('该选项已存在')
      return
    }
    if (modal?.mode === 'add') {
      persist([...options, { id: nextOptionId(), text, enabled: true }])
      flash('已新增选项')
    } else if (modal?.mode === 'edit') {
      persist(
        options.map((o) =>
          o.id === modal.option.id ? { ...o, text } : o
        )
      )
      flash('已保存修改')
    }
    setModal(null)
  }

  // ============ 启用 / 禁用 ============
  const handleToggle = (option: ExecutionOption) => {
    if (option.enabled && enabledCount <= 1) {
      flash('至少保留 1 个启用选项')
      return
    }
    persist(
      options.map((o) =>
        o.id === option.id ? { ...o, enabled: !o.enabled } : o
      )
    )
    flash(option.enabled ? '已禁用该选项' : '已启用该选项')
  }

  const handleRemove = (option: ExecutionOption) => {
    if (options.length <= 1) {
      flash('至少保留 1 个选项')
      return
    }
    persist(options.filter((o) => o.id !== option.id))
    flash('已删除该选项')
  }

  const handleReset = () => {
    if (!window.confirm('确定要恢复为默认选项吗？自定义内容将丢失。')) return
    persist(DEFAULT_EXECUTION_OPTIONS.map((o) => ({ ...o })))
    flash('已恢复默认选项')
  }

  const renderModal = () => {
    if (!modal) return null
    const isAdd = modal.mode === 'add'
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4'>
        <div className='w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden'>
          <div className='px-6 py-4 border-b border-slate-100 flex items-center justify-between'>
            <h3 className='text-sm font-black text-slate-800'>
              {isAdd ? '新增选项' : '编辑选项'}
            </h3>
            <button
              onClick={() => setModal(null)}
              className='p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all'>
              <X size={16} />
            </button>
          </div>
          <div className='p-6 space-y-4'>
            <div className='space-y-1.5'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                选项内容
              </label>
              <input
                ref={inputRef}
                autoFocus
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleModalConfirm()
                }}
                placeholder='请输入选项内容，如：已完成维修，设备恢复正常'
                className='w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-medium'
              />
            </div>
            <p className='text-[11px] text-slate-400 font-medium leading-relaxed'>
              该内容将出现在 PDA 端提交执行记录时的「操作记录 / 执行说明」下拉框中。
            </p>
          </div>
          <div className='px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end space-x-2.5'>
            <button
              onClick={() => setModal(null)}
              className='px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black hover:bg-slate-100 transition-all active:scale-95'>
              取消
            </button>
            <button
              onClick={handleModalConfirm}
              className='px-5 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all active:scale-95'>
              保存
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* 头部卡片 */}
      <div className='bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden'>
        <div className='px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4'>
          <div className='flex items-center space-x-3'>
            <div className='p-2.5 bg-blue-50 text-blue-600 rounded-xl'>
              <ListChecks size={18} />
            </div>
            <div>
              <h3 className='text-sm font-black text-slate-800'>执行说明选项管理</h3>
              <p className='text-[10px] font-mono text-slate-400 mt-0.5'>
                配置 PDA「操作记录 / 执行说明」下拉选项
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className='flex items-center space-x-1.5 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black hover:bg-slate-200 transition-all active:scale-95'>
            <RotateCcw size={13} />
            <span>恢复默认</span>
          </button>
        </div>

        {/* 提示信息 */}
        <div className='px-6 py-3.5 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between gap-3'>
          <p className='text-[11px] text-blue-700 font-medium leading-relaxed'>
            启用中的选项会出现在 PDA 端提交执行记录时的下拉框中；禁用的选项不展示。修改保存后 PDA 端实时生效。
          </p>
          <span className='shrink-0 text-[11px] text-blue-700 font-black whitespace-nowrap'>
            启用 <span className='text-emerald-600'>{enabledCount}</span> / 共 {options.length}
          </span>
        </div>

        {/* 工具栏：查询 + 新增 */}
        <div className='px-6 py-4 border-b border-slate-100 flex items-center gap-3'>
          <div className='relative flex-1 max-w-sm'>
            <Search
              size={14}
              className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
            />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder='搜索选项内容...'
              className='w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-medium'
            />
          </div>
          <div className='flex-1' />
          <button
            onClick={openAdd}
            className='flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all active:scale-95'>
            <Plus size={13} />
            <span>新增选项</span>
          </button>
        </div>

        {/* 列表 */}
        <div className='divide-y divide-slate-100'>
          {filtered.length === 0 && (
            <p className='text-center text-xs text-slate-400 py-12 font-bold'>
              {options.length === 0
                ? '暂无选项，请点击右上角「新增选项」'
                : '未找到匹配的选项'}
            </p>
          )}
          {filtered.map((opt, idx) => {
            return (
              <div
                key={opt.id}
                className={`flex items-center gap-3 px-6 py-3.5 transition-colors ${
                  opt.enabled ? 'bg-white' : 'bg-slate-50/70'
                }`}>
                <span
                  className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-lg border text-[11px] font-black ${
                    opt.enabled
                      ? 'bg-white border-slate-200 text-slate-500'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                  {idx + 1}
                </span>

                <div className='flex-1 min-w-0'>
                  <p
                    className={`text-sm font-bold truncate ${
                      opt.enabled ? 'text-slate-800' : 'text-slate-400 line-through'
                    }`}>
                    {opt.text}
                  </p>
                  <p className='text-[10px] text-slate-300 font-mono mt-0.5'>
                    {opt.id}
                  </p>
                </div>

                {/* 状态徽标 */}
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black ${
                    opt.enabled
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                  {opt.enabled ? '已启用' : '已禁用'}
                </span>

                {/* 启用/禁用开关 */}
                <button
                  onClick={() => handleToggle(opt)}
                  title={opt.enabled ? '点击禁用' : '点击启用'}
                  className='shrink-0 relative inline-flex w-10 h-[22px] rounded-full transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={opt.enabled && enabledCount <= 1}>
                  <span
                    className={`absolute inset-0 rounded-full transition-colors ${
                      opt.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  <span
                    className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${
                      opt.enabled ? 'left-[20px]' : 'left-[2px]'
                    }`}
                  />
                </button>

                {/* 操作 */}
                <div className='flex items-center space-x-1 shrink-0'>
                  <button
                    onClick={() => openEdit(opt)}
                    title='编辑'
                    className='flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95'>
                    <Edit3 size={12} />
                    <span>编辑</span>
                  </button>
                  <button
                    onClick={() => handleRemove(opt)}
                    title='删除'
                    className='p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90'>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* 底部 */}
        <div className='px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between'>
          <span className='text-[11px] text-slate-400 font-bold'>
            当前共 <span className='text-blue-600 font-black'>{options.length}</span> 个选项，
            已启用 <span className='text-emerald-600 font-black'>{enabledCount}</span> 个
          </span>
          {toast && (
            <span className='text-[11px] text-emerald-600 font-black'>{toast}</span>
          )}
        </div>
      </div>

      {renderModal()}
    </div>
  )
}

export default ExecutionOptions
