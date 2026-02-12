
import React, { useState, useRef, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { User, Role } from './types';
import { MOCK_USER } from './constants';
import EngineerApp from './views/App/EngineerApp';
import AdminDashboard from './views/Admin/AdminDashboard';
import { Shield, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

const roleDisplay: Record<Role, string> = {
  [Role.JUNIOR_ENGINEER]: '初级工程师',
  [Role.SENIOR_ENGINEER]: '高级工程师',
  [Role.OUTSOURCED_ENGINEER]: '外包工程师',
  [Role.ADMIN]: '系统管理员',
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USER);
  const [viewMode, setViewMode] = useState<'APP' | 'ADMIN'>(MOCK_USER.role === Role.ADMIN ? 'ADMIN' : 'APP');
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <Shield className="w-16 h-16 mx-auto text-blue-500" />
          <h1 className="text-3xl font-bold">维修SOP系统</h1>
          <p className="text-slate-400">安全运维管理门户</p>
          <button 
            onClick={() => setCurrentUser(MOCK_USER)}
            className="w-full py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            以 张技术员 身份登录 (演示)
          </button>
        </div>
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
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mt-0.5">V 1.1.20260212.003</span>
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
