'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lightbulb, ArrowBigUp, User, MessageSquare, Plus, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/Button';
import { fetchSuggestions, toggleSuggestionUpvote, verifySuggestion } from '@/lib/api';
import SuggestionSkeleton from './SuggestionSkeleton';
import { useAuth } from '@/providers/auth';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SuggestionFeed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: fetchSuggestions
  });

  const { mutate: handleUpvote } = useMutation({
    mutationFn: toggleSuggestionUpvote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suggestions'] }),
    onError: (error: any) => {
      toast.error(error.customMessage || 'Failed to upvote');
    }
  });

  const { mutate: handleVerify } = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'APPROVED' | 'REJECTED' }) => 
      verifySuggestion(id, status),
    onSuccess: () => {
      toast.success('Suggestion updated');
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
    onError: (error: any) => {
      toast.error(error.customMessage || 'Failed to update suggestion');
    }
  });
  
  if (isLoading || !suggestions) return <SuggestionSkeleton />;

  const suggestionsArray = Array.isArray(suggestions) ? suggestions : (suggestions as any)?.data || [];
  const canModerate = ['ADMIN', 'SRC_MEMBER', 'SRC_EXECUTIVE'].includes(user?.role || '');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="text-yellow-500" /> Suggestion Box
          </h1>
          <p className="text-gray-500 text-sm">Community-driven ideas for SZU.</p>
        </div>
        
        {user?.role === 'STUDENT' && (
          <Button onClick={() => window.location.href = '/suggestions/create'} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" /> Share Idea
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {suggestionsArray.map((suggestion: any) => (
          <div key={suggestion.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex gap-4">
              {/* Voting */}
              <div className="flex flex-col items-center gap-1">
                <button 
                  onClick={() => handleUpvote(suggestion.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    suggestion.hasUpvoted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <ArrowBigUp className="w-6 h-6" fill={suggestion.hasUpvoted ? "currentColor" : "none"} />
                </button>
                <span className="font-bold text-lg">{suggestion._count?.upvotes || 0}</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    suggestion.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                    suggestion.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {suggestion.status}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {formatDistanceToNow(new Date(suggestion.createdAt))} ago
                  </span>
                </div>

                <Link href={`/suggestions/${suggestion.id}`} className="group">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    {suggestion.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{suggestion.description}</p>
                </Link>

                {/* MODERATION BUTTONS (Visible to Admin/SRC) */}
                {canModerate && suggestion.status === 'PENDING' && (
                  <div className="flex gap-2 mb-4">
                    <Button 
                      onClick={() => handleVerify({ id: suggestion.id, status: 'APPROVED' })}
                      className="flex-1 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => handleVerify({ id: suggestion.id, status: 'REJECTED' })}
                      className="flex-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="w-3 h-3 text-gray-400" />
                    {suggestion.isAnonymous ? 'Anonymous' : suggestion.author?.name}
                  </div>
                  
                  <Link 
                    href={`/suggestions/${suggestion.id}`} 
                    className="flex items-center gap-1.5 text-xs font-bold text-green-600 hover:underline"
                  >
                    <MessageSquare className="w-4 h-4" /> 
                    Discussion ({suggestion._count?.comments || 0})
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}