'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { User, Shield, Key } from 'lucide-react';

export default function AccountPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <User className="w-8 h-8 text-brand-400" />
          Account Settings
        </h1>
        <p className="text-sm text-slate-400">Manage your profile, login security, and role permissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1 p-6 text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-2xl font-extrabold text-white shadow-xl">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user?.name || 'Mohammed Katanani'}</h3>
            <p className="text-xs text-slate-400">{user?.email || 'user@example.com'}</p>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider">
              {user?.role || 'STUDENT'}
            </span>
          </div>
        </Card>

        {/* Profile Settings Form */}
        <Card className="md:col-span-2 p-6 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-400" />
            Profile Details
          </h2>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <Input label="Full Name" defaultValue={user?.name || 'Mohammed Katanani'} />
            <Input label="Email Address" defaultValue={user?.email || 'user@example.com'} type="email" />

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Change Password
              </h3>
              <Input label="Current Password" type="password" placeholder="••••••••" />
              <Input label="New Password" type="password" placeholder="••••••••" />
            </div>

            <Button type="submit" className="w-full">
              Update Account
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
