import React, { useState } from 'react'
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react'
import { User as UserType, Role } from '../../types'

interface LoginPageProps {
  onLoginSuccess: (user: UserType) => void
}

interface LoginResponse {
  code: number
  message: string
  data: {
    token: string
    expire_at: string
    user_info: {
      id: string
      username: string
      employee_id: string
      name: string
      role: string
      department?: string
      status: string
      avatar?: string
      permissions: Record<string, string>
      last_login?: string
    }
  }
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Bypass username and password validation for testing purposes
    // if (!username.trim() || !password.trim()) {
    //   setError('请输入用户名和密码')
    //   return
    // }

    setLoading(true)

    try {
      // Bypass login API for testing purposes
      const mockAdminUser: UserType = {
        id: 'mock-admin-id',
        name: '模拟管理员',
        role: Role.ADMIN,
        employeeId: 'NXP-ADMIN-001',
        department: '管理部',
        status: 'active',
        lastLogin: new Date().toISOString(),
        avatar: '',
        assignedDeviceIds: [],
        permissions: {
          dashboard: 'manage',
          sopLibrary: 'manage',
          userManagement: 'manage',
          records: 'manage',
          notifications: 'manage'
        }
      }

      // Save mock user to localStorage
      localStorage.setItem('sop_token', 'mock-token-for-admin')
      localStorage.setItem('sop_expire_at', new Date(Date.now() + 3600 * 1000).toISOString()) // 1 hour expiration

      localStorage.setItem('sop_current_user', JSON.stringify(mockAdminUser))

      onLoginSuccess(mockAdminUser)
    } catch (err) {
      setError('网络错误，请检查服务器连接')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const mapRole = (role: string): Role => {
    switch (role) {
      case 'ADMIN':
        return Role.ADMIN
      case 'SENIOR_ENGINEER':
        return Role.SENIOR_ENGINEER
      case 'OUTSOURCED_ENGINEER':
        return Role.OUTSOURCED_ENGINEER
      default:
        return Role.JUNIOR_ENGINEER
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Logo and Title */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4'>
            <Shield className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-slate-900'>维修SOP系统</h1>
          <p className='text-slate-500 mt-1'>请登录以继续</p>
        </div>

        {/* Login Card */}
        <div className='bg-white rounded-3xl shadow-xl p-8'>
          <form onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className='mb-5'>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>
                用户名
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className='h-5 w-5 text-slate-400' />
                </div>
                <input
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400'
                  placeholder='请输入用户名'
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className='mb-6'>
              <label className='block text-sm font-semibold text-slate-700 mb-2'>
                密码
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-slate-400' />
                </div>
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder-slate-400'
                  placeholder='请输入密码'
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className='mb-5 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-600 text-sm'>
                <AlertCircle className='h-4 w-4 flex-shrink-0' />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading}
              className='w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
            >
              {loading ? (
                <>
                  <Loader2 className='h-5 w-5 animate-spin' />
                  <span>登录中...</span>
                </>
              ) : (
                <span>登录</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className='text-center text-slate-400 text-sm mt-6'>
          V 1.2.20260320.001
        </p>
      </div>
    </div>
  )
}

export default LoginPage
