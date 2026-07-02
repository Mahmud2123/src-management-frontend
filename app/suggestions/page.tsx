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
import { motion, AnimatePresence } from 'framer-motion';

export default function SuggestionFeed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: fetchSuggestions
  });

  const { mutate: handleUpvote } = useMutation({
    mutationFn: toggleSuggestionUpvote,
    
      queryClient.setQueryData(['suggestions'], (old: any) => {
        if (!old) return [];
        return old.map((s: any) =>
          s.id === suggestionId
            ? { 
                ...s, 
                hasUpvoted: !s.hasUpvoted 
              }
            : s
        );
      });
  
    onError: (error: any, suggestionId, context) => {
      if (context?.previousSuggestions) {
        queryClient.setQueryData(['suggestions'], context.previousSuggestions);
      }
      toast.error(error.customMessage || 'Failed to sync upvote');
    },
  
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
            <Plus className="w-4 h-4 mr-2" /> Share Idea
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {suggestionsArray.map((suggestion: any) => (

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    {formatDistanceToNow(new Date(suggestion.createdAt))} ago
                  </span>
                </div>

                <Link href={`/suggestions/${suggestion.id}`} className="group">
                {canModerate && suggestion.status === 'PENDING' && (
                  <div className="flex gap-2 mb-4">
                    <Button 
                      onClick={() => handleVerify({ id: suggestion.id, status: 'APPROVED' })}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => handleVerify({ id: suggestion.id, status: 'REJECTED' })}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
                
                    {suggestion.isAnonymous ? 'Anonymous' : suggestion.author?.name}
                  </div>
                  
                  <Link 
                    href={`/suggestions/${suggestion.id}`} 
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