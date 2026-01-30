'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Lightbulb, Info, Lock, EyeOff, Send, CheckCircle } from 'lucide-react';
import {createSuggestion} from '@/lib/api';
import { toast } from 'react-hot-toast';
import { triggerSuccessConfetti } from '@/lib/celebrate';

export default function CreateSuggestion() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: '', description: '', isAnonymous: false });
  const MIN_CHARS = 50;
  const mutation = useMutation({
    mutationFn: createSuggestion,
    onSuccess: () => {
      // 1. Trigger the visual celebration
      triggerSuccessConfetti();
      
      // 2. Show a modern toast
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-900">Great Idea!</p>
                <p className="mt-1 text-sm text-gray-500">Your suggestion is now live for the community to upvote.</p>
              </div>
            </div>
          </div>
        </div>
      ));
  
      // 3. Wait slightly for the student to see the success before redirecting
      setTimeout(() => router.push('/suggestions'), 2000);
    },
    onError: (error: any) => {
      // Uses the customMessage logic from your axios interceptor
      toast.error(error.customMessage || 'Failed to submit suggestion.');
    }
  });
  const progress = Math.min((formData.description.length / MIN_CHARS) * 100, 100);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Propose an Idea</h1>
        <p className="text-gray-500">Constructive ideas to improve Sa'adu Zungur University.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Title of your idea</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g., Solar chargers in the library"
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold">Detailed Description</label>
              <span className={`text-xs font-bold ${formData.description.length >= MIN_CHARS ? 'text-green-500' : 'text-amber-500'}`}>
                {formData.description.length} / {MIN_CHARS} min chars
              </span>
            </div>
            <textarea
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="Explain how this benefits students..."
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                {formData.isAnonymous ? <EyeOff className="w-5 h-5 text-purple-500" /> : <Lock className="w-5 h-5 text-blue-500" />}
              </div>
              <div>
                <p className="text-sm font-bold">Post Anonymously</p>
                <p className="text-[10px] text-gray-500">Your name will be hidden from other students.</p>
              </div>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-green-600 cursor-pointer"
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
            />
          </div>

          <button
            onClick={() => mutation.mutate(formData)}
            disabled={formData.description.length < MIN_CHARS || !formData.title || mutation.isPending}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
          >
            {mutation.isPending ? 'Processing...' : <><Send className="w-5 h-5" /> Submit to Suggestion Box</>}
          </button>
        </div>
      </div>
    </div>
  );
}