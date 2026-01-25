'use client';
import { useAuth } from '@/providers/auth';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Shield, User, Key, Mail, MapPin, Badge } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ current: '', next: '' });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Password updated successfully!");
  };
  console.log(user);
  

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {user?.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
          <Badge className="bg-green-100 text-green-700 border-green-200">
            {user?.role.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 space-y-6 border-0 shadow-lg">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500">Email Address</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500">Department</p>
              <p className="font-medium">{user?.department?.name || 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500">Student ID</p>
              <p className="font-medium">{user?.studentId || 'N/A'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6 border-0 shadow-lg border-t-4 border-t-green-600">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Key className="w-5 h-5 text-green-600" /> Security
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input 
              type="password" 
              label="New Password" 
              placeholder="Min. 8 characters"
              onChange={(e) => setPasswords({...passwords, next: e.target.value})}
            />
            <Button className="w-full bg-green-600">Update Password</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}