
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  QrCode, ChevronRight, ArrowLeft, Microscope, Cpu, PlayCircle, Play, FileText, X, 
  Send, Image as ImageIcon, Video, ShieldCheck, ScanLine, Info, Tag, Search, AlertCircle, 
  FileSearch, AlertTriangle, Hammer, BookOpen, ExternalLink, Maximize2, History, Calendar, ClipboardCheck, ClipboardList, Camera, MessageSquare, CheckCircle2, Clock, BadgeAlert
} from 'lucide-react';
import { MOCK_DEVICES, MOCK_GUIDES, MOCK_USER, MOCK_RECORDS, ALL_USERS, MOCK_REPAIR_REQUESTS } from '../../constants';
import { Device, MaintenanceGuide, GuideStep, RepairRecord } from '../../types';

const EngineerApp: React.FC = () => {
  const [step, setStep] = useState<'SCAN' | 'SCANNING_UI' | 'ALARM_SELECT' | 'STEP_LIST' | 'GUIDE' | 'LOG' | 'SUBMIT_INQUIRY' | 'REPAIR_DETAIL' | 'FINAL_SUBMIT'>('SCAN');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<MaintenanceGuide | null>(null);
  const [activeGuideStepIdx, setActiveGuideStepIdx] = useState(0);
  const [showStepJump, setShowStepJump] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // 维修反馈相关状态
  const [repairActionText, setRepairActionText] = useState('');
  const [repairPhotos, setRepairPhotos] = useState<string[]>([]);
  const [isSubmittingRepair, setIsSubmittingRepair] = useState(false);

  // 排序后的步骤
  const sortedSteps = useMemo(() => {
    if (!selectedGuide) return [];
    return [...selectedGuide.steps].sort((a, b) => (b.historyRepairCount || 0) - (a.historyRepairCount || 0));
  }, [selectedGuide]);

  // 维修订单详情状态
  const [viewingRepairRecord, setViewingRepairRecord] = useState<RepairRecord | null>(null);

  // 历史记录查看状态
  const [viewingHistoryRecord, setViewingHistoryRecord] = useState<RepairRecord | null>(null);
  const [showHistoryOverlay, setShowHistoryOverlay] = useState(false);

  // 步骤疑问提交状态
  const [inquiryText, setInquiryText] = useState('');
  const [inquiryPhoto, setInquiryPhoto] = useState<string | null>(null);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [submissionSource, setSubmissionSource] = useState<'CLOSE' | 'PASS' | null>(null);
  const [isNewIssue, setIsNewIssue] = useState(false); // 新增：是否为新问题的勾选状态
  const [viewingRequest, setViewingRequest] = useState<any>(null); // 新增：查看中的报修申请
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [alarmSearchQuery, setAlarmSearchQuery] = useState(''); // 新增：报警搜索关键词
  const [showAllAlarms, setShowAllAlarms] = useState(false); // 新增：是否显示全部报警代码

  // 模拟扫码识别过程
  useEffect(() => {
    if (step === 'SCANNING_UI') {
      const timer = setTimeout(() => {
        setSelectedDevice(MOCK_DEVICES[0]);
        setStep('ALARM_SELECT');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const authorizedDevices = useMemo(() => {
    return MOCK_DEVICES.filter(d => MOCK_USER.assignedDeviceIds.includes(d.id));
  }, []);

  // 获取当前报警代码的相关历史
  const alarmHistory = useMemo(() => {
    if (!selectedGuide) return [];
    return MOCK_RECORDS
      .filter(r => r.guideId === selectedGuide.id)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [selectedGuide]);

  const availableAlarms = useMemo(() => {
    if (!selectedDevice) return [];
    let baseList = MOCK_GUIDES
      .filter(g => g.deviceId === selectedDevice.id);
    
    if (alarmSearchQuery.trim()) {
      const query = alarmSearchQuery.toLowerCase();
      baseList = baseList.filter(g => 
        g.faultCode.toLowerCase().includes(query) || 
        g.faultCategory.toLowerCase().includes(query) ||
        g.scope.toLowerCase().includes(query)
      );
    }
    
    return baseList.sort((a, b) => (b.totalOccurrenceCount || 0) - (a.totalOccurrenceCount || 0));
  }, [selectedDevice, alarmSearchQuery]);

  // 分类报警代码（基于维修类型/Scope）
  const groupedAlarms = useMemo(() => {
    const groups: { [key: string]: MaintenanceGuide[] } = {};
    availableAlarms.forEach(alarm => {
      const scope = alarm.scope || '其他';
      if (!groups[scope]) groups[scope] = [];
      groups[scope].push(alarm);
    });
    return groups;
  }, [availableAlarms]);

  const handleInquiryPhoto = () => {
    // 模拟拍照
    setInquiryPhoto('https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400');
  };

  const handleSubmitInquiry = () => {
    if (!inquiryText.trim()) return;
    setIsSubmittingInquiry(true);
    // 模拟接口提交
    setTimeout(() => {
      console.log('Admin Notification: New Step Inquiry Received', {
        engineer: MOCK_USER.name,
        guideId: selectedGuide?.id,
        stepId: sortedSteps[activeGuideStepIdx]?.id,
        question: inquiryText,
        photo: inquiryPhoto,
        context: {
          faultCode: selectedGuide?.faultCode,
          stepTitle: sortedSteps[activeGuideStepIdx]?.title,
          isStepRelated: !isNewIssue
        }
      });
      alert(`您的疑问已记录（${isNewIssue ? '标记为新问题' : '关联当前步骤'}）并同步至后台管理系统，请稍后查阅专家回复。`);
      setIsSubmittingInquiry(false);
      setInquiryText('');
      setInquiryPhoto(null);
      setIsNewIssue(false);
      setStep('GUIDE');
    }, 1500);
  };

  const ongoingRepair = useMemo(() => {
    return MOCK_RECORDS.find(r => r.status === 'ongoing' && r.engineerId === MOCK_USER.id);
  }, []);

  const renderContent = () => {
    if (step === 'SCAN') {
      return (
        <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-500">
          {ongoingRepair && (
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-500 text-white rounded-lg animate-pulse">
                    <AlertCircle size={14} />
                  </div>
                  <h4 className="text-xs font-black text-amber-900 uppercase">当前维修任务</h4>
                </div>
                <span className="text-[9px] font-black bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-widest">进行中</span>
              </div>
              
              <div className="flex items-start justify-between group cursor-pointer" onClick={() => { setViewingRepairRecord(ongoingRepair); setStep('REPAIR_DETAIL'); }}>
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    {MOCK_DEVICES.find(d => d.id === MOCK_GUIDES.find(g => g.id === ongoingRepair.guideId)?.deviceId)?.model}
                  </h3>
                  <p className="text-[10px] text-amber-700/70 font-bold mt-0.5">
                    报警代码: {MOCK_GUIDES.find(g => g.id === ongoingRepair.guideId)?.faultCode}
                  </p>
                </div>
                <div className="p-2 bg-white rounded-xl shadow-sm text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center"><Microscope className="mr-2 text-blue-600" size={18} /> 资产识别</h2>
            <button onClick={() => setStep('SCANNING_UI')} className="w-full flex flex-col items-center justify-center p-12 bg-blue-600 rounded-3xl hover:bg-blue-700 transition shadow-xl shadow-blue-100 text-white">
              <QrCode className="w-12 h-12 mb-3" />
              <span className="text-sm font-black">扫描资产二维码</span>
            </button>
          </div>
          <div className="space-y-3 px-1 flex-1 overflow-y-auto scrollbar-hide">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">最近操作过的资产</h3>
            {authorizedDevices.map(d => (
              <div key={d.id} onClick={() => { setSelectedDevice(d); setStep('ALARM_SELECT'); }} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-400 cursor-pointer shadow-sm group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                    <Cpu size={20} className="text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{d.model}</p>
                    <p className="text-[10px] font-mono text-slate-400 uppercase">{d.sn}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (step === 'SCANNING_UI') {
      return (
        <div className="absolute inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="relative w-64 h-64 border-2 border-white/20 rounded-3xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-indigo-900/20"></div>
              <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-sm"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-sm"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-sm"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-sm"></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 shadow-[0_0_15px_#60a5fa] animate-[scanLine_2s_infinite_linear]"></div>
              <div className="z-10 text-center space-y-2">
                 <QrCode size={48} className="text-white mx-auto opacity-40" />
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse">对准二维码中心...</p>
              </div>
           </div>
           <div className="mt-12 text-center space-y-4">
              <h3 className="text-white font-bold text-lg">资产自动对焦中</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed max-w-[200px] mx-auto">系统正在连接资产数据库，自动识别机台履历与维护权限。</p>
              <button onClick={() => { setSelectedDevice(MOCK_DEVICES[0]); setStep('ALARM_SELECT'); }} className="px-6 py-2 bg-white/10 text-white/50 rounded-full text-[10px] font-bold border border-white/10 hover:bg-white/20 transition-all">跳过模拟识别</button>
           </div>
           <button onClick={() => setStep('SCAN')} className="absolute bottom-10 p-4 bg-white/10 text-white rounded-full"><X size={24}/></button>
           <style>{` @keyframes scanLine { 0% { top: 10%; } 100% { top: 90%; } } `}</style>
        </div>
      );
    }

    if (step === 'ALARM_SELECT') {
       return (
          <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500 pb-10">
             <div className="flex items-center space-x-3 mb-2">
                <button onClick={() => setStep('SCAN')} className="p-2 bg-slate-100 rounded-full text-slate-500"><ArrowLeft size={18}/></button>
                <div className="flex-1">
                   <h2 className="text-sm font-black text-slate-900">已识别机台: {selectedDevice?.model}</h2>
                   <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">SN: {selectedDevice?.sn}</p>
                </div>
             </div>
             
             <div className="space-y-6">
                <div className="flex flex-col space-y-3">
                   <div className="flex items-center justify-between px-1">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                         <AlertTriangle size={12} className="mr-1.5 text-amber-500" /> 选择当前报警代码
                      </h4>
                   </div>
                   {/* 搜索框 */}
                   <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                         <Search size={14} className="text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="搜索报警代码、维修类型或故障现象..." 
                        value={alarmSearchQuery}
                        onChange={(e) => setAlarmSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-slate-100 text-[11px] font-bold outline-none focus:border-blue-400 transition-all shadow-sm"
                      />
                   </div>
                </div>
                
                <div className="space-y-8">
                   {Object.keys(groupedAlarms).length > 0 ? (
                      Object.entries(groupedAlarms).map(([scope, alarms]) => (
                         <div key={scope} className="space-y-3">
                            <div className="flex items-center space-x-2 px-1">
                               <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                               <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{scope}</h5>
                               <span className="text-[9px] font-black text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">{alarms.length}</span>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                               {alarms.map((guide) => (
                                  <button 
                                     key={guide.id} 
                                     onClick={() => { 
                                        setSelectedGuide(guide); 
                                        setActiveGuideStepIdx(0); 
                                        setShowHistoryOverlay(false); 
                                        setStep('STEP_LIST'); 
                                     }} 
                                     className="flex flex-col p-5 bg-white rounded-3xl border border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm group text-left relative overflow-hidden"
                                  >
                                     <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-2">
                                           <span className="text-[11px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                              {guide.faultCode}
                                           </span>
                                        </div>
                                     </div>
                                     <h3 className="text-sm font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                                        {guide.faultCategory}
                                     </h3>
                                     <p className="text-[10px] text-slate-400 line-clamp-1 italic font-medium">
                                        {guide.faultPhenomenon}
                                     </p>
                                     <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-2 bg-blue-600 text-white rounded-full shadow-lg">
                                           <ChevronRight size={14} />
                                        </div>
                                     </div>
                                  </button>
                               ))}
                            </div>
                         </div>
                      ))
                   ) : (
                      <div className="p-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center space-y-3">
                         <div className="p-4 bg-white rounded-full w-fit mx-auto shadow-sm">
                            <Search size={24} className="text-slate-300" />
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            未找到匹配的报警代码
                         </p>
                      </div>
                   )}

                   {/* 查看全部报警按钮 */}
                   <button 
                     onClick={() => setShowAllAlarms(true)}
                     className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center space-x-2"
                   >
                      <Layers size={14} />
                      <span>查看全部报警代码列表</span>
                   </button>
                </div>

                {/* 全部报警代码弹窗 */}
                {showAllAlarms && (
                   <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-md flex items-end animate-in fade-in duration-300">
                      <div className="w-full bg-white rounded-t-[3rem] shadow-2xl flex flex-col h-[90%] animate-in slide-in-from-bottom-full duration-500 overflow-hidden">
                         <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center space-x-4">
                               <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                  <Layers size={24}/>
                               </div>
                               <div>
                                  <h3 className="text-lg font-black text-slate-900">全部报警代码库</h3>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">机台: {selectedDevice?.model} · 共 {MOCK_GUIDES.filter(g => g.deviceId === selectedDevice?.id).length} 条</p>
                               </div>
                            </div>
                            <button onClick={() => setShowAllAlarms(false)} className="p-3 bg-slate-100 rounded-full text-slate-500 active:scale-90 transition-transform">
                               <X size={24}/>
                            </button>
                         </div>
                         <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                            <div className="grid grid-cols-1 gap-3 pb-10">
                               {MOCK_GUIDES.filter(g => g.deviceId === selectedDevice?.id).map(guide => (
                                  <div 
                                    key={guide.id}
                                    onClick={() => {
                                        setSelectedGuide(guide);
                                        setActiveGuideStepIdx(0);
                                        setShowHistoryOverlay(false);
                                        setStep('STEP_LIST');
                                        setShowAllAlarms(false);
                                     }} 
                                     className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group active:bg-blue-50 transition-all cursor-pointer"
                                  >
                                     <div className="flex items-center space-x-4">
                                        <span className="text-[11px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg uppercase tracking-wider">{guide.faultCode}</span>
                                        <div>
                                           <h4 className="text-sm font-black text-slate-800">{guide.faultCategory}</h4>
                                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{guide.scope}</span>
                                        </div>
                                     </div>
                                     <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                {/* 新增：待处理维修申请模块 */}
                <div className="pt-4 pb-8 border-t border-slate-100 mt-6">
                   <div className="flex items-center justify-between px-1 mb-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                         <Clock size={12} className="mr-1.5 text-blue-500" /> 待处理维修申请
                      </h4>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black">{MOCK_REPAIR_REQUESTS.length} 条</span>
                   </div>
                   
                   <div className="space-y-3">
                      {MOCK_REPAIR_REQUESTS.map(request => (
                         <div 
                           key={request.id}
                           className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm relative group active:scale-[0.98] transition-all cursor-pointer"
                           onClick={() => setViewingRequest(request)}
                         >
                            <div className="flex items-start justify-between mb-3">
                               <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${request.priority === 'high' ? 'bg-rose-500 animate-pulse' : request.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
                                  <span className="text-[10px] font-black text-slate-900">{request.deviceName}</span>
                               </div>
                               <span className="text-[9px] font-bold text-slate-400">{request.requestTime}</span>
                            </div>
                            
                            <div className="space-y-2">
                               <div className="flex items-center space-x-2">
                                  <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">{request.faultCode}</span>
                                  <h5 className="text-[11px] font-bold text-slate-700">{request.description}</h5>
                               </div>
                               <div className="flex items-center justify-between text-[9px] text-slate-400">
                                  <div className="flex items-center space-x-3">
                                     <span className="flex items-center">工程师: {request.requester}</span>
                                     <span className="flex items-center font-mono">SN: {request.deviceSN}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
       );
    }

    if (step === 'STEP_LIST' && selectedGuide) {
       return (
          <div className="flex flex-col h-full animate-in slide-in-from-bottom-6 duration-500 relative pb-10">
             <div className="flex items-center space-x-3 mb-6 shrink-0">
                <button onClick={() => setStep('ALARM_SELECT')} className="p-2 bg-slate-100 rounded-full text-slate-500"><ArrowLeft size={18}/></button>
                <div className="flex-1">
                   <h2 className="text-sm font-black text-slate-900">规程步骤清单: {selectedGuide.faultCode}</h2>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedGuide.faultCategory}</p>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                <div className="bg-blue-50/50 p-5 rounded-[2rem] border border-blue-100/50 mb-2">
                   <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                         <ClipboardList size={20} />
                      </div>
                      <div>
                         <h4 className="text-xs font-black text-slate-900">执行优先级建议</h4>
                         <p className="text-[10px] text-blue-600/70 font-bold uppercase tracking-tight mt-0.5">已根据历史维修反馈次数进行智能排序</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   {sortedSteps.map((s, idx) => (
                      <div 
                        key={s.id}
                        onClick={() => {
                           setActiveGuideStepIdx(idx);
                           setShowHistoryOverlay(false); // 直接跳转不显示历史浮层
                           setStep('GUIDE');
                        }}
                        className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm relative group cursor-pointer active:scale-[0.98] transition-all hover:border-blue-300"
                      >
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-wider">步骤 {idx + 1}</span>
                            <div className="flex items-center space-x-2">
                               {s.historyRepairCount !== undefined && (
                                  <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                                     <History size={10} />
                                     <span className="text-[9px] font-black uppercase tracking-tighter">反馈次数: {s.historyRepairCount}</span>
                                  </div>
                               )}
                               <div className="p-1 bg-blue-50 text-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play size={10} fill="currentColor" />
                               </div>
                            </div>
                         </div>
                         <h3 className="text-sm font-black text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">{s.title}</h3>
                         <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 italic">{s.description}</p>
                         <div className="mt-4 flex items-center space-x-2">
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{s.stage}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="pt-6 shrink-0">
                <button 
                   onClick={() => {
                      setActiveGuideStepIdx(0);
                      setShowHistoryOverlay(true);
                      setStep('GUIDE');
                   }}
                   className="w-full py-5 bg-blue-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center space-x-2 group"
                >
                   <span>开始执行 SOP</span>
                   <Play size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>
       );
    }

    if (step === 'GUIDE' && selectedGuide) {
      const currentStep = sortedSteps[activeGuideStepIdx];
      return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 relative">
           {/* 报警历史浮层 - 进入时显示 */}
           {showHistoryOverlay && (
              <div className="absolute inset-0 z-[180] bg-slate-900/60 backdrop-blur-md flex items-end animate-in fade-in duration-300">
                 <div className="w-full bg-white rounded-t-[3rem] shadow-2xl flex flex-col max-h-[85%] animate-in slide-in-from-bottom-full duration-500 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                       <div className="flex items-center space-x-4">
                          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                             <History size={24}/>
                          </div>
                          <div>
                             <h3 className="text-lg font-black text-slate-900">历史问题参考</h3>
                             <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">代码: {selectedGuide.faultCode} · {alarmHistory.length} 条记录</p>
                          </div>
                       </div>
                       <button onClick={() => setShowHistoryOverlay(false)} className="p-3 bg-slate-100 rounded-full text-slate-500 active:scale-90 transition-transform">
                          <X size={24}/>
                       </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide pb-12">
                       {alarmHistory.length > 0 ? (
                          alarmHistory.map((rec) => (
                             <div key={rec.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                                <div className="flex justify-between items-center">
                                   <div className="flex items-center space-x-2">
                                      <Calendar size={12} className="text-slate-400" />
                                      <span className="text-[10px] font-black text-slate-500 uppercase">{new Date(rec.startTime).toLocaleDateString()}</span>
                                   </div>
                                   <span className="text-[9px] font-black bg-white px-2 py-1 rounded text-slate-400 border border-slate-100">
                                      {ALL_USERS.find(u => u.id === rec.engineerId)?.name}
                                   </span>
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">故障原因</p>
                                   <p className="text-xs font-bold text-slate-800 leading-relaxed italic">"{rec.faultReason}"</p>
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">处理方案</p>
                                   <p className="text-xs text-slate-600 leading-relaxed">{rec.treatment}</p>
                                </div>
                                {rec.photos.length > 0 && (
                                   <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                      {rec.photos.map((p, idx) => (
                                         <img key={idx} src={p} className="w-16 h-16 object-cover rounded-xl border border-white shadow-sm" alt="维修照片" />
                                      ))}
                                   </div>
                                )}
                             </div>
                          ))
                       ) : (
                          <div className="py-12 text-center">
                             <div className="p-6 bg-slate-50 rounded-full w-fit mx-auto mb-4">
                                <ClipboardCheck size={32} className="text-slate-200" />
                             </div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">该报警代码尚无历史维修记录</p>
                          </div>
                       )}
                    </div>
                    
                    <div className="p-8 bg-white border-t border-slate-100 shrink-0">
                       <button onClick={() => setShowHistoryOverlay(false)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all">
                          开始执行当前 SOP
                       </button>
                    </div>
                 </div>
              </div>
           )}

           {previewPdfUrl && (
             <div className="absolute inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom-10">
                <div className="p-4 flex items-center justify-between border-b border-slate-100"><div className="flex items-center space-x-2"><FileSearch className="text-blue-600" size={18}/><span className="text-xs font-black text-slate-900">参考手册预览</span></div><button onClick={() => setPreviewPdfUrl(null)} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={18}/></button></div>
                <div className="flex-1 bg-slate-200 flex items-center justify-center relative"><iframe src={previewPdfUrl} className="w-full h-full border-none" title="PDF Manual"></iframe><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 flex flex-col items-center space-y-2 pointer-events-none"><BookOpen size={48} className="opacity-20"/><p className="text-[10px] font-bold uppercase tracking-widest">加载技术文档中...</p></div></div>
             </div>
           )}

           <div className="flex items-center justify-between mb-6 shrink-0">
              <button onClick={() => setStep('ALARM_SELECT')} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                 <ArrowLeft size={18}/>
              </button>
              <div className="text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">正在进行: {selectedGuide.faultCode}</p>
                 <button onClick={() => setShowStepJump(true)} className="flex items-center space-x-1 mt-1 justify-center bg-white px-3 py-0.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
                    <span className="text-[10px] font-bold text-blue-600">
                       步骤 {activeGuideStepIdx + 1} / {sortedSteps.length}
                    </span>
                    <ChevronRight size={12} className="text-slate-400 rotate-90" />
                 </button>
              </div>
              <button onClick={() => setShowHistoryOverlay(true)} className="p-2 bg-amber-50 rounded-full text-amber-600 hover:bg-amber-100 transition-colors shadow-sm">
                 <History size={18}/>
              </button>
           </div>

           {/* 检查点跳转浮层 */}
           {showStepJump && (
              <div className="absolute inset-0 z-[190] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
                 <div className="w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                       <h3 className="text-sm font-black text-slate-900">跳转检查点</h3>
                       <button onClick={() => setShowStepJump(false)} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={16}/></button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto p-4 space-y-2 scrollbar-hide">
                       {sortedSteps.map((s, idx) => (
                          <button 
                             key={s.id} 
                             onClick={() => { setActiveGuideStepIdx(idx); setShowStepJump(false); }}
                             className={`w-full p-4 rounded-2xl text-left transition-all border ${idx === activeGuideStepIdx ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-300'}`}
                          >
                             <div className="flex justify-between items-center">
                                <span className="text-xs font-black">第 {idx + 1} 步: {s.title}</span>
                             </div>
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
           )}

           {/* 帮助内容浮层 */}
           {showHelp && currentStep && (
              <div className="absolute inset-0 z-[190] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
                 <div className="w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
                       <div className="flex items-center space-x-2">
                          <Info size={18} />
                          <h3 className="text-sm font-black">专家帮助与技巧</h3>
                       </div>
                       <button onClick={() => setShowHelp(false)} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"><X size={16}/></button>
                    </div>
                    <div className="p-8 space-y-4">
                       <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100">
                          <p className="text-xs text-blue-800 leading-relaxed font-medium italic">
                             "{currentStep.helpContent || '该步骤暂无特定的专家建议，请严格按照操作说明进行。'}"
                          </p>
                       </div>
                       <button onClick={() => setShowHelp(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                          明白了
                       </button>
                    </div>
                 </div>
              </div>
           )}

           {currentStep ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pb-36">
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-5">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-2">
                            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg">步骤 {activeGuideStepIdx + 1}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentStep.stage}</span>
                         </div>
                         <button onClick={() => setShowHelp(true)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                            <Info size={16}/>
                         </button>
                      </div>
                      <h3 className="text-base font-black text-slate-900 leading-tight">{currentStep.title}</h3>
                      
                      {/* 多媒体内容展示 */}
                      {(currentStep.imageUrl || currentStep.videoUrl || currentStep.pdfUrl || currentStep.mediaUrl) && (
                        <div className="space-y-4">
                           {currentStep.imageUrl && (
                              <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 group">
                                 <img src={currentStep.imageUrl} className="w-full aspect-video object-cover" alt="操作示意图" />
                                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <Maximize2 size={24} className="text-white"/>
                                 </div>
                              </div>
                           )}
                           
                           {currentStep.videoUrl && (
                              <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-black aspect-video group">
                                 <video src={currentStep.videoUrl} className="w-full h-full object-contain" poster={currentStep.imageUrl} />
                                 <button className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all" onClick={(e) => { const video = e.currentTarget.previousElementSibling as HTMLVideoElement; if (video.paused) { video.play(); video.controls = true; (e.currentTarget as HTMLElement).style.display = 'none'; } }}>
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl">
                                       <PlayCircle size={32} className="text-blue-600 ml-1"/>
                                    </div>
                                 </button>
                              </div>
                           )}

                           {(currentStep.pdfUrl || (currentStep.mediaType === 'pdf' && currentStep.mediaUrl)) && (
                              <div className="p-6 flex flex-col items-center justify-center space-y-4 bg-rose-50 border border-rose-100 rounded-[2rem]">
                                 <div className="p-3 bg-white text-rose-500 rounded-2xl shadow-sm"><FileText size={24}/></div>
                                 <div className="text-center">
                                    <p className="text-[11px] font-black text-rose-900">关联技术参考手册</p>
                                    <p className="text-[9px] text-rose-400 mt-1 uppercase font-bold tracking-tighter">Technical_Doc_Reference.pdf</p>
                                 </div>
                                 <button 
                                    onClick={() => setPreviewPdfUrl(currentStep.pdfUrl || currentStep.mediaUrl!)} 
                                    className="w-full py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center shadow-lg shadow-rose-200 active:scale-95 transition-all"
                                 >
                                    <FileSearch size={14} className="mr-2"/> 在线查阅 PDF 文档
                                 </button>
                              </div>
                           )}
                        </div>
                      )}

                      {/* 操作说明 */}
                      {currentStep.instruction && (
                         <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                               <Hammer size={12} className="text-blue-500"/>
                               <span>操作说明</span>
                            </div>
                            <p className="text-[13px] text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">{currentStep.instruction}</p>
                         </div>
                      )}

                      {/* 判断方法 */}
                      {currentStep.judgmentMethod && (
                         <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                               <CheckCircle2 size={12} className="text-emerald-500"/>
                               <span>判断方法</span>
                            </div>
                            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                               <p className="text-[13px] text-emerald-900 leading-relaxed font-bold">{currentStep.judgmentMethod}</p>
                            </div>
                         </div>
                      )}

                      <div className="space-y-3">
                         <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                            <FileText size={12} className="text-blue-500"/>
                            <span>步骤描述</span>
                         </div>
                         <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{currentStep.description}</p>
                      </div>

                      {currentStep.safetyWarning && (
                         <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start space-x-3">
                            <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={16}/>
                            <div>
                               <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">安全警示 / Safety First</p>
                               <p className="text-[11px] text-rose-800 font-bold mt-1 leading-snug">{currentStep.safetyWarning}</p>
                            </div>
                         </div>
                      )}
                  </div>
                </div>

                <div className="absolute bottom-6 left-0 right-0 px-4 pt-10 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-40 flex space-x-3">
                   <button 
                      onClick={() => {
                         if (confirm("确定要结束本次维修流程并提交执行记录吗？")) {
                            setSubmissionSource('CLOSE');
                            setStep('FINAL_SUBMIT');
                         }
                      }}
                      className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all"
                   >
                      CLOSE 结束
                   </button>
                   <button 
                      onClick={() => { 
                         if (activeGuideStepIdx < sortedSteps.length - 1) { 
                            setActiveGuideStepIdx(prev => prev + 1); 
                         } else { 
                            setSubmissionSource('PASS');
                            setStep('FINAL_SUBMIT'); 
                         } 
                      }} 
                      className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 flex items-center justify-center space-x-2 active:scale-95 transition-all"
                       >
                          <span>{activeGuideStepIdx === sortedSteps.length - 1 ? 'PASS 完工' : 'PASS 下一项'}</span>
                          <ChevronRight size={18} />
                       </button>
                    </div>
              </>
           ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 italic"><AlertCircle size={40} className="mb-2 opacity-20"/>该指南暂无具体步骤数据。</div>
           )}
        </div>
      );
    }

    if (step === 'REPAIR_DETAIL' && viewingRepairRecord) {
      const guide = MOCK_GUIDES.find(g => g.id === viewingRepairRecord.guideId);
      const device = MOCK_DEVICES.find(d => d.id === guide?.deviceId);
      return (
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 mb-4 bg-slate-50 shrink-0">
            <button onClick={() => setStep('SCAN')} className="p-2 text-slate-500"><ArrowLeft size={20}/></button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-md"><ClipboardCheck size={18} /></div>
              <span className="font-black text-sm text-slate-900">维修任务详情</span>
            </div>
            <div className="w-10"></div>
          </div>
          
          <div className="flex-1 space-y-6 overflow-y-auto scrollbar-hide pb-20">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">{device?.model}</h3>
                  <p className="text-[10px] font-mono text-slate-400 uppercase">{device?.sn}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-2 py-1 rounded-lg uppercase tracking-wider">
                    {guide?.faultCode}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">开始时间</p>
                  <p className="text-xs font-bold text-slate-700">{new Date(viewingRepairRecord.startTime).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">指派工程师</p>
                  <p className="text-xs font-bold text-slate-700">{MOCK_USER.name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 px-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                <AlertTriangle size={12} className="mr-1.5 text-amber-500" /> 当前进展
              </h4>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Info size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                      {viewingRepairRecord.treatment}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase">已完成步骤</span>
                  <span className="text-xs font-black text-blue-600">{viewingRepairRecord.completedSteps.length} / {guide?.steps.length}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                    style={{ width: `${(viewingRepairRecord.completedSteps.length / (guide?.steps.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setSelectedDevice(device || null);
                setSelectedGuide(guide || null);
                setActiveGuideStepIdx(viewingRepairRecord.completedSteps.length);
                setStep('GUIDE');
              }}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>继续执行 SOP</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      );
    }

    if (step === 'FINAL_SUBMIT' && selectedGuide) {
       return (
          <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between py-4 border-b border-slate-100 mb-6 shrink-0">
                <button onClick={() => setStep('GUIDE')} className="p-2 text-slate-500"><ArrowLeft size={20}/></button>
                <div className="flex items-center space-x-2">
                   <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md"><ClipboardCheck size={18} /></div>
                   <span className="font-black text-sm text-slate-900">执行与反馈记录</span>
                </div>
                <div className="w-10"></div>
             </div>

             <div className="flex-1 space-y-6 overflow-y-auto scrollbar-hide pb-20 px-1">
                <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100 space-y-2">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">当前完成进度</p>
                   <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-800">{selectedGuide.faultCode}</h4>
                      <span className="text-xs font-black text-blue-700">{activeGuideStepIdx + 1} / {sortedSteps.length} 步骤</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">操作记录 / 执行说明</label>
                      <textarea 
                        value={repairActionText}
                        onChange={(e) => setRepairActionText(e.target.value)}
                        placeholder="请简要描述您实际执行的操作、发现的问题或更换的备件..." 
                        className="w-full p-5 bg-white border border-slate-200 rounded-3xl text-xs min-h-[160px] outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                      />
                   </div>

                   <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <input 
                        type="checkbox" 
                        id="newIssueCheck"
                        checked={isNewIssue}
                        onChange={(e) => setIsNewIssue(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="newIssueCheck" className="text-[11px] font-black text-rose-600">
                        这是 SOP 中未提到的新发现/新故障（标记为新问题）
                      </label>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">上传现场照片</label>
                      <div className="grid grid-cols-2 gap-3">
                         {repairPhotos.map((photo, idx) => (
                            <div key={idx} className="relative aspect-square group">
                               <img src={photo} className="w-full h-full object-cover rounded-2xl border border-slate-100 shadow-sm" alt="维修照片" />
                               <button 
                                  onClick={() => setRepairPhotos(prev => prev.filter((_, i) => i !== idx))}
                                  className="absolute -top-2 -right-2 p-1 bg-white text-rose-500 rounded-full shadow-md border border-slate-100"
                               >
                                  <X size={14}/>
                               </button>
                            </div>
                         ))}
                         {repairPhotos.length < 4 && (
                            <button 
                               onClick={() => setRepairPhotos(prev => [...prev, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400'])}
                               className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all bg-white"
                            >
                               <Camera size={24} />
                               <span className="text-[9px] font-bold uppercase tracking-widest">添加照片</span>
                            </button>
                         )}
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-30">
                <button 
                  disabled={!repairActionText.trim() || isSubmittingRepair}
                  onClick={() => {
                     setIsSubmittingRepair(true);
                     setTimeout(() => {
                        // 模拟发送到后台管理系统的逻辑
                        console.log('Admin Notification: New SOP Improvement Suggestion Received', {
                           guideId: selectedGuide.id,
                           faultCode: selectedGuide.faultCode,
                           engineer: MOCK_USER.name,
                           suggestion: repairActionText,
                           photos: repairPhotos,
                           source: submissionSource,
                           context: {
                              deviceId: selectedDevice?.id,
                              faultCode: selectedGuide.faultCode,
                              lastStepId: sortedSteps[activeGuideStepIdx]?.id,
                              isNewIssue: isNewIssue
                           }
                        });

                        alert(`您的维修记录（来源：${submissionSource}${isNewIssue ? ' | 标记为新问题' : ''}）与优化建议已同步至后台管理系统。管理员将根据您的反馈进一步完善 SOP 内容，感谢您的贡献！`);
                        setIsSubmittingRepair(false);
                        setRepairActionText('');
                        setRepairPhotos([]);
                        setSubmissionSource(null);
                        setIsNewIssue(false);
                        setStep('SCAN');
                     }, 1500);
                  }}
                  className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center space-x-2 active:scale-95 transition-all ${!repairActionText.trim() || isSubmittingRepair ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-black'}`}
                >
                   {isSubmittingRepair ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   ) : (
                      <>
                         <Send size={18} />
                         <span>确认提交执行记录</span>
                      </>
                   )}
                </button>
             </div>
          </div>
       );
    }

    if (step === 'SUBMIT_INQUIRY' && selectedGuide) {
       const currentStep = selectedGuide.steps[activeGuideStepIdx];
       return (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between py-2 border-b border-slate-100 mb-4 bg-slate-50 shrink-0">
                <button onClick={() => setStep('GUIDE')} className="p-2 text-slate-500"><ArrowLeft size={20}/></button>
                <div className="flex items-center space-x-2">
                   <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md"><MessageSquare size={18} /></div>
                   <span className="font-black text-sm text-slate-900">现场疑问反馈</span>
                </div>
                <div className="w-10"></div>
             </div>
             <div className="flex-1 space-y-6 overflow-y-auto scrollbar-hide pb-20">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">当前步骤内容</p>
                   <h4 className="text-sm font-black text-slate-800">{currentStep.title}</h4>
                   <p className="text-[11px] text-slate-500 line-clamp-2 italic">{currentStep.description}</p>
                </div>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">详细描述您的问题</label>
                      <textarea 
                        value={inquiryText}
                        onChange={(e) => setInquiryText(e.target.value)}
                        placeholder="请具体说明在该步骤操作中遇到的难点或不一致之处..." 
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs min-h-[160px] outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                      />
                   </div>

                   <div className="flex items-center space-x-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                      <input 
                        type="checkbox" 
                        id="newInquiryIssueCheck"
                        checked={isNewIssue}
                        onChange={(e) => setIsNewIssue(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <label htmlFor="newInquiryIssueCheck" className="text-[11px] font-black text-rose-600">
                        这是 SOP 中未提到的全新情况（标记为脱离步骤的新发现）
                      </label>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">附件/现场照片 (可选)</label>
                      {inquiryPhoto ? (
                         <div className="relative group">
                            <img src={inquiryPhoto} className="w-full h-40 object-cover rounded-2xl border-2 border-emerald-500 shadow-lg" alt="现场照片" />
                            <button onClick={() => setInquiryPhoto(null)} className="absolute top-2 right-2 p-1.5 bg-white text-rose-500 rounded-full shadow-md"><X size={16}/></button>
                         </div>
                      ) : (
                         <button onClick={handleInquiryPhoto} className="w-full p-10 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all bg-white">
                            <Camera size={32} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">拍照或上传现场图片</span>
                         </button>
                      )}
                   </div>
                </div>
             </div>
             <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-30">
                <button 
                  disabled={!inquiryText.trim() || isSubmittingInquiry}
                  onClick={handleSubmitInquiry}
                  className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center space-x-2 active:scale-95 transition-all ${!inquiryText.trim() || isSubmittingInquiry ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                >
                   {isSubmittingInquiry ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Send size={18} /><span>提交至后台记录</span></>}
                </button>
             </div>
          </div>
       );
    }

    return <div className="p-10 text-center text-slate-400 text-xs">加载中...</div>;
  };

  return (
    <div className="flex justify-center items-center py-4 min-h-[calc(100vh-140px)]">
      <div className="relative border-slate-900 bg-slate-900 border-[10px] rounded-[4rem] h-[740px] w-[350px] shadow-2xl overflow-hidden hidden md:block">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-[1.5rem] z-[120] flex items-center justify-center space-x-2"><div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div><div className="w-10 h-1 bg-slate-800 rounded-full"></div></div>
        <div className="w-full h-full bg-slate-50 overflow-y-auto scrollbar-hide rounded-[3.2rem] pt-8 relative flex flex-col"><div className="px-4 flex-1 flex flex-col overflow-hidden relative">{renderContent()}</div></div>
      </div>
      <div className="md:hidden w-full px-4 h-[740px] bg-slate-50 overflow-y-auto rounded-3xl shadow-lg border border-slate-200 relative flex flex-col"><div className="pt-8 flex-1 flex flex-col overflow-hidden">{renderContent()}</div></div>
      
      {previewPdfUrl && <PDFPreviewModal url={previewPdfUrl} onClose={() => setPreviewPdfUrl(null)} />}
      
      {/* 报修申请详情弹窗 - 移至最外层确保显示 */}
      {viewingRequest && (
        <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-md flex items-end animate-in fade-in duration-300 p-4">
          <div className="w-full max-w-[350px] mx-auto bg-white rounded-t-[3rem] rounded-b-[3rem] md:rounded-b-none shadow-2xl flex flex-col max-h-[90%] animate-in slide-in-from-bottom-full duration-500 overflow-hidden mb-4 md:mb-0">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                  <ClipboardList size={20}/>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">报修申请详情</h3>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">单号: {viewingRequest.id}</p>
                </div>
              </div>
              <button onClick={() => setViewingRequest(null)} className="p-2.5 bg-slate-100 rounded-full text-slate-500 active:scale-90 transition-transform">
                <X size={20}/>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pb-10">
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">报修机台</p>
                        <p className="text-xs font-black text-slate-800">{viewingRequest.deviceName}</p>
                        <p className="text-[8px] font-mono text-slate-400 mt-0.5">{viewingRequest.deviceSN}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">报修时间</p>
                        <p className="text-xs font-black text-slate-800">{viewingRequest.requestTime}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">故障分类</p>
                        <p className="text-xs font-black text-slate-800">
                          {MOCK_GUIDES.find(g => g.deviceId === viewingRequest.deviceId && g.faultCode === viewingRequest.faultCode)?.faultCategory || '一般故障'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">报修类型</p>
                        <p className="text-xs font-black text-blue-600">
                          {viewingRequest.priority === 'high' ? '紧急报修' : '普通报修'}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-md">{viewingRequest.faultCode}</span>
                          <h4 className="text-[10px] font-black text-blue-900 uppercase">故障描述</h4>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase ${
                          viewingRequest.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {viewingRequest.priority === 'high' ? '紧急处理' : '普通维修'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed italic">
                        "{viewingRequest.description}"
                      </p>
                    </div>

                {viewingRequest.photos && viewingRequest.photos.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[9px] text-slate-400 font-black uppercase px-1 flex items-center">
                      <ImageIcon size={12} className="mr-1" /> 现场报修图片
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {viewingRequest.photos.map((url: string, index: number) => (
                        <div key={index} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm active:scale-95 transition-transform cursor-pointer">
                          <img src={url} alt={`报修现场-${index}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  <p className="text-[9px] text-slate-400 font-black uppercase px-1">报修人信息</p>
                  <div className="flex items-center p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mr-3 font-black text-sm">
                      {viewingRequest.requester.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-800">{viewingRequest.requester}</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">现场工程师 / 生产线</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
              <button 
                onClick={() => setViewingRequest(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <span>关闭详情</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PDFPreviewModal: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => (
  <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
    <div className="p-4 flex items-center justify-between text-white border-b border-white/10">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-rose-500 rounded-xl"><FileText size={20}/></div>
        <div>
          <h3 className="text-sm font-black">技术文档预览</h3>
          <p className="text-[10px] opacity-60">Technical_Manual.pdf</p>
        </div>
      </div>
      <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={24}/></button>
    </div>
    <div className="flex-1 bg-slate-800 flex items-center justify-center p-4">
      {/* 模拟 PDF 渲染 */}
      <div className="w-full max-w-lg aspect-[1/1.414] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden relative group">
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
           <div className="text-center p-10">
              <ExternalLink size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">正在尝试在外部浏览器打开...</p>
              <a href={url} target="_blank" rel="noreferrer" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase">手动跳转</a>
           </div>
        </div>
        <div className="p-10 space-y-6">
           <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
           <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
           <div className="space-y-3 pt-10">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-2 bg-slate-50 rounded-full" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
              ))}
           </div>
           <div className="aspect-video bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
              <ImageIcon size={48} className="text-slate-100" />
           </div>
        </div>
      </div>
    </div>
    <div className="p-6 bg-slate-900 border-t border-white/10 text-center">
      <p className="text-[10px] text-white/40 font-bold mb-4 uppercase tracking-widest">该文档已由加密通道传输，严禁外传</p>
      <button onClick={onClose} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">退出预览</button>
    </div>
  </div>
);

export default EngineerApp;
