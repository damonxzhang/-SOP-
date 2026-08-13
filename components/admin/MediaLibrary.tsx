import React from 'react'
import {
  HardDrive,
  Search,
  UploadCloud,
  FileVideo,
  FileText,
  Eye,
  Edit3,
  Trash2,
  Clock,
  Users
} from 'lucide-react'
import { MediaResource } from '../../types'

interface MediaLibraryProps {
  mediaResources: MediaResource[]
  mediaSearch: string
  setMediaSearch: (search: string) => void
  mediaTypeFilter: string
  setMediaTypeFilter: (filter: string) => void
  onViewMedia: (media: MediaResource) => void
  onEditMedia: (media: MediaResource) => void
  onDeleteMedia: (mediaId: string) => void
  onUploadMedia: () => void
  pagination: {
    page: number
    limit: number
    total: number
  }
  onPageChange: (page: number) => void
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({
  mediaResources,
  mediaSearch,
  setMediaSearch,
  mediaTypeFilter,
  setMediaTypeFilter,
  onViewMedia,
  onEditMedia,
  onDeleteMedia,
  onUploadMedia,
  pagination,
  onPageChange
}) => {
  const filteredMedia = mediaResources.filter((media) => {
    const matchSearch =
      media.name.toLowerCase().includes(mediaSearch.toLowerCase()) ||
      media.tags.some((tag) =>
        tag.toLowerCase().includes(mediaSearch.toLowerCase())
      )
    const matchType =
      mediaTypeFilter === 'all' || media.type === mediaTypeFilter
    return matchSearch && matchType
  })

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6'>
        <div className='flex items-center space-x-5'>
          <div className='p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl shadow-indigo-100 rotate-1'>
            <HardDrive size={28} />
          </div>
          <div>
            <h2 className='text-2xl font-black text-slate-900 tracking-tight'>
              多媒体数字化资料库
            </h2>
            <p className='text-sm text-slate-500'>
              统一管理维保过程中的图片、视频及技术文档，支持标签化检索与快速预览
            </p>
          </div>
        </div>
        <button
          onClick={onUploadMedia}
          className='px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center shadow-2xl hover:bg-indigo-600 transition-all active:scale-95'>
          <UploadCloud size={20} className='mr-2' /> 上传多媒体资料
        </button>
      </div>

      <div className='bg-white px-8 py-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-wrap items-center gap-4'>
        <div className='flex bg-slate-100 p-1 rounded-xl'>
          {[
            { id: 'all', label: '全部' },
            { id: 'image', label: '图片' },
            { id: 'video', label: '视频' },
            { id: 'pdf', label: '文档' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setMediaTypeFilter(type.id)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                mediaTypeFilter === type.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}>
              {type.label}
            </button>
          ))}
        </div>
        <div className='flex-1 relative min-w-[200px]'>
          <Search
            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-300'
            size={16}
          />
          <input
            placeholder='搜索文件名或标签...'
            value={mediaSearch}
            onChange={(e) => setMediaSearch(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {filteredMedia.map((media) => (
          <div
            key={media.id}
            className='bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all flex flex-col'>
            <div className='aspect-video bg-slate-50 relative flex items-center justify-center overflow-hidden'>
              {media.type === 'image' && (
                <img
                  src={media.url}
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                  alt={media.name}
                />
              )}
              {media.type === 'video' && (
                <FileVideo
                  size={48}
                  className='text-slate-200 group-hover:text-indigo-200 transition-colors'
                />
              )}
              {media.type === 'pdf' && (
                <FileText
                  size={48}
                  className='text-slate-200 group-hover:text-rose-200 transition-colors'
                />
              )}
              <div className='absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2'>
                <button
                  onClick={() => onViewMedia(media)}
                  className='p-2.5 bg-white text-slate-900 rounded-xl hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300'>
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => onEditMedia(media)}
                  className='p-2.5 bg-white text-slate-900 rounded-xl hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75'>
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => onDeleteMedia(media.id)}
                  className='p-2.5 bg-white text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-150'>
                  <Trash2 size={18} />
                </button>
              </div>
              <div className='absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur shadow-sm rounded-lg text-[8px] font-black uppercase text-slate-500'>
                {media.size}
              </div>
            </div>
            <div className='p-5 flex-1 flex flex-col space-y-3'>
              <h3 className='text-sm font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors'>
                {media.name}
              </h3>
              {media.description && (
                <p className='text-[10px] text-slate-500 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100'>
                  备注: {media.description}
                </p>
              )}
              <div className='flex flex-wrap gap-1.5'>
                {media.tags.map((tag) => (
                  <span
                    key={tag}
                    className='px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[8px] font-black uppercase border border-slate-100'>
                    {tag}
                  </span>
                ))}
              </div>
              <div className='pt-3 border-t border-slate-50 flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter'>
                <span className='flex items-center'>
                  <Clock size={10} className='mr-1' /> {media.uploadTime}
                </span>
                <span className='flex items-center'>
                  <Users size={10} className='mr-1' /> {media.uploader}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filteredMedia.length === 0 && (
          <div className='col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 text-slate-300'>
            <HardDrive size={48} className='mb-4 opacity-20' />
            <p className='text-sm font-black uppercase tracking-widest'>
              未找到匹配的资料
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
  )
}

export default MediaLibrary
