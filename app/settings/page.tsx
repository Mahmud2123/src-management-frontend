'use client';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Bell, Lock, User, Palette } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <User className="text-green-600" />
            <h2 className="text-xl font-bold">Profile Settings</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Display Name" placeholder="Your Name" />
            <Input label="Phone Number" placeholder="+234..." />
          </div>
        </Card>

        {/* Security Section */}
        <Card className="p-6 border-red-100">
          <div className="flex items-center gap-4 mb-6 text-red-600">
            <Lock />
            <h2 className="text-xl font-bold">Security</h2>
          </div>
          <div className="space-y-4">
            <Input type="password" label="Current Password" />
            <div className="grid grid-cols-2 gap-4">
              <Input type="password" label="New Password" />
              <Input type="password" label="Confirm New Password" />
            </div>
            <Button className="bg-red-600 text-white hover:bg-red-700">Update Password</Button>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6 text-blue-600">
            <Bell />
            <h2 className="text-xl font-bold">Notifications</h2>
          </div>
          <div className="space-y-3">
            {['Email updates on complaint status', 'New comment alerts', 'System announcements'].map((pref, i) => (
              <label key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-green-600" />
                <span className="text-sm font-medium">{pref}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}