'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { use, useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import LoadingState from '@/components/LoadingState';
import { toast } from 'sonner';
import { fetchUserById, resetUserPassword, updateUser } from '@/lib/api';
import EditUserModal from '@/components/EditUserModal';
import AvatarImage from '@/components/AvatarImage';

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // `params` may be a Promise in some Next.js versions; unwrap safely using React.use
  const p = use(params as any) as { id: string };
  const id = p?.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUserById(id),
  });

  const resetMutation = useMutation({
    mutationFn: () => resetUserPassword(id),
    onSuccess: (data: any) => {
      toast.success('Password reset. Temporary password delivered.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
    onError: (err: any) => {
      toast.error('Failed to reset password', { description: err?.response?.data?.message || err.message });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => updateUser(id, { isActive: false }),
    onSuccess: () => {
      toast.success('User deactivated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      router.push('/users');
    },
    onError: (err: any) => {
      toast.error('Failed to deactivate user', { description: err?.response?.data?.message || err.message });
    },
  });

  if (isLoading) return <LoadingState message="Loading user profile..." />;
  if (!user) return <div className="p-6">User not found</div>;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto bg-gray-100">
            {/* Always attempt to load the avatar via the backend redirect endpoint. If it fails, AvatarImage shows a graceful initial fallback. */}
            {/* AvatarImage handles its own onError and fallback state so we don't rely on user.avatarUrl presence. */}
            <div className="w-full h-full">
              {/* AvatarImage is a client-side component that renders an <img> and falls back to initials on error */}
              {/* Import is at top of file; kept as relative to components folder */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <AvatarImage userId={id} name={user.name} className="w-full h-full" size="128" />
            </div>
            </div>
            <p className="mt-3 font-semibold text-lg">{user.name}</p>
            <p className="text-sm text-gray-500">{user.role}</p>
          </div>

          <div className="w-full md:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Phone</p>
                <p className="font-medium">{user.phoneNumber || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Student ID</p>
                <p className="font-medium">{user.studentId || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Level</p>
                <p className="font-medium">{user.level ? (typeof user.level === 'number' ? `${user.level}L` : user.level) : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Department</p>
                <p className="font-medium">{user.department?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Status</p>
                <p className="font-medium">{user.isActive ? 'Active' : 'Deactivated'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Created</p>
                <p className="font-medium">{new Date(user.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => setEditing(true)} className="bg-blue-700 text-white">Edit</Button>
              <Button onClick={() => {
                if (confirm(`Reset password for ${user.name}? This will set a temporary password.`)) {
                  resetMutation.mutate();
                }
              }} variant="secondary">Reset Password</Button>
              <Button onClick={() => deactivateMutation.mutate()} variant="danger">Deactivate</Button>
            </div>
          </div>
        </Card>

        {editing && (
          <EditUserModal
            user={user}
            onClose={() => setEditing(false)}
            onSuccess={() => {
              setEditing(false);
              queryClient.invalidateQueries({ queryKey: ['user', id] });
              queryClient.invalidateQueries({ queryKey: ['users'] });
            }}
            updateUserMutation={{
              mutationFn: ({ userId, data }: any) => updateUser(userId, data),
            } as any}
          />
        )}
      </div>
    </div>
  );
}
