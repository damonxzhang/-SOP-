
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, Plus, LayoutDashboard, History, 
  Search, X, CheckCircle2, CheckCircle, XCircle, Layers, Trash2, Edit3, Save, Check,
  Mail, ShieldAlert, Users, HardDrive, Database, User as UserIcon,
  ShieldCheck, Eye, Clock, AlertTriangle, TrendingUp, BarChart3, Target, PieChart, UploadCloud, FileText,
  Activity, FileVideo, FileImage, FileDown, ChevronRight, Download, Filter, BadgeCheck, Zap, Info, Shield,
  Cpu, Settings, UserPlus, UserMinus, UserCheck, Lock, Unlock, Send, Bell, MailCheck, ExternalLink, RefreshCcw,
  AlertCircle, Tag, RotateCcw, MessageSquare, MessageCircleCode, Camera, Calendar
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, Cell
} from 'recharts';
import { MOCK_DEVICES, MOCK_GUIDES, ALL_USERS, MOCK_INQUIRIES, MOCK_MEDIA_RESOURCES, MOCK_USER } from '../../constants';
import { MaintenanceGuide, GuideStep, ProcessStage, User, Role, PermissionLevel, StepInquiry, MediaResource } from '../../types';

const STAGES: ProcessStage[] = ['准备阶段', '诊断阶段', '维修实施', '测试验证', '完工收尾'];
const DEPARTMENTS = ['光学系统部', '制造二部', '运维管理处', '第三方维保', '工艺控制部'];

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('统计看板');
  const [guides, setGuides] = useState<MaintenanceGuide[]>(MOCK_GUIDES);
  const [users, setUsers] = useState<User[]>(ALL_USERS);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await fetch('http://212.64.29.230:8080/backend/sop/list');
        const result = await response.json();
        if (result.code === 200 && Array.isArray(result.data)) {
          // 映射后端返回的角色字符串为前端的 Role 枚举值
          const mappedUsers = result.data.map((u: any) => ({
            ...u,
            role: u.role === 'Role.ADMIN' ? Role.ADMIN : 
                  u.role === 'Role.SENIOR_ENGINEER' ? Role.SENIOR_ENGINEER : 
                  u.role === 'Role.OUTSOURCED_ENGINEER' ? Role.OUTSOURCED_ENGINEER : 
                  Role.JUNIOR_ENGINEER
          }));
          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error('Failed to fetch user list:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);
  const [inquiries, setInquiries] = useState<StepInquiry[]>(MOCK_INQUIRIES);
  const [mediaResources, setMediaResources] = useState<MediaResource[]>(MOCK_MEDIA_RESOURCES);
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');
  
  const [editingGuide, setEditingGuide] = useState<MaintenanceGuide | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingInquiry, setViewingInquiry] = useState<StepInquiry | null>(null);
  const [viewingMedia, setViewingMedia] = useState<MediaResource | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaResource | null>(null);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [mediaSelectionSearch, setMediaSelectionSearch] = useState('');
  const [selectingMediaForStep, setSelectingMediaForStep] = useState<{
    stepIndex: number;
    type: 'image' | 'video' | 'pdf' | 'doc';
  } | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState<Partial<MediaResource> | null>(null);
  const [newTag, setNewTag] = useState('');

  // SOP 库筛选状态
  const [guideSearch, setGuideSearch] = useState('');
  const [guideDeviceFilter, setGuideDeviceFilter] = useState('all');
  const [guideCategoryFilter, setGuideCategoryFilter] = useState('all');

  // 现场提问记录筛选状态
  const [inquiryFaultCodeFilter, setInquiryFaultCodeFilter] = useState('');

  const uniqueCategories = useMemo(() => {
    const categories = guides.map(g => g.faultCategory);
    return Array.from(new Set(categories));
  }, [guides]);

  const filteredGuidesList = useMemo(() => {
    return guides.filter(g => {
      const searchLower = guideSearch.toLowerCase();
      const matchSearch = g.faultCode.toLowerCase().includes(searchLower) || 
                          g.faultCategory.toLowerCase().includes(searchLower);
      const matchDevice = guideDeviceFilter === 'all' || g.deviceId === guideDeviceFilter;
      const matchCategory = guideCategoryFilter === 'all' || g.faultCategory === guideCategoryFilter;
      return matchSearch && matchDevice && matchCategory;
    });
  }, [guides, guideSearch, guideDeviceFilter, guideCategoryFilter]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      if (!inquiryFaultCodeFilter) return true;
      const guide = MOCK_GUIDES.find(g => g.id === inq.guideId);
      const faultCode = inq.isNewIssue ? (inq.context?.faultCode || '') : (guide?.faultCode || inq.context?.faultCode || '');
      return faultCode.toLowerCase().includes(inquiryFaultCodeFilter.toLowerCase());
    });
  }, [inquiries, inquiryFaultCodeFilter]);

  // 移除“故障概率建模”，保留其他模块
  const navItems = [
    { id: '统计看板', icon: <LayoutDashboard size={18} />, label: '统计看板' },
    { id: '标准 SOP 库', icon: <BookOpen size={18} />, label: '标准 SOP 库' },
    { id: '现场提问记录', icon: <MessageSquare size={18} />, label: '现场提问记录' },
    { id: '多媒体资料库', icon: <HardDrive size={18} />, label: '多媒体资料库' },
    { id: '用户权限管理', icon: <Users size={18} />, label: '用户权限管理' },
    { id: '个人信息', icon: <UserIcon size={18} />, label: '个人信息' },
  ];

  const handleSaveGuide = (data: MaintenanceGuide) => {
    setGuides(prev => {
      const exists = prev.find(g => g.id === data.id);
      if (exists) return prev.map(g => g.id === data.id ? data : g);
      return [data, ...prev];
    });
    setEditingGuide(null);
  };

  const handleSaveUser = (data: User) => {
    setUsers(prev => prev.map(u => u.id === data.id ? data : u));
    setEditingUser(null);
  };

  const handleToggleGuideStatus = (guideId: string) => {
    setGuides(prev => prev.map(g => 
      g.id === guideId ? { ...g, published: !g.published } : g
    ));
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl shadow-blue-100 rotate-1">
            <UserIcon size={28}/>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">个人中心</h2>
            <p className="text-sm text-slate-500">管理您的账户信息、安全设置与偏好配置</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-6">
              <img src={MOCK_USER.avatar} className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-2xl bg-slate-100" alt="" />
              <button className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform active:scale-95">
                <Camera size={20} />
              </button>
            </div>
            <h3 className="text-xl font-black text-slate-900">{MOCK_USER.name}</h3>
            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-1">系统管理员</p>
            <div className="w-full h-px bg-slate-100 my-6" />
            <div className="w-full space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">员工工号</span>
                <span className="text-xs font-bold text-slate-700 font-mono">{MOCK_USER.employeeId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">所属部门</span>
                <span className="text-xs font-bold text-slate-700">{MOCK_USER.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">入职时间</span>
                <span className="text-xs font-bold text-slate-700">2023-05-15</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
            <h4 className="text-sm font-black text-slate-800 mb-6 flex items-center">
              <Shield size={18} className="mr-2 text-emerald-500" /> 安全设置
            </h4>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors group">
                <div className="flex items-center">
                  <Lock size={16} className="mr-3 text-slate-400 group-hover:text-blue-600" />
                  <span className="text-xs font-bold text-slate-600">修改登录密码</span>
                </div>
                <ChevronRight size={14} className="text-slate-300" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors group">
                <div className="flex items-center">
                  <ShieldCheck size={16} className="mr-3 text-slate-400 group-hover:text-blue-600" />
                  <span className="text-xs font-bold text-slate-600">两步身份验证</span>
                </div>
                <span className="text-[10px] font-black text-emerald-500 uppercase">已开启</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-black text-slate-800 flex items-center">
                <Settings size={18} className="mr-2 text-blue-500" /> 基本信息编辑
              </h4>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">保存变更</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">电子邮箱</label>
                <input type="email" defaultValue="admin@nxp.com" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">联系电话</label>
                <input type="tel" defaultValue="+86 138-0000-0000" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">个人简介</label>
                <textarea rows={4} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner resize-none" defaultValue="负责系统全局维护与 SOP 标准化流程制定，拥有 10 年以上半导体设备维保经验。" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
            <h4 className="text-sm font-black text-slate-800 mb-6 flex items-center">
              <Activity size={18} className="mr-2 text-rose-500" /> 最近操作动态
            </h4>
            <div className="space-y-6">
              {[
                { action: '审核通过了 SOP 规程', target: 'NXT:2050i 激光校准 SOP', time: '2小时前', icon: <CheckCircle2 className="text-emerald-500"/> },
                { action: '修改了工程师权限', target: '王技术员 (Role: Senior)', time: '5小时前', icon: <Users className="text-blue-500"/> },
                { action: '删除了过期多媒体资料', target: 'OLD_GUIDE_V1.PDF', time: '昨天 14:20', icon: <Trash2 className="text-rose-500"/> },
              ].map((log, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">{log.icon}</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700">
                      {log.action} <span className="text-blue-600">"{log.target}"</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: '平均修复时间 (MTTR)', value: '3.4h', trend: '-12%', icon: <Clock className="text-blue-600"/>, color: 'bg-blue-50' },
          { label: 'SOP 依同率', value: '98.2%', trend: '+2.1%', icon: <BadgeCheck className="text-emerald-600"/>, color: 'bg-emerald-50' },
          { label: '未处理提问', value: inquiries.filter(i => i.status === 'pending').length.toString(), trend: 'High', icon: <MessageCircleCode className="text-amber-600"/>, color: 'bg-amber-50' },
          { label: '高危操作占比', value: '14%', trend: '-3%', icon: <AlertTriangle className="text-rose-600"/>, color: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>{stat.icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-2xl font-black text-slate-900">{stat.value}</h4>
              <span className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm h-80 flex items-center justify-center text-slate-300">
           <p className="text-xs font-black uppercase tracking-widest flex flex-col items-center">
             <BarChart3 size={48} className="mb-4 opacity-10" />
             故障趋势分布加载中...
           </p>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm h-80 flex items-center justify-center text-slate-300">
           <p className="text-xs font-black uppercase tracking-widest flex flex-col items-center">
             <TrendingUp size={48} className="mb-4 opacity-10" />
             MTTR 预测模型加载中...
           </p>
        </div>
      </div>
    </div>
  );

  const renderInquiries = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
             <div className="p-4 bg-amber-500 text-white rounded-[1.5rem] shadow-2xl shadow-amber-100 rotate-1"><MessageSquare size={28}/></div>
             <div><h2 className="text-2xl font-black text-slate-900 tracking-tight">现场提问记录库</h2><p className="text-sm text-slate-500">实时记录工程师在一线维保过程中的疑问与现场物证，快速响应专家闭环</p></div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black border border-blue-100 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center">
                   <BarChart3 size={14} className="mr-2"/> 时序分析
                </button>
                <button className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-[10px] font-black border border-purple-100 uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all flex items-center">
                   <Activity size={14} className="mr-2"/> 离散分析
                </button>
                <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black border border-emerald-100 uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center">
                   <TrendingUp size={14} className="mr-2"/> 正态分布分析
                </button>
             </div>
             <div className="h-8 w-px bg-slate-100 hidden md:block" />
             <div className="flex items-center space-x-3">
                <span className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black border border-amber-100 uppercase tracking-widest">待处理: {inquiries.filter(i => i.status === 'pending').length}</span>
             </div>
          </div>
       </div>

       {/* 筛选区域 */}
       <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
                type="text" 
                placeholder="搜索报警代码..." 
                value={inquiryFaultCodeFilter}
                onChange={(e) => setInquiryFaultCodeFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 transition-all"
             />
          </div>
       </div>

       <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                   <tr>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">提问者 / 时间</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">关联机台 & SOP</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">报警代码</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">问题类型</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">提问内容摘要</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">状态</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">操作</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {filteredInquiries.map(inq => {
                      const engineer = ALL_USERS.find(u => u.id === inq.engineerId);
                      const device = MOCK_DEVICES.find(d => d.id === inq.deviceId);
                      const guide = MOCK_GUIDES.find(g => g.id === inq.guideId);
                      return (
                         <tr key={inq.id} className="hover:bg-amber-50/20 transition-colors group">
                            <td className="px-8 py-6">
                               <div className="flex items-center space-x-3">
                                  <img src={engineer?.avatar} className="w-8 h-8 rounded-lg" alt=""/>
                                  <div>
                                     <p className="text-xs font-bold text-slate-900">{engineer?.name}</p>
                                     <p className="text-[9px] text-slate-400 font-mono">
                                       {inq.createdAt && !isNaN(Date.parse(inq.createdAt)) 
                                          ? new Date(inq.createdAt).toLocaleString() 
                                          : '时间未录入'}
                                    </p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-4 py-6">
                              <div className="flex flex-col">
                                 <span className="text-xs font-black text-slate-700">{device?.model || '未知机台'}</span>
                                 <span className="text-[10px] text-blue-600 font-bold uppercase">
                                    {guide?.faultCode || 'N/A'} - {inq.stepId !== 'unknown' ? `Step ${inq.stepId}` : '非步骤相关'}
                                 </span>
                              </div>
                           </td>
                           <td className="px-4 py-6">
                              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black font-mono">
                                 {inq.isNewIssue ? (inq.context?.faultCode || 'N/A') : (guide?.faultCode || inq.context?.faultCode || 'N/A')}
                              </span>
                           </td>
                           <td className="px-4 py-6">
                              <div className="flex flex-col">
                                 {inq.isNewIssue ? (
                                    <span className="flex items-center text-rose-600">
                                       <AlertCircle size={12} className="mr-1" />
                                       <span className="text-[10px] font-black uppercase">新发现问题</span>
                                    </span>
                                 ) : (
                                    <div className="flex flex-col">
                                       <span className="flex items-center text-blue-600">
                                          <RotateCcw size={12} className="mr-1" />
                                          <span className="text-[10px] font-black uppercase">已有步骤疑问</span>
                                       </span>
                                       <span className="text-[9px] text-slate-400 font-bold mt-1 italic">
                                          {inq.context?.faultCode || '无代码'} / {inq.context?.stepTitle || '无标题'}
                                       </span>
                                    </div>
                                 )}
                              </div>
                           </td>
                            <td className="px-4 py-6">
                               <p className="text-xs text-slate-600 line-clamp-1 italic">"{inq.question}"</p>
                            </td>
                            <td className="px-4 py-6">
                               <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${inq.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                  {inq.status === 'pending' ? '待处理' : '已处理'}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <button onClick={() => setViewingInquiry(inq)} className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm active:scale-90"><Eye size={16}/></button>
                            </td>
                         </tr>
                      );
                   })}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
             <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl shadow-indigo-100 rotate-1"><Users size={28}/></div>
             <div><h2 className="text-2xl font-black text-slate-900 tracking-tight">工程师权限矩阵</h2><p className="text-sm text-slate-500">基于角色的访问控制 (RBAC)，定义资产操作红线与管理颗粒度</p></div>
          </div>
          <button className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center shadow-2xl hover:bg-indigo-600 transition-all active:scale-95"><UserPlus size={20} className="mr-2" /> 邀请新工程师</button>
       </div>

       <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex space-x-3">
               <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black border border-slate-100 uppercase tracking-widest">活跃账户: {users.filter(u => u.status === 'active').length}</span>
               <span className="px-4 py-1.5 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black border border-rose-100 uppercase tracking-widest">已停用: {users.filter(u => u.status === 'disabled').length}</span>
             </div>
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
               <input placeholder="输入姓名或工号快速搜索..." className="pl-10 pr-10 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-inner"/>
               {isLoadingUsers && <RefreshCcw className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={14}/>}
             </div>
          </div>
          <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead className="bg-slate-50/50"><tr><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">工程师基本面</th><th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">角色等级</th><th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">最后登录</th><th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">状态</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">管理操作</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map(u => (<tr key={u.id} className="hover:bg-slate-50/50 transition-colors group"><td className="px-8 py-6"><div className="flex items-center space-x-3"><img src={u.avatar} className="w-10 h-10 rounded-xl bg-slate-100" alt=""/><div><p className="text-sm font-black text-slate-900">{u.name}</p><p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{u.employeeId}</p></div></div></td><td className="px-4 py-6"><span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${u.role === Role.ADMIN ? 'bg-rose-50 text-rose-600' : u.role === Role.SENIOR_ENGINEER ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{u.role.replace('_', ' ')}</span></td><td className="px-4 py-6 text-[10px] text-slate-500 font-mono">{u.lastLogin || '--'}</td><td className="px-4 py-6">{u.status === 'active' ? <span className="text-emerald-600 flex items-center text-[10px] font-black uppercase"><UserCheck size={12} className="mr-1"/> 正常</span> : <span className="text-slate-400 flex items-center text-[10px] font-black uppercase"><UserMinus size={12} className="mr-1"/> 已冻结</span>}</td><td className="px-8 py-6 text-right space-x-2"><button onClick={() => setEditingUser(u)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm active:scale-90"><Settings size={16}/></button></td></tr>))}</tbody></table></div>
       </div>
    </div>
  );

  const renderMediaLibrary = () => {
    const filteredMedia = mediaResources.filter(media => {
      const matchSearch = media.name.toLowerCase().includes(mediaSearch.toLowerCase()) ||
                          media.tags.some(tag => tag.toLowerCase().includes(mediaSearch.toLowerCase()));
      const matchType = mediaTypeFilter === 'all' || media.type === mediaTypeFilter;
      return matchSearch && matchType;
    });

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl shadow-indigo-100 rotate-1">
              <HardDrive size={28}/>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">多媒体数字化资料库</h2>
              <p className="text-sm text-slate-500">统一管理维保过程中的图片、视频及技术文档，支持标签化检索与快速预览</p>
            </div>
          </div>
          <button 
            onClick={() => setUploadingMedia({ name: '', tags: [], type: 'image' })}
            className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center shadow-2xl hover:bg-indigo-600 transition-all active:scale-95"
          >
            <UploadCloud size={20} className="mr-2" /> 上传多媒体资料
          </button>
        </div>

        <div className="bg-white px-8 py-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', label: '全部' },
              { id: 'image', label: '图片' },
              { id: 'video', label: '视频' },
              { id: 'pdf', label: '文档' },
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setMediaTypeFilter(type.id)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  mediaTypeFilter === type.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
            <input 
              placeholder="搜索文件名或标签..." 
              value={mediaSearch}
              onChange={(e) => setMediaSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedia.map(media => (
            <div key={media.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all flex flex-col">
              <div className="aspect-video bg-slate-50 relative flex items-center justify-center overflow-hidden">
                {media.type === 'image' && <img src={media.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={media.name} />}
                {media.type === 'video' && <FileVideo size={48} className="text-slate-200 group-hover:text-indigo-200 transition-colors" />}
                {media.type === 'pdf' && <FileText size={48} className="text-slate-200 group-hover:text-rose-200 transition-colors" />}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button 
                    onClick={() => setViewingMedia(media)}
                    className="p-2.5 bg-white text-slate-900 rounded-xl hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                  >
                    <Eye size={18}/>
                  </button>
                  <button 
                    onClick={() => setEditingMedia(media)}
                    className="p-2.5 bg-white text-slate-900 rounded-xl hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                  >
                    <Edit3 size={18}/>
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm('确定要删除这项资料吗？')) {
                        setMediaResources(prev => prev.filter(m => m.id !== media.id));
                      }
                    }}
                    className="p-2.5 bg-white text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-150"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur shadow-sm rounded-lg text-[8px] font-black uppercase text-slate-500">{media.size}</div>
              </div>
              <div className="p-5 flex-1 flex flex-col space-y-3">
                <h3 className="text-sm font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{media.name}</h3>
                {media.description && (
                  <p className="text-[10px] text-slate-500 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                    备注: {media.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {media.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[8px] font-black uppercase border border-slate-100">{tag}</span>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  <span className="flex items-center"><Clock size={10} className="mr-1"/> {media.uploadTime}</span>
                  <span className="flex items-center"><Users size={10} className="mr-1"/> {media.uploader}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredMedia.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 text-slate-300">
              <HardDrive size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-black uppercase tracking-widest">未找到匹配的资料</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMediaSelectionModal = () => {
    if (!selectingMediaForStep || !editingGuide) return null;

    const filteredResources = mediaResources.filter(r => {
      // 首先根据类型过滤
      let typeMatch = true;
      if (selectingMediaForStep.type === 'image') typeMatch = r.type === 'image';
      else if (selectingMediaForStep.type === 'video') typeMatch = r.type === 'video';
      else if (selectingMediaForStep.type === 'pdf') typeMatch = r.type === 'pdf' || r.type === 'doc';

      // 然后根据搜索词过滤（匹配名称或标签）
      const searchLower = mediaSelectionSearch.toLowerCase();
      const searchMatch = !mediaSelectionSearch || 
        r.name.toLowerCase().includes(searchLower) || 
        r.tags.some(tag => tag.toLowerCase().includes(searchLower));

      return typeMatch && searchMatch;
    });

    const handleToggleSelect = (id: string) => {
      setSelectedMediaIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    };

    const handleConfirmSelection = () => {
      if (!selectingMediaForStep || !editingGuide) return;
      
      const selectedResources = mediaResources.filter(r => selectedMediaIds.includes(r.id));
      const urls = selectedResources.map(r => r.url);
      
      const newSteps = [...editingGuide.steps];
      const idx = selectingMediaForStep.stepIndex;
      const type = selectingMediaForStep.type;
      
      if (type === 'image') {
        newSteps[idx].imageUrls = [...(newSteps[idx].imageUrls || []), ...urls];
        // 保持单字段兼容
        if (!newSteps[idx].imageUrl && urls.length > 0) newSteps[idx].imageUrl = urls[0];
      } else if (type === 'video') {
        newSteps[idx].videoUrls = [...(newSteps[idx].videoUrls || []), ...urls];
        if (!newSteps[idx].videoUrl && urls.length > 0) newSteps[idx].videoUrl = urls[0];
      } else if (type === 'pdf') {
        newSteps[idx].pdfUrls = [...(newSteps[idx].pdfUrls || []), ...urls];
        if (!newSteps[idx].pdfUrl && urls.length > 0) newSteps[idx].pdfUrl = urls[0];
      }
      
      setEditingGuide({ ...editingGuide, steps: newSteps });
      setSelectingMediaForStep(null);
      setSelectedMediaIds([]);
      setMediaSelectionSearch('');
    };

    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in">
        <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
          <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3">
                <Database size={28}/>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">从数字化资源库选择</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  正在为第 {selectingMediaForStep.stepIndex + 1} 步选择 {selectingMediaForStep.type === 'image' ? '图片' : selectingMediaForStep.type === 'video' ? '视频' : '文档'} (支持多选)
                </p>
              </div>
            </div>
            
            <div className="flex-1 max-w-xs mx-8 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text"
                placeholder="搜索资源名称或标签..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={mediaSelectionSearch}
                onChange={(e) => setMediaSelectionSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-4">
               {selectedMediaIds.length > 0 && (
                 <button 
                   onClick={handleConfirmSelection}
                   className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                 >
                   确认选择 ({selectedMediaIds.length})
                 </button>
               )}
               <button onClick={() => { setSelectingMediaForStep(null); setSelectedMediaIds([]); setMediaSelectionSearch(''); }} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24}/></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filteredResources.map(resource => {
                  const isSelected = selectedMediaIds.includes(resource.id);
                  return (
                    <div 
                      key={resource.id} 
                      onClick={() => handleToggleSelect(resource.id)}
                      className={`bg-white p-4 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md' : 'border-slate-200 shadow-sm hover:border-indigo-300'}`}
                    >
                      <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-4 flex items-center justify-center relative">
                        {resource.type === 'image' ? (
                          <img src={resource.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        ) : resource.type === 'video' ? (
                          <FileVideo size={32} className="text-slate-300" />
                        ) : (
                          <FileText size={32} className="text-slate-300" />
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-slate-800 truncate mb-1">{resource.name}</h4>
                      {resource.description && (
                        <p className="text-[9px] text-slate-400 line-clamp-1 italic mb-2">备注: {resource.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{resource.size}</span>
                        <div className="flex gap-1">
                          {resource.tags.slice(0, 1).map(t => (
                            <span key={t} className="text-[8px] px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded-md border border-slate-100">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-black uppercase tracking-widest">资源库中暂无匹配的资料</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMediaViewModal = () => {
    if (!viewingMedia) return null;

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in">
        <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
          <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3">
                {viewingMedia.type === 'image' && <FileImage size={28}/>}
                {viewingMedia.type === 'video' && <FileVideo size={28}/>}
                {(viewingMedia.type === 'pdf' || viewingMedia.type === 'doc') && <FileText size={28}/>}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{viewingMedia.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {viewingMedia.type.toUpperCase()} · {viewingMedia.size} · {viewingMedia.uploadTime} 上传
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-3 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all"><Download size={20}/></button>
              <button onClick={() => setViewingMedia(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24}/></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center p-10">
            {viewingMedia.type === 'image' && (
              <img src={viewingMedia.url} className="max-w-full max-h-full rounded-3xl shadow-2xl object-contain" alt={viewingMedia.name} />
            )}
            {viewingMedia.type === 'video' && (
              <div className="w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center relative">
                <FileVideo size={80} className="text-white/20" />
                <p className="absolute bottom-10 text-white/40 text-xs font-mono">VIDEO_STREAM_PREVIEW_MOCK</p>
              </div>
            )}
            {(viewingMedia.type === 'pdf' || viewingMedia.type === 'doc') && (
              <div className="w-full max-w-3xl aspect-[1/1.4] bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center justify-center space-y-6">
                <FileText size={120} className="text-indigo-100" />
                <div className="text-center">
                  <h4 className="text-lg font-black text-slate-800 mb-2">文档预览准备就绪</h4>
                  <p className="text-sm text-slate-400">点击上方下载按钮可获取完整文档，或在正式环境中集成 PDF.js 查看器</p>
                </div>
              </div>
            )}
          </div>

          <div className="px-10 py-6 border-t border-slate-100 bg-white flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {viewingMedia.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase border border-slate-100">{tag}</span>
              ))}
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
              <Users size={14} className="mr-2"/> 上传者: {viewingMedia.uploader}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMediaEditModal = () => {
    if (!editingMedia) return null;

    const handleUpdateMedia = () => {
      setMediaResources(prev => prev.map(m => m.id === editingMedia.id ? editingMedia : m));
      setEditingMedia(null);
    };

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in">
        <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
          <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3">
                <Edit3 size={28}/>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">编辑资料信息</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">资料 ID: {editingMedia.id}</p>
              </div>
            </div>
            <button onClick={() => setEditingMedia(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24}/></button>
          </div>

          <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">文件名称</label>
                <input 
                  type="text"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-inner"
                  value={editingMedia.name}
                  onChange={(e) => setEditingMedia({ ...editingMedia, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">资料类型</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-inner"
                  value={editingMedia.type}
                  onChange={(e) => setEditingMedia({ ...editingMedia, type: e.target.value as any })}
                >
                  <option value="image">图片材料</option>
                  <option value="video">视频教学</option>
                  <option value="pdf">PDF 规程文档</option>
                  <option value="doc">Word/Excel 资料</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">文件说明</label>
                <textarea 
                  placeholder="请输入文件详细说明..."
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-inner min-h-[100px] resize-none"
                  value={editingMedia.description || ''}
                  onChange={(e) => setEditingMedia({ ...editingMedia, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">标签管理 (按回车添加)</label>
                <div className="space-y-3">
                  <input 
                    type="text"
                    placeholder="添加新标签..."
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-inner"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTag.trim()) {
                        setEditingMedia({
                          ...editingMedia,
                          tags: [...editingMedia.tags, newTag.trim()]
                        });
                        setNewTag('');
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {editingMedia.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black flex items-center border border-amber-100 animate-in zoom-in-95">
                        {tag}
                        <button 
                          onClick={() => setEditingMedia({
                            ...editingMedia,
                            tags: editingMedia.tags.filter(t => t !== tag)
                          })} 
                          className="ml-2 hover:text-rose-500 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-10 py-8 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
            <button 
              onClick={() => setEditingMedia(null)}
              className="px-8 py-3 text-slate-500 font-black text-sm hover:text-slate-800 transition-colors mr-4"
            >
              取消
            </button>
            <button 
              onClick={handleUpdateMedia}
              disabled={!editingMedia.name}
              className={`px-12 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center ${
                editingMedia.name ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save size={18} className="mr-2" /> 保存变更
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderUploadModal = () => {
    if (!uploadingMedia) return null;

    const handleAddTag = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && newTag.trim()) {
        setUploadingMedia({
          ...uploadingMedia,
          tags: [...(uploadingMedia.tags || []), newTag.trim()]
        });
        setNewTag('');
      }
    };

    const handleRemoveTag = (tagToRemove: string) => {
      setUploadingMedia({
        ...uploadingMedia,
        tags: (uploadingMedia.tags || []).filter(t => t !== tagToRemove)
      });
    };

    const handleSaveMedia = () => {
      if (!uploadingMedia.name) return;
      
      const newMediaResource: MediaResource = {
        id: `m${Date.now()}`,
        name: uploadingMedia.name,
        type: uploadingMedia.type || 'image',
        url: '#', // In a real app, this would be the uploaded file URL
        size: '1.2 MB', // Mock size
        tags: uploadingMedia.tags || [],
        description: uploadingMedia.description,
        uploadTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        uploader: '管理员'
      };

      setMediaResources([newMediaResource, ...mediaResources]);
      setUploadingMedia(null);
    };

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in">
        <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
          <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3">
                <UploadCloud size={28}/>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">上传多媒体数字化资料</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">支持图片、视频、PDF 及常用办公文档</p>
              </div>
            </div>
            <button onClick={() => setUploadingMedia(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24}/></button>
          </div>

          <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">文件名称</label>
                <input 
                  type="text"
                  placeholder="请输入资料名称 (例如: NXT:2050i 维护手册)"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
                  value={uploadingMedia.name}
                  onChange={(e) => setUploadingMedia({ ...uploadingMedia, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">资料类型</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
                    value={uploadingMedia.type}
                    onChange={(e) => setUploadingMedia({ ...uploadingMedia, type: e.target.value as any })}
                  >
                    <option value="image">图片材料</option>
                    <option value="video">视频教学</option>
                    <option value="pdf">PDF 规程文档</option>
                    <option value="doc">Word/Excel 资料</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">上传文件</label>
                  <div className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                    <Plus size={16} className="mr-2 group-hover:scale-125 transition-transform" />
                    <span className="text-[10px] font-black uppercase">选择本地文件</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">文件说明</label>
                <textarea 
                  placeholder="请输入文件详细说明..."
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner min-h-[100px] resize-none"
                  value={uploadingMedia.description || ''}
                  onChange={(e) => setUploadingMedia({ ...uploadingMedia, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">添加检索标签</label>
                <div className="space-y-3">
                  <input 
                    type="text"
                    placeholder="输入标签按回车添加..."
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  <div className="flex flex-wrap gap-2">
                    {uploadingMedia.tags?.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black flex items-center border border-indigo-100 animate-in zoom-in-95">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-2 hover:text-rose-500 transition-colors">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    {(!uploadingMedia.tags || uploadingMedia.tags.length === 0) && (
                      <span className="text-[10px] text-slate-300 italic">暂无标签...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-10 py-8 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
            <button 
              onClick={() => setUploadingMedia(null)}
              className="px-8 py-3 text-slate-500 font-black text-sm hover:text-slate-800 transition-colors mr-4"
            >
              取消
            </button>
            <button 
              onClick={handleSaveMedia}
              disabled={!uploadingMedia.name}
              className={`px-12 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center ${
                uploadingMedia.name ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save size={18} className="mr-2" /> 确认上传并发布
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-row min-h-[calc(100vh-160px)] pb-20">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
      <aside className="w-64 shrink-0 border-r border-slate-100 pr-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm sticky top-24 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>{item.icon}<span>{item.label}</span></button>
          ))}
        </div>
      </aside>

      <div className="flex-1 pl-8 space-y-6">
        {activeTab === '统计看板' && renderDashboard()}
        {activeTab === '标准 SOP 库' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-5"><div className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl shadow-blue-100 rotate-1"><BookOpen size={28}/></div><div><h2 className="text-2xl font-black text-slate-900 tracking-tight">企业级标准 SOP 库</h2><p className="text-sm text-slate-500">知识资产数字化管理，沉淀专家经验，驱动作业标准化</p></div></div>
                <button onClick={() => setEditingGuide({ id: `g${Date.now()}`, deviceId: 'd1', faultCode: 'CODE-' + Math.floor(1000 + Math.random() * 9000), faultCategory: '新故障分类', operationType: '预防性维护', scope: '全系统', faultPhenomenon: '', version: '1.0.0', steps: [], published: false, totalOccurrenceCount: 0 })} className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center shadow-2xl hover:bg-blue-600 transition-all active:scale-95"><Plus size={20} className="mr-2" /> 新增规程手册</button>
             </div>
             <div className="bg-white px-8 py-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
                <div className="relative group"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"><Cpu size={14} /></div><select value={guideDeviceFilter} onChange={(e) => setGuideDeviceFilter(e.target.value)} className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none shadow-inner"><option value="all">所有机台型号</option>{MOCK_DEVICES.map(d => <option key={d.id} value={d.id}>{d.model}</option>)}</select></div>
                <div className="flex-1 relative min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16}/><input placeholder="搜索故障码或 SOP 名称..." value={guideSearch} onChange={(e) => setGuideSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner" /></div>
             </div>
             <div className="grid grid-cols-1 gap-4">
                {filteredGuidesList.length > 0 ? (
                  filteredGuidesList.map(g => (
                    <div key={g.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row items-start md:items-center justify-between group">
                      <div className="flex items-start md:items-center space-x-6">
                        <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                          <FileText size={28} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md uppercase">{g.faultCode}</span>
                            <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase">v{g.version}</span>
                            {g.published ? (
                              <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md uppercase flex items-center">
                                <ShieldCheck size={10} className="mr-1" /> 已启用
                              </span>
                            ) : (
                              <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md uppercase flex items-center">
                                <ShieldAlert size={10} className="mr-1" /> 已禁用
                              </span>
                            )}
                            {/* 去掉维修次数显示 */}
                          </div>
                          <h3 className="text-lg font-black text-slate-800">{g.faultCategory}</h3>
                          <p className="text-xs text-slate-500 line-clamp-1 italic max-w-md">{g.faultPhenomenon}</p>
                          <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider pt-1">
                            <span className="flex items-center"><Cpu size={12} className="mr-1"/> {MOCK_DEVICES.find(d => d.id === g.deviceId)?.model}</span>
                            <span className="flex items-center"><Layers size={12} className="mr-1"/> {g.steps.length} 个步骤</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center space-x-2">
                        <button 
                          onClick={() => handleToggleGuideStatus(g.id)} 
                          className={`flex items-center px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm ${
                            g.published 
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' 
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {g.published ? (
                            <><Lock size={14} className="mr-2" /> 禁用</>
                          ) : (
                            <><Unlock size={14} className="mr-2" /> 启用</>
                          )}
                        </button>
                        <button onClick={() => setEditingGuide(g)} className="flex items-center px-4 py-2 bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black transition-all shadow-sm">
                          <Edit3 size={14} className="mr-2" /> 编辑
                        </button>
                      </div>
                    </div>
                  ))
                ) : (<div className="py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 text-slate-300"><Search size={48} className="mb-4 opacity-20" /><p className="text-sm font-black uppercase tracking-widest">未找到匹配的 SOP</p></div>)}
             </div>
          </div>
        )}
        {activeTab === '现场提问记录' && renderInquiries()}
        {activeTab === '多媒体资料库' && renderMediaLibrary()}
        {activeTab === '用户权限管理' && renderUserManagement()}
        {activeTab === '个人信息' && renderPersonalInfo()}
      </div>

      {/* 提问详情 Modal */}
      {viewingInquiry && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3"><MessageSquare size={28}/></div>
                    <div><h3 className="text-xl font-black text-slate-900">现场疑问处理面板</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">提问 ID: {viewingInquiry.id.toUpperCase()}</p></div>
                  </div>
                  <button onClick={() => setViewingInquiry(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide bg-slate-50/30">
                  <div className="grid grid-cols-12 gap-10">
                    <div className="col-span-5 space-y-6">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center"><Info size={12} className="mr-2"/> 环境与溯源信息</h4>
                          <div className="space-y-4">
                              <div><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">提出工程师</p><p className="text-xs font-black text-slate-800">{ALL_USERS.find(u => u.id === viewingInquiry.engineerId)?.name}</p></div>
                              <div><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">关联机台 / SN</p><p className="text-xs font-black text-slate-800">{MOCK_DEVICES.find(d => d.id === viewingInquiry.deviceId)?.model} ({MOCK_DEVICES.find(d => d.id === viewingInquiry.deviceId)?.sn})</p></div>
                              <div><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">故障代码 (SOP)</p><p className="text-xs font-black text-blue-600">{MOCK_GUIDES.find(g => g.id === viewingInquiry.guideId)?.faultCode || viewingInquiry.context?.faultCode}</p></div>
                              <div>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">提交时的执行步骤</p>
                                <p className="text-xs font-black text-slate-800">
                                  {viewingInquiry.context?.stepTitle || `Step ${viewingInquiry.stepId}`}
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-50">
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">反馈参考来源</p>
                                {viewingInquiry.context?.isStepRelated === false ? (
                                  <span className="inline-flex px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase border border-rose-100">
                                    <AlertTriangle size={10} className="mr-1"/> 之前的步骤中都没有提到过 (新发现)
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase border border-emerald-100">
                                    <CheckCircle size={10} className="mr-1"/> 参考/针对当前步骤的反馈
                                  </span>
                                )}
                              </div>
                          </div>
                        </div>
                        {viewingInquiry.photoUrl && (
                          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center"><FileImage size={12} className="mr-2"/> 现场物证照片</h4>
                              <img src={viewingInquiry.photoUrl} className="w-full rounded-2xl border border-slate-100 shadow-sm" alt=""/>
                          </div>
                        )}
                    </div>
                    <div className="col-span-7 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center"><MessageCircleCode size={14} className="mr-2 text-amber-500"/> 工程师反馈内容</h4>
                          <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl">
                              <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{viewingInquiry.question}"</p>
                          </div>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center"><Zap size={14} className="mr-2 text-blue-500"/> 专家回复与指令下达</h4>
                          <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-3xl text-xs min-h-[160px] outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="请输入指导意见，该内容将同步推送给现场工程师移动端..."/>
                        </div>
                    </div>
                  </div>
              </div>
              <div className="px-10 py-6 border-t border-slate-100 flex items-center justify-between bg-white">
                  <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><BadgeCheck className="text-emerald-500" size={14}/><span>标记处理后记录将归档至该机台生命周期</span></div>
                  <div className="flex items-center space-x-4">
                    <button onClick={() => setViewingInquiry(null)} className="px-8 py-3 text-slate-600 font-black text-sm hover:text-slate-900 transition-colors">关闭</button>
                    <button onClick={() => { setInquiries(prev => prev.map(i => i.id === viewingInquiry.id ? {...i, status: 'resolved'} : i)); setViewingInquiry(null); }} className="px-12 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-2xl flex items-center active:scale-95 transition-all"><Save size={18} className="mr-2" /> 保存并结案</button>
                  </div>
              </div>
            </div>
        </div>
      )}

      {/* 用户编辑器 Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in">
           <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                 <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner rotate-3"><Settings size={28}/></div>
                    <div><h3 className="text-xl font-black text-slate-900">权限矩阵配置: {editingUser.name}</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">成员 ID: {editingUser.id} · {editingUser.employeeId}</p></div>
                 </div>
                 <button onClick={() => setEditingUser(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 scrollbar-hide space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">基础信息</label>
                        <div className="space-y-3">
                          <div className="space-y-1"><span className="text-[9px] text-slate-400 font-bold uppercase">所属部门</span><select className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none text-xs font-bold" value={editingUser.department} onChange={e => setEditingUser({...editingUser, department: e.target.value})}>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                          <div className="space-y-1"><span className="text-[9px] text-slate-400 font-bold uppercase">成员角色</span><select className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none text-xs font-bold" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as Role})}>{Object.values(Role).map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}</select></div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">权限颗粒度控制</label>
                        <div className="grid grid-cols-1 gap-2">
                            {Object.entries(editingUser.permissions).map(([key, value]) => (
                              <div key={key} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-700 uppercase">{key}</span>
                                <div className="flex space-x-1">
                                  {['none', 'view', 'manage'].map((p) => (
                                      <button key={p} onClick={() => setEditingUser({...editingUser, permissions: {...editingUser.permissions, [key]: p}})} className={`px-2 py-1 rounded text-[8px] font-black uppercase ${value === p ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>{p}</button>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                    </div>
               </div>
              </div>
              <div className="px-10 py-6 border-t border-slate-100 flex items-center justify-end bg-white">
                <button onClick={() => setEditingUser(null)} className="px-8 py-3 text-slate-600 font-black text-sm mr-4">取消</button>
                <button onClick={() => handleSaveUser(editingUser)} className="px-12 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"><Save size={18} className="mr-2" /> 保存变更</button>
              </div>
           </div>
        </div>
      )}

      {/* SOP 编辑器 Modal */}
      {editingGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-in fade-in">
           <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10"><div className="flex items-center space-x-4"><div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3"><Edit3 size={24} /></div><div><h3 className="text-xl font-black text-slate-900">规程手册编辑器</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{editingGuide.faultCode} · SOP 生命周期管理</p></div></div><button onClick={() => setEditingGuide(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24}/></button></div>
              <div className="flex-1 p-10 overflow-y-auto bg-slate-50/30">
                 <div className="space-y-8">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     <div className="space-y-1"><span className="text-[10px] text-slate-400 font-black uppercase">故障码</span><input className="w-full p-4 bg-white rounded-2xl border border-slate-200 outline-none text-xs font-black text-blue-600" value={editingGuide.faultCode} onChange={e => setEditingGuide({...editingGuide, faultCode: e.target.value})} /></div>
                     <div className="space-y-1">
                       <span className="text-[10px] text-slate-400 font-black uppercase">关联设备</span>
                       <select 
                         className="w-full p-4 bg-white rounded-2xl border border-slate-200 outline-none text-xs font-bold appearance-none"
                         value={editingGuide.deviceId}
                         onChange={e => setEditingGuide({...editingGuide, deviceId: e.target.value})}
                       >
                         {MOCK_DEVICES.map(d => (
                           <option key={d.id} value={d.id}>{d.model} ({d.sn})</option>
                         ))}
                       </select>
                     </div>
                     <div className="space-y-1"><span className="text-[10px] text-slate-400 font-black uppercase">故障分类</span><input className="w-full p-4 bg-white rounded-2xl border border-slate-200 outline-none text-xs font-bold" value={editingGuide.faultCategory} onChange={e => setEditingGuide({...editingGuide, faultCategory: e.target.value})} /></div>
                     <div className="space-y-1">
                       <span className="text-[10px] text-slate-400 font-black uppercase">报修类型</span>
                       <select className="w-full p-4 bg-white rounded-2xl border border-slate-200 outline-none text-xs font-bold appearance-none">
                         <option value="normal">普通报修</option>
                         <option value="emergency">紧急报修</option>
                       </select>
                     </div>
                   </div>
                      <div className="space-y-4">
                        {editingGuide.steps.map((step, idx) => (
                          <div key={idx} className={`p-6 border rounded-[2rem] flex flex-col space-y-4 relative group transition-all duration-300 ${step.enabled === false ? 'bg-slate-50 border-slate-200 opacity-60 grayscale-[0.5]' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex items-center space-x-4">
                             <span className="w-8 h-8 bg-slate-900 text-white text-xs font-black rounded-full flex items-center justify-center">{idx + 1}</span>
                             <div className="flex-1 flex items-center space-x-2">
                               <input className="flex-1 p-2 border-b-2 border-slate-100 outline-none font-black text-sm focus:border-blue-600 transition-colors" value={step.title} onChange={e => { const newSteps = [...editingGuide.steps]; newSteps[idx].title = e.target.value; setEditingGuide({...editingGuide, steps: newSteps}); }} />
                               <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-200 shrink-0 animate-pulse">
                                 <History size={12} />
                                 <span className="text-[10px] font-black uppercase tracking-tight">反馈次数: {step.historyRepairCount || 1}</span>
                               </div>
                               <button 
                                 onClick={() => {
                                   const newSteps = [...editingGuide.steps];
                                   newSteps[idx].enabled = !(newSteps[idx].enabled !== false);
                                   setEditingGuide({...editingGuide, steps: newSteps});
                                 }} 
                                 className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center shrink-0 ${
                                   step.enabled === false 
                                     ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' 
                                     : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm'
                                 }`}
                               >
                                 {step.enabled === false ? <><Unlock size={12} className="mr-1.5"/> 启用</> : <><Lock size={12} className="mr-1.5"/> 禁用</>}
                               </button>
                             </div>
                             {false && step.historyRepairCount !== undefined && (
                               <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                                 <History size={12} className="text-slate-400" />
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">历史使用: {step.historyRepairCount} 次</span>
                               </div>
                             )}
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-1">
                               <span className="text-[10px] text-slate-400 font-black uppercase">操作说明</span>
                               <textarea 
                                 className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none text-xs min-h-[80px]" 
                                 value={step.instruction || ''} 
                                 onChange={e => { const newSteps = [...editingGuide.steps]; newSteps[idx].instruction = e.target.value; setEditingGuide({...editingGuide, steps: newSteps}); }} 
                                 placeholder="请输入详细操作说明..." 
                               />
                             </div>
                             <div className="space-y-1">
                               <span className="text-[10px] text-slate-400 font-black uppercase">判断方法</span>
                               <textarea 
                                 className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none text-xs min-h-[80px]" 
                                 value={step.judgmentMethod || ''} 
                                 onChange={e => { const newSteps = [...editingGuide.steps]; newSteps[idx].judgmentMethod = e.target.value; setEditingGuide({...editingGuide, steps: newSteps}); }} 
                                 placeholder="请输入如何判断步骤完成或成功的方法..." 
                               />
                             </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-1">
                               <span className="text-[10px] text-slate-400 font-black uppercase">步骤描述</span>
                               <textarea 
                                 className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none text-xs min-h-[80px]" 
                                 value={step.description} 
                                 onChange={e => { const newSteps = [...editingGuide.steps]; newSteps[idx].description = e.target.value; setEditingGuide({...editingGuide, steps: newSteps}); }} 
                                 placeholder="步骤详细描述..." 
                               />
                             </div>
                             <div className="space-y-1">
                               <span className="text-[10px] text-rose-400 font-black uppercase">安全提示</span>
                               <textarea 
                                 className="w-full p-4 bg-rose-50/50 rounded-2xl border border-rose-100 outline-none text-xs min-h-[80px] text-rose-700 placeholder:text-rose-300" 
                                 value={step.safetyWarning || ''} 
                                 onChange={e => { const newSteps = [...editingGuide.steps]; newSteps[idx].safetyWarning = e.target.value; setEditingGuide({...editingGuide, steps: newSteps}); }} 
                                 placeholder="请输入安全注意事项或潜在风险..." 
                               />
                             </div>
                           </div>
                           
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center"><FileImage size={12} className="mr-1 text-blue-500"/> 图片资源</label>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-2">
                                   {(step.imageUrls || (step.imageUrl ? [step.imageUrl] : [])).map((url, urlIdx) => {
                                     const resource = mediaResources.find(r => r.url === url);
                                     return (
                                       <div key={urlIdx} className="space-y-1">
                                         {resource?.description && (
                                           <div className="px-2 py-1 bg-blue-50/50 rounded-lg border border-blue-100/50">
                                             <p className="text-[9px] font-black text-blue-600 line-clamp-1 italic">备注: {resource.description}</p>
                                           </div>
                                         )}
                                         <div className="relative group/media aspect-video rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                           <img src={url} className="w-full h-full object-cover" alt="" />
                                           <button 
                                             onClick={() => { 
                                               const newSteps = [...editingGuide.steps]; 
                                               const urls = (newSteps[idx].imageUrls || (newSteps[idx].imageUrl ? [newSteps[idx].imageUrl] : [])).filter((_, i) => i !== urlIdx);
                                               newSteps[idx].imageUrls = urls;
                                               newSteps[idx].imageUrl = urls[0] || '';
                                               setEditingGuide({...editingGuide, steps: newSteps}); 
                                             }} 
                                             className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center text-white"
                                           >
                                             <Trash2 size={16}/>
                                           </button>
                                         </div>
                                       </div>
                                     );
                                   })}
                                 </div>
                                  
                                  <div className="w-full aspect-video border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 space-y-3">
                                    <button 
                                      onClick={() => { 
                                        const urlStr = prompt('请输入图片 URL (支持多个 URL，用英文逗号分隔):', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop'); 
                                        if(urlStr) { 
                                          const urls = urlStr.split(',').map(u => u.trim()).filter(u => u !== '');
                                          const newSteps = [...editingGuide.steps]; 
                                          const currentUrls = newSteps[idx].imageUrls || (newSteps[idx].imageUrl ? [newSteps[idx].imageUrl] : []);
                                          newSteps[idx].imageUrls = [...currentUrls, ...urls]; 
                                          if (!newSteps[idx].imageUrl) newSteps[idx].imageUrl = urls[0];
                                          setEditingGuide({...editingGuide, steps: newSteps}); 
                                        } 
                                      }}
                                      className="flex flex-col items-center justify-center text-slate-300 hover:text-blue-600 transition-all transform hover:scale-105"
                                    >
                                      <UploadCloud size={20} className="mb-1" />
                                      <span className="text-[9px] font-black uppercase">本地上传</span>
                                    </button>
                                    <div className="w-10 h-[1px] bg-slate-100" />
                                    <button 
                                      onClick={() => setSelectingMediaForStep({ stepIndex: idx, type: 'image' })}
                                      className="flex flex-col items-center justify-center text-slate-300 hover:text-indigo-600 transition-all transform hover:scale-105"
                                    >
                                      <Database size={20} className="mb-1" />
                                      <span className="text-[9px] font-black uppercase">资源库选择</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center"><FileVideo size={12} className="mr-1 text-indigo-500"/> 视频指导</label>
                                <div className="space-y-3">
                                   <div className="space-y-2">
                                     {(step.videoUrls || (step.videoUrl ? [step.videoUrl] : [])).map((url, urlIdx) => {
                                       const resource = mediaResources.find(r => r.url === url);
                                       return (
                                         <div key={urlIdx} className="space-y-1">
                                           {resource?.description && (
                                             <div className="px-2 py-1 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                                               <p className="text-[9px] font-black text-indigo-600 line-clamp-1 italic">备注: {resource.description}</p>
                                             </div>
                                           )}
                                           <div className="relative group/media h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-900 flex items-center px-3 space-x-2">
                                             <FileVideo size={16} className="text-white/40" />
                                             <div className="flex-1 text-[8px] text-white font-mono truncate">{url}</div>
                                             <button 
                                               onClick={() => { 
                                                 const newSteps = [...editingGuide.steps]; 
                                                 const urls = (newSteps[idx].videoUrls || (newSteps[idx].videoUrl ? [newSteps[idx].videoUrl] : [])).filter((_, i) => i !== urlIdx);
                                                 newSteps[idx].videoUrls = urls;
                                                 newSteps[idx].videoUrl = urls[0] || '';
                                                 setEditingGuide({...editingGuide, steps: newSteps}); 
                                               }} 
                                               className="text-white/40 hover:text-rose-400 transition-colors"
                                             >
                                               <Trash2 size={14}/>
                                             </button>
                                           </div>
                                         </div>
                                       );
                                     })}
                                   </div>

                                  <div className="w-full aspect-video border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 space-y-3">
                                    <button 
                                      onClick={() => { 
                                        const urlStr = prompt('请输入视频 URL (支持多个 URL，用英文逗号分隔):', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4'); 
                                        if(urlStr) { 
                                          const urls = urlStr.split(',').map(u => u.trim()).filter(u => u !== '');
                                          const newSteps = [...editingGuide.steps]; 
                                          const currentUrls = newSteps[idx].videoUrls || (newSteps[idx].videoUrl ? [newSteps[idx].videoUrl] : []);
                                          newSteps[idx].videoUrls = [...currentUrls, ...urls]; 
                                          if (!newSteps[idx].videoUrl) newSteps[idx].videoUrl = urls[0];
                                          setEditingGuide({...editingGuide, steps: newSteps}); 
                                        } 
                                      }}
                                      className="flex flex-col items-center justify-center text-slate-300 hover:text-indigo-600 transition-all transform hover:scale-105"
                                    >
                                      <UploadCloud size={20} className="mb-1" />
                                      <span className="text-[9px] font-black uppercase">本地上传</span>
                                    </button>
                                    <div className="w-10 h-[1px] bg-slate-100" />
                                    <button 
                                      onClick={() => setSelectingMediaForStep({ stepIndex: idx, type: 'video' })}
                                      className="flex flex-col items-center justify-center text-slate-300 hover:text-indigo-600 transition-all transform hover:scale-105"
                                    >
                                      <Database size={20} className="mb-1" />
                                      <span className="text-[9px] font-black uppercase">资源库选择</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center"><FileText size={12} className="mr-1 text-rose-500"/> PDF 文档</label>
                                <div className="space-y-3">
                                   <div className="space-y-2">
                                     {(step.pdfUrls || (step.pdfUrl ? [step.pdfUrl] : [])).map((url, urlIdx) => {
                                       const resource = mediaResources.find(r => r.url === url);
                                       return (
                                         <div key={urlIdx} className="space-y-1">
                                           {resource?.description && (
                                             <div className="px-2 py-1 bg-rose-50/50 rounded-lg border border-rose-100/50">
                                               <p className="text-[9px] font-black text-rose-600 line-clamp-1 italic">备注: {resource.description}</p>
                                             </div>
                                           )}
                                           <div className="relative group/media h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-rose-50 flex items-center px-3 space-x-2">
                                             <FileDown size={16} className="text-rose-300" />
                                             <div className="flex-1 text-[8px] text-rose-600 font-black truncate">DOCUMENT_{urlIdx + 1}.PDF</div>
                                             <button 
                                               onClick={() => { 
                                                 const newSteps = [...editingGuide.steps]; 
                                                 const urls = (newSteps[idx].pdfUrls || (newSteps[idx].pdfUrl ? [newSteps[idx].pdfUrl] : [])).filter((_, i) => i !== urlIdx);
                                                 newSteps[idx].pdfUrls = urls;
                                                 newSteps[idx].pdfUrl = urls[0] || '';
                                                 setEditingGuide({...editingGuide, steps: newSteps}); 
                                               }} 
                                               className="text-rose-300 hover:text-rose-600 transition-colors"
                                             >
                                               <Trash2 size={14}/>
                                             </button>
                                           </div>
                                         </div>
                                       );
                                     })}
                                   </div>

                                  <div className="w-full aspect-video border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 space-y-3">
                                    <button 
                                      onClick={() => { 
                                        const urlStr = prompt('请输入 PDF URL (支持多个 URL，用英文逗号分隔):', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'); 
                                        if(urlStr) { 
                                          const urls = urlStr.split(',').map(u => u.trim()).filter(u => u !== '');
                                          const newSteps = [...editingGuide.steps]; 
                                          const currentUrls = newSteps[idx].pdfUrls || (newSteps[idx].pdfUrl ? [newSteps[idx].pdfUrl] : []);
                                          newSteps[idx].pdfUrls = [...currentUrls, ...urls]; 
                                          if (!newSteps[idx].pdfUrl) newSteps[idx].pdfUrl = urls[0];
                                          setEditingGuide({...editingGuide, steps: newSteps}); 
                                        } 
                                      }}
                                      className="flex flex-col items-center justify-center text-slate-300 hover:text-rose-600 transition-all transform hover:scale-105"
                                    >
                                      <UploadCloud size={20} className="mb-1" />
                                      <span className="text-[9px] font-black uppercase">本地上传</span>
                                    </button>
                                    <div className="w-10 h-[1px] bg-slate-100" />
                                    <button 
                                      onClick={() => setSelectingMediaForStep({ stepIndex: idx, type: 'pdf' })}
                                      className="flex flex-col items-center justify-center text-slate-300 hover:text-indigo-600 transition-all transform hover:scale-105"
                                    >
                                      <Database size={20} className="mb-1" />
                                      <span className="text-[9px] font-black uppercase">资源库选择</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                           
                           {/* 移除了原有的绝对定位禁用按钮，已整合到上方标题栏 */}
                         </div>
                       ))}
                       <button onClick={() => setEditingGuide({...editingGuide, steps: [...editingGuide.steps, { id: `s-${Date.now()}`, stage: '维修实施', title: '新步骤', description: '', isConfirmationRequired: true, imageUrl: '', videoUrl: '', pdfUrl: '' }]})} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center"><Plus size={18} className="mr-2"/> 添加执行步骤</button>
                     </div>
                   </div>
                 </div>
              <div className="px-10 py-6 border-t border-slate-100 flex items-center justify-end bg-white">
                 <button onClick={() => setEditingGuide(null)} className="px-8 py-3 text-slate-600 font-black text-sm mr-4">取消</button>
                 <button onClick={() => handleSaveGuide(editingGuide)} className="px-12 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"><Save size={18} className="mr-2" /> 保存 SOP</button>
              </div>
           </div>
        </div>
      )}

      {renderUploadModal()}
      {renderMediaViewModal()}
      {renderMediaEditModal()}
      {renderMediaSelectionModal()}
    </div>
  );
};

export default AdminDashboard;
