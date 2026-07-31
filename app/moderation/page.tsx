'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchModerationQueue,
  verifyComplaint,
  rejectComplaint,
} from '@/lib/api';
import { triggerSuccessConfetti } from '@/lib/celebrate';
import SuggestionSkeleton from '@/app/suggestions/SuggestionSkeleton';
import {
  ShieldCheck,
  CheckCircle,
  MapPin,
  User,
  XCircle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ModerationPage() {
  const queryClient = useQueryClient();
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: queue, isLoading } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: fetchModerationQueue,
  });

  const closeModal = () => {
    setRejectModalId(null);
    setRejectionReason('');
  };

  // Complaint Mutations
  const complaintMutation = useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: 'VERIFY' | 'REJECT';
      reason?: string;
    }) =>
      action === 'VERIFY' ? verifyComplaint(id) : rejectComplaint(id, reason),
    onSuccess: (_, variables) => {
      if (variables.action === 'VERIFY') {
        triggerSuccessConfetti();
        toast.success('Complaint verified and escalated!');
      } else {
        toast.success('Complaint rejected - student has been notified');
      }
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (error: any) => {
      toast.error(error.customMessage || 'Action failed');
    },
  });

  if (isLoading)
    return (
      <div className="p-8">
        <SuggestionSkeleton />
      </div>
    );

  const complaints = queue?.complaints || queue?.pendingComplaints || [];

  return (
    <>
      {/* Rejection Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold">Reject Submission?</h2>
            </div>
            <p className="text-gray-500 mb-6 text-sm">
              Please provide a detailed reason. This will be sent to the student as a notification.
            </p>

            <textarea
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-red-500 min-h-[120px] mb-6 outline-none resize-none text-gray-900"
              placeholder="e.g., Incomplete details provided, please resubmit with more information..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-4 font-bold text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (rejectModalId && rejectionReason.trim()) {
                    complaintMutation.mutate({
                      id: rejectModalId,
                      action: 'REJECT',
                      reason: rejectionReason.trim(),
                    });
                  }
                }}
                disabled={!rejectionReason.trim() || complaintMutation.isPending}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-all"
              >
                {complaintMutation.isPending ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Complaint Moderation</h1>
              <p className="text-gray-500 text-sm">
                Review, verify, and resolve filed student complaints.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-xl text-sm border border-indigo-100 self-start md:self-auto">
            <span>Pending Review:</span>
            <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
              {complaints.length}
            </span>
          </div>
        </div>

        {/* Informational Notice */}
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-900">
            <span className="font-semibold">Note:</span> Complaints are logged here for verification, official tracking, and escalation to the appropriate authorities.
          </div>
        </div>

        {complaints.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-gray-500 font-medium">No pending complaints to moderate. All clear!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {complaints.map((item: any) => {
              const isRejected = item.status === 'REJECTED';
              const isResolved = item.status === 'RESOLVED';
              const isVerified = item.isVerified || item.isApproved;
              const isLocked = isRejected || isResolved || isVerified;

              return (
                <div
                  key={item.id}
                  className={`bg-white border border-gray-100 rounded-3xl p-6 shadow-sm transition-all ${
                    isRejected ? 'opacity-60 bg-gray-50/80 border-red-100' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider bg-red-50 text-red-600">
                          {item.category?.name || 'Complaint'}
                        </span>

                        {/* Status Badges */}
                        {isRejected && (
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-red-100 text-red-700 uppercase">
                            Rejected
                          </span>
                        )}
                        {isVerified && (
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-100 text-emerald-700 uppercase">
                            Verified
                          </span>
                        )}

                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <User className="w-3 h-3" /> {item.isAnonymous ? 'Anonymous' : item.author?.name}
                        </span>
                      </div>

                      <h3
                        className={`text-xl font-bold mb-2 ${
                          isRejected ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.location || 'Campus Wide'}
                        </span>
                        {item.author?.department?.name && (
                          <span className="font-medium text-indigo-600/60 uppercase">
                            {item.author.department.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Block */}
                    <div className="flex md:flex-col justify-end gap-3 min-w-[160px]">
                      <button
                        onClick={() =>
                          complaintMutation.mutate({ id: item.id, action: 'VERIFY' })
                        }
                        disabled={complaintMutation.isPending || isLocked}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>{isVerified ? 'Verified' : 'Acknowledge'}</span>
                      </button>

                      <button
                        onClick={() => setRejectModalId(item.id)}
                        disabled={complaintMutation.isPending || isLocked}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>{isRejected ? 'Rejected' : 'Flag / Reject'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}