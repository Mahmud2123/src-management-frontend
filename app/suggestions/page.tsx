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
    
<<<<<<< HEAD
    onMutate: async (suggestionId: string) => {
      await queryClient.cancelQueries({ queryKey: ['suggestions'] });
      const previousSuggestions = queryClient.getQueryData(['suggestions']);
  
=======
    // 1. When the user clicks, update the UI immediately
    onMutate: async (suggestionId: string) => {
      // Stop any active refetches so they don't overwrite our "fake" update
      await queryClient.cancelQueries({ queryKey: ['suggestions'] });
  
      // Save the old data (to rollback if the server fails)
      const previousSuggestions = queryClient.getQueryData(['suggestions']);
  
      // Manually edit the React Query cache
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
      queryClient.setQueryData(['suggestions'], (old: any) => {
        if (!old) return [];
        return old.map((s: any) =>
          s.id === suggestionId
            ? { 
                ...s, 
<<<<<<< HEAD
                _count: {
                  ...s._count,
                  upvotes: s.hasUpvoted ? s._count.upvotes - 1 : s._count.upvotes + 1
                },
=======
                upvotesCount: s.hasUpvoted ? s.upvotesCount - 1 : s.upvotesCount + 1,
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
                hasUpvoted: !s.hasUpvoted 
              }
            : s
        );
      });
  
<<<<<<< HEAD
      return { previousSuggestions };
    },
  
=======
      // Return the "backup" so onError can use it
      return { previousSuggestions };
    },
  
    // 2. If the server says "No" (error), put the old data back
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
    onError: (error: any, suggestionId, context) => {
      if (context?.previousSuggestions) {
        queryClient.setQueryData(['suggestions'], context.previousSuggestions);
      }
      toast.error(error.customMessage || 'Failed to sync upvote');
    },
  
<<<<<<< HEAD
    onSuccess: (data, variables) => {
      console.log('Upvote successful');
    },
  
    onSettled: () => {
      queryClient.refetchQueries({ 
        queryKey: ['suggestions'],
        type: 'inactive'
      });
=======
    // 3. Finally, sync with the server's actual truth
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
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
<<<<<<< HEAD
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-950 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="text-yellow-500" /> Suggestion Box
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Community-driven ideas for SZU.</p>
        </div>
        
        {user?.role === 'STUDENT' && (
          <Button onClick={() => window.location.href = '/suggestions/create'} className="bg-green-600 hover:bg-green-700 text-white">
=======
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
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
            <Plus className="w-4 h-4 mr-2" /> Share Idea
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {suggestionsArray.map((suggestion: any) => (
<<<<<<< HEAD
          <div key={suggestion.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex gap-4">
              {/* Voting */}
              <div className="flex flex-col items-center gap-1">
                <motion.button 
                  whileTap={{ scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleUpvote(suggestion.id)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    suggestion.hasUpvoted 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 shadow-sm' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <motion.div
                    initial={false}
                    animate={{ y: suggestion.hasUpvoted ? -4 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <ArrowBigUp 
                      className="w-6 h-6" 
                      fill={suggestion.hasUpvoted ? "currentColor" : "none"} 
                    />
                  </motion.div>
                </motion.button>

                <AnimatePresence mode="wait">
                  <motion.span 
                    key={suggestion._count?.upvotes}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className={`font-bold text-lg ${
                      suggestion.hasUpvoted 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {suggestion._count?.upvotes || 0}
                  </motion.span>
                </AnimatePresence>
              </div>
=======
          <div key={suggestion.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex gap-4">
             {/* Voting */}
<div className="flex flex-col items-center gap-1">
  <motion.button 
    whileTap={{ scale: 0.8 }} // Shrinks slightly when pressed
    whileHover={{ scale: 1.1 }} // Grows slightly on hover
    onClick={() => handleUpvote(suggestion.id)}
    className={`p-2 rounded-lg transition-all duration-200 ${
      suggestion.hasUpvoted 
        ? 'bg-green-100 text-green-600 shadow-sm' 
        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
    }`}
  >
    <motion.div
      initial={false}
      animate={{ 
        y: suggestion.hasUpvoted ? [0, -4, 0] : 0, // Tiny jump when activated
        transition: { type: "spring", stiffness: 300 } 
      }}
    >
      <ArrowBigUp 
        className="w-6 h-6" 
        fill={suggestion.hasUpvoted ? "currentColor" : "none"} 
      />
    </motion.div>
  </motion.button>

  {/* Number Animation */}
  <AnimatePresence mode="wait">
    <motion.span 
      key={suggestion._count?.upvotes} // Triggers animation whenever number changes
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className={`font-bold text-lg ${suggestion.hasUpvoted ? 'text-green-600' : 'text-gray-900'}`}
    >
      {suggestion._count?.upvotes || 0}
    </motion.span>
  </AnimatePresence>
</div>
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
<<<<<<< HEAD
                    suggestion.status === 'APPROVED' 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 
                    suggestion.status === 'REJECTED' 
                      ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {suggestion.status}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
=======
                    suggestion.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                    suggestion.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {suggestion.status}
                  </span>
                  <span className="text-[10px] text-gray-400">
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
                    {formatDistanceToNow(new Date(suggestion.createdAt))} ago
                  </span>
                </div>

                <Link href={`/suggestions/${suggestion.id}`} className="group">
<<<<<<< HEAD
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {suggestion.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {suggestion.description}
                  </p>
                </Link>

                {/* MODERATION BUTTONS */}
=======
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    {suggestion.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{suggestion.description}</p>
                </Link>

                {/* MODERATION BUTTONS (Visible to Admin/SRC) */}
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
                {canModerate && suggestion.status === 'PENDING' && (
                  <div className="flex gap-2 mb-4">
                    <Button 
                      onClick={() => handleVerify({ id: suggestion.id, status: 'APPROVED' })}
<<<<<<< HEAD
                      className="flex-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50"
=======
                      className="flex-1 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => handleVerify({ id: suggestion.id, status: 'REJECTED' })}
<<<<<<< HEAD
                      className="flex-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50"
=======
                      className="flex-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
                
<<<<<<< HEAD
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <User className="w-3 h-3 text-gray-400 dark:text-gray-500" />
=======
                <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="w-3 h-3 text-gray-400" />
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
                    {suggestion.isAnonymous ? 'Anonymous' : suggestion.author?.name}
                  </div>
                  
                  <Link 
                    href={`/suggestions/${suggestion.id}`} 
<<<<<<< HEAD
                    className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400 hover:underline"
=======
                    className="flex items-center gap-1.5 text-xs font-bold text-green-600 hover:underline"
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
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