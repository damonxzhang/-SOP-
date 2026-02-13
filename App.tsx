
import React, { useState, useRef, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { User, Role } from './types';
import { MOCK_USER } from './constants';
import EngineerApp from './views/App/EngineerApp';
import AdminDashboard from './views/Admin/AdminDashboard';
import { Shield, User as UserIcon, LogOut, ChevronDown, Radio, Smartphone, CreditCard } from 'lucide-react';

const roleDisplay: Record<Role, string> = {
  [Role.JUNIOR_ENGINEER]: '初级工程师',
  [Role.SENIOR_ENGINEER]: '高级工程师',
  [Role.OUTSOURCED_ENGINEER]: '外包工程师',
  [Role.ADMIN]: '系统管理员',
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null); // 修改为默认未登录以演示
  const [viewMode, setViewMode] = useState<'APP' | 'ADMIN'>('APP');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans">
        {/* 背景装饰元素 */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
        
        <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden relative z-10 m-6">
          
          {/* 左侧：品牌与宣传 */}
          <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-blue-600/20 to-transparent border-r border-white/5">
            <div>
              <div className="flex items-center space-x-3 mb-12">
                <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">维修SOP系统</span>
              </div>
              
              <h2 className="text-5xl font-black text-white leading-tight mb-6">
                数字化驱动<br />
                <span className="text-blue-400">卓越运维</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                专为精密制造设计的标准化作业平台。沉淀专家经验，赋能一线生产，构建安全、高效、透明的维保体系。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-3xl font-black text-white mb-1">98.2%</p>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">SOP 依同率</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white mb-1">-24%</p>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">平均修复时间</p>
              </div>
            </div>
          </div>

          {/* 右侧：登录表单 */}
          <div className="p-10 lg:p-20 flex flex-col justify-center bg-white/5">
            <div className="lg:hidden flex items-center space-x-3 mb-12 justify-center">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">维修SOP系统</span>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-black text-white mb-3 tracking-tight">欢迎回来</h1>
              <p className="text-slate-400 font-medium">请验证您的身份以访问安全运维管理门户</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">身份凭证</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <UserIcon size={18} />
                  </div>
                  <input 
                    type="text" 
                    readOnly
                    value="ZHAO.RUI (Admin)"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-inner cursor-default"
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  setCurrentUser(MOCK_USER);
                  if (MOCK_USER.role === Role.ADMIN) setViewMode('ADMIN');
                }}
                className="group relative w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center justify-center">
                  进入管理系统 <ChevronDown className="ml-2 rotate-[-90deg]" size={16} />
                </span>
              </button>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">服务器状态: 正常</span>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">V 1.2.20260212</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部装饰 */}
        <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
          © 2026 NXP SEMICONDUCTORS · 数字化运维实验室
        </p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight leading-none">维修SOP系统</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mt-0.5">V 1.1.20260213.002</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('APP')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'APP' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  PDA端
                </button>
                <button 
                  onClick={() => setViewMode('ADMIN')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'ADMIN' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  管理后台
                </button>
              </div>
              
              <div className="h-8 w-px bg-slate-200" />
              
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{roleDisplay[currentUser.role]}</p>
                  </div>
                  <div className="relative">
                    <img className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white shadow-sm" src={currentUser.avatar || "https://picsum.photos/100/100"} alt="" />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
                      <ChevronDown size={10} className={`text-slate-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[60] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">个人账户</p>
                  <p className="text-sm font-bold text-slate-900">{currentUser.employeeId}</p>
                </div>
                
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    if(confirm('确定要退出登录吗？')) {
                      setCurrentUser(null);
                    }
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="font-semibold">退出登陆</span>
                </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 px-4">
          {viewMode === 'APP' ? <EngineerApp /> : <AdminDashboard />}
        </main>
      </div>
    </Router>
  );
};

export default App;
