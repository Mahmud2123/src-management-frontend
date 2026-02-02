'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { 
  MessageSquare, Send, CheckCircle, XCircle, 
  ArrowLeft, User, Clock, Lightbulb 
} from 'lucide-react';
import { fetchSuggestionById, addSuggestionComment, verifySuggestion } from '@/lib/index';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function SuggestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  // 1. Fetch Suggestion Data
  const { data: suggestion, isLoading, isError } = useQuery({
    queryKey: ['suggestion', id],
    queryFn: () => fetchSuggestionById(id),
  });

  // 2. Add Comment Mutation
  const commentMutation = useMutation({
    mutationFn: (content: string) => addSuggestionComment(id, content),
    onSuccess: () => {
      setCommentText('');
      toast.success('Comment posted');
      queryClient.invalidateQueries({ queryKey: ['suggestion', id] });
    },
    onError: (error: any) => {
      toast.error(error.customMessage || 'Failed to post comment');
    }
  });

  // 3. Verify Mutation
  const verifyMutation = useMutation({
    mutationFn: (status: 'APPROVED' | 'REJECTED') => verifySuggestion(id, status),
    onSuccess: (updated) => {
      toast.success(`Suggestion ${updated.status.toLowerCase()}`);
      queryClient.invalidateQueries({ queryKey: ['suggestion', id] });
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
    onError: (error: any) => {
      toast.error(error.customMessage || 'Failed to update suggestion');
    }
  });

  if (isLoading) return <div className="p-10 text-center animate-pulse">Loading discussion...</div>;
  if (isError || !suggestion) return <div className="p-10 text-center text-red-500">Suggestion not found.</div>;

  const canModerate = ['ADMIN', 'SRC_MEMBER', 'SRC_EXECUTIVE'].includes(user?.role || '');

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 min-h-screen pb-20">
      <Button variant="secondary" onClick={() => router.back()} className="hover:bg-transparent -ml-4 text-gray-500">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Box
      </Button>

      {/* Main Suggestion Card */}
      <Card className="p-8 border-none shadow-xl bg-white rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-yellow-100 rounded-2xl">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{suggestion.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={suggestion.status === 'APPROVED' ? 'bg-green-100 text-green-700' : suggestion.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}>
                {suggestion.status}
              </Badge>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(suggestion.createdAt))} ago
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
          {suggestion.description}
        </p>

        <div className="mt-8 pt-6 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Proposed by {suggestion.isAnonymous ? 'Anonymous' : suggestion.author?.name}
            </span>
          </div>
        </div>
      </Card>

      {/* Admin Verification Bar */}
      {canModerate && suggestion.status === 'PENDING' && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-3xl shadow-lg flex items-center justify-between text-white">
          <div>
            <p className="font-bold">Awaiting Approval</p>
            <p className="text-xs text-green-100 italic">Does this idea meet university guidelines?</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => verifyMutation.mutate('APPROVED')}
              disabled={verifyMutation.isPending}
              className="bg-white text-green-700 hover:bg-green-50 shadow-sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Approve
            </Button>
            <Button 
              variant="secondary"
              onClick={() => verifyMutation.mutate('REJECTED')}
              disabled={verifyMutation.isPending}
              className="bg-red-500/20 text-white border-none hover:bg-red-500/40"
            >
              <XCircle className="w-4 h-4 mr-2" /> Reject
            </Button>
          </div>
        </div>
      )}

      {/* Discussion Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2 px-2">
          <MessageSquare className="text-green-600" /> 
          Community Discussion ({suggestion.comments?.length || 0})
        </h3>

        {/* Comment Input */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <textarea
            className="w-full bg-gray-50 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-green-500 outline-none border-none transition-all"
            placeholder="Add your voice to this proposal..."
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <div className="flex justify-end mt-3">
            <Button 
              disabled={!commentText.trim() || commentMutation.isPending}
              onClick={() => commentMutation.mutate(commentText)}
              className="rounded-full px-6 bg-green-600"
            >
              {commentMutation.isPending ? 'Posting...' : <><Send className="w-4 h-4 mr-2" /> Post Comment</>}
            </Button>
          </div>
        </div>

        {/* Comment Thread */}
        <div className="space-y-4">
          {suggestion.comments?.map((c: any) => (
            <div key={c.id} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 shrink-0 font-bold">
                {c.author?.name?.charAt(0)}
              </div>
              <div className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-50 transition-all hover:border-green-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">{c.author?.name}</span>
                  <span className="text-[10px] text-gray-400">
                    {formatDistanceToNow(new Date(c.createdAt))} ago
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}