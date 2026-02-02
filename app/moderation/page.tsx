'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchModerationQueue, 
  verifyComplaint, 
  rejectComplaint,
  verifySuggestionStatus 
} from '@/lib/index';
import { triggerSuccessConfetti } from '@/lib/celebrate';
import SuggestionSkeleton from '@/app/suggestions/SuggestionSkeleton';
import { 
  ShieldCheck, CheckCircle, AlertCircle, MapPin, 
  User, Lightbulb, XCircle 
} from 'lucide-react';
import { toast } from 'sonner';

export default function ModerationPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'complaints' | 'suggestions'>('complaints');
  const [rejectModal, setRejectModal] = useState<{id: string, type: 'complaint' | 'suggestion'} | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: queue, isLoading } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: fetchModerationQueue
  });

  // Complaint Mutations
  const complaintMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string, action: 'VERIFY' | 'REJECT', reason?: string }) => 
      action === 'VERIFY' ? verifyComplaint(id) : rejectComplaint(id, reason),
    onSuccess: (_, variables) => {
      if (variables.action === 'VERIFY') {
        triggerSuccessConfetti();
        toast.success('Complaint verified and escalated!');
      } else {
        toast.success('Complaint rejected - student has been notified');
      }
      setRejectModal(null);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
    },
    onError: (error: any) => {
      toast.error(error.customMessage || 'Action failed');
    }
  });

  // Suggestion Mutations
  const suggestionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'APPROVED' | 'REJECTED' }) => 
      verifySuggestionStatus(id, status),
    onSuccess: (_, variables) => {
      if (variables.status === 'APPROVED') {
        triggerSuccessConfetti();
        toast.success('Suggestion approved!');
      } else {
        toast.success('Suggestion dismissed');
      }
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
    },
    onError: (error: any) => {
      toast.error(error.customMessage || 'Action failed');
    }
  });

  if (isLoading) return <div className="p-8"><SuggestionSkeleton /></div>;

  const complaints = queue?.complaints || [];
  const suggestions = queue?.suggestions || [];
  const currentItems = activeTab === 'complaints' ? complaints : suggestions;

  return (
    <>
      {/* Rejection Modal */}
      {rejectModal && (
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
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-red-500 min-h-[120px] mb-6 outline-none resize-none"
              placeholder="e.g., Incomplete details provided, please resubmit with more information..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              autoFocus
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setRejectModal(null);
                  setRejectionReason('');
                }}
                className="flex-1 py-4 font-bold text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (rejectModal && rejectionReason.trim()) {
                    if (rejectModal.type === 'complaint') {
                      complaintMutation.mutate({ 
                        id: rejectModal.id, 
                        action: 'REJECT', 
                        reason: rejectionReason.trim() 
                      });
                    } else {
                      suggestionMutation.mutate({ 
                        id: rejectModal.id, 
                        status: 'REJECTED' 
                      });
                    }
                  }
                }}
                disabled={!rejectionReason.trim() || complaintMutation.isPending || suggestionMutation.isPending}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-all"
              >
                {complaintMutation.isPending || suggestionMutation.isPending ? 'Processing...' : 'Confirm Rejection'}
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
              <h1 className="text-2xl font-bold">Verification Triage</h1>
              <p className="text-gray-500 text-sm">Review and escalate student submissions.</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('complaints')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'complaints' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'
              }`}
            >
              Complaints ({complaints.length})
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'suggestions' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'
              }`}
            >
              Suggestions ({suggestions.length})
            </button>
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-gray-500 font-medium">Nothing pending in {activeTab}. Good job!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {currentItems.map((item: any) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${
                        activeTab === 'complaints' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {activeTab === 'complaints' ? item.category?.name : 'Suggestion'}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <User className="w-3 h-3" /> {item.isAnonymous ? 'Anonymous' : item.author?.name}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{item.description}</p>
                    
                    {activeTab === 'complaints' && (
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.location || 'Campus Wide'}
                        </span>
                        <span className="font-medium text-indigo-600/60 uppercase">
                          {item.author?.department?.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col justify-end gap-3 min-w-[150px]">
                    {activeTab === 'complaints' ? (
                      <>
                        <button
                          onClick={() => complaintMutation.mutate({ id: item.id, action: 'VERIFY' })}
                          disabled={complaintMutation.isPending}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                        >
                          <CheckCircle className="w-5 h-5" /> 
                          <span>Verify Issue</span>
                        </button>
                        
                        <button
                          onClick={() => setRejectModal({ id: item.id, type: 'complaint' })} 
                          disabled={complaintMutation.isPending}
                          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border border-rose-200"
                        >
                          <XCircle className="w-5 h-5" /> 
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => suggestionMutation.mutate({ id: item.id, status: 'APPROVED' })}
                          disabled={suggestionMutation.isPending}
                          className="flex-1 md:w-36 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                          <Lightbulb className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: item.id, type: 'suggestion' })}
                          disabled={suggestionMutation.isPending}
                          className="flex-1 md:w-36 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 font-bold py-3 px-4 rounded-2xl transition-all border border-gray-200"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}