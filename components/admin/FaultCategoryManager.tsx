import React, { useState, useRef, useMemo } from 'react'
import {
  Plus,
  Trash2,
  Tag,
  RotateCcw,
  Search,
  X,
  Edit3
} from 'lucide-react'
import {
  loadFaultCategories,
  saveFaultCategories,
  notifyFaultCategoriesChanged,
  DEFAULT_FAULT_CATEGORIES
} from './faultCategories'

type ModalState = { mode: 'add' } | { mode: 'edit'; index: number } | null

const FaultCategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<string[]>(loadFaultCategories)
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

  const persist = (next: string[]) => {
    setCategories(next)
    saveFaultCategories(next)
    notifyFaultCategoriesChanged()
  }

  // 查询：按关键词过滤
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return categories
    return categories.filter((c) => c.toLowerCase().includes(kw))
  }, [categories, keyword])

  // 校验是否重复（排除当前编辑项）
  const hasDuplicate = (text: string, excludeIndex?: number) => {
    const t = text.trim()
    return categories.some(
      (c, idx) =>
        idx !== excludeIndex && c.trim().toLowerCase() === t.toLowerCase()
    )
  }

  // ============ 新增 / 编辑弹窗 ============
  const openAdd = () => {
    setDraftText('')
    setModal({ mode: 'add' })
  }
  const openEdit = (index: number) => {
    setDraftText(categories[index])
    setModal({ mode: 'edit', index })
  }

  const handleModalConfirm = () => {
    if (!modal) return
    const text = draftText.trim()
    if (!text) {
      flash('请输入分类名称')
      inputRef.current?.focus()
      return
    }
    const excludeIndex = modal.mode === 'edit' ? modal.index : undefined
    if (hasDuplicate(text, excludeIndex)) {
      flash('该分类已存在')
      return
    }
    if (modal.mode === 'add') {
      persist([...categories, text])
      flash('已新增分类')
    } else {
      persist(
        categories.map((c, idx) => (idx === modal.index ? text : c))
      )
      flash('已保存修改')
    }
    setModal(null)
  }

  // ============ 删除 ============
  const handleRemove = (index: number) => {
    if (categories.length <= 1) {
      flash('至少保留 1 个分类')
      return
    }
    if (!window.confirm(`确定删除分类「${categories[index]}」吗？`)) return
    persist(categories.filter((_, idx) => idx !== index))
    flash('已删除该分类')
  }

  const handleReset = () => {
    if (!window.confirm('确定要恢复为默认分类吗？自定义内容将丢失。')) return
    persist(DEFAULT_FAULT_CATEGORIES.map((c) => c))
    flash('已恢复默认分类')
  }

  const renderModal = () => {
    if (!modal) return null
    const isAdd = modal.mode === 'add'
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4'>
        <div className='w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden'>
          <div className='px-6 py-4 border-b border-slate-100 flex items-center justify-between'>
            <h3 className='text-sm font-black text-slate-800'>
              {isAdd ? '新增故障分类' : '编辑故障分类'}
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
                分类名称
              </label>
              <input
                ref={inputRef}
                autoFocus
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleModalConfirm()
                }}
                placeholder='请输入分类名称，如：传感器污染'
                className='w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-medium'
              />
            </div>
            <p className='text-[11px] text-slate-400 font-medium leading-relaxed'>
              该分类将用于 SOP 指南的「故障分类」选择与 PDA 报警内容的下拉选项中。
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
              <Tag size={18} />
            </div>
            <div>
              <h3 className='text-sm font-black text-slate-800'>故障分类管理</h3>
              <p className='text-[10px] font-mono text-slate-400 mt-0.5'>
                维护故障分类字典（增 / 删 / 改 / 查）
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
            分类用于 SOP 指南中标识故障类型，修改保存后同步到相关下拉选项。
          </p>
          <span className='shrink-0 text-[11px] text-blue-700 font-black whitespace-nowrap'>
            共 {categories.length} 个分类
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
              placeholder='搜索分类名称...'
              className='w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-medium'
            />
          </div>
          <div className='flex-1' />
          <button
            onClick={openAdd}
            className='flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all active:scale-95'>
            <Plus size={13} />
            <span>新增分类</span>
          </button>
        </div>

        {/* 列表 */}
        {filtered.length === 0 ? (
          <div className='py-16 text-center text-slate-300'>
            <Tag size={28} className='mx-auto mb-2' />
            <p className='text-[11px] font-bold text-slate-400'>
              {keyword ? '未找到匹配的分类' : '暂无分类，点击右上角新增'}
            </p>
          </div>
        ) : (
          <div className='divide-y divide-slate-100'>
            {filtered.map((category, idx) => {
              const realIdx = categories.findIndex((c) => c === category)
              return (
                <div
                  key={category}
                  className='flex items-center gap-3 px-6 py-3.5 bg-white transition-colors'>
                  <span className='w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0'>
                    <Tag size={14} />
                  </span>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-bold text-slate-800 truncate'>
                      {category}
                    </p>
                  </div>
                  <button
                    onClick={() => openEdit(realIdx)}
                    title='编辑'
                    className='flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95'>
                    <Edit3 size={12} />
                    <span>编辑</span>
                  </button>
                  <button
                    onClick={() => handleRemove(realIdx)}
                    title='删除'
                    className='p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90'>
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* 底部统计 */}
        {filtered.length > 0 && (
          <div className='px-6 py-3 bg-slate-50/70 border-t border-slate-100 text-[10px] font-mono text-slate-400'>
            显示 {filtered.length} / 共 {categories.length} 个分类
          </div>
        )}
      </div>

      {/* 弹窗 */}
      {renderModal()}

      {/* 轻提示 */}
      {toast && (
        <div className='fixed top-6 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2'>
          {toast}
        </div>
      )}
    </div>
  )
}

export default FaultCategoryManager
