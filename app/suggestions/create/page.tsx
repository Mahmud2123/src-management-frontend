'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { 
  Lightbulb, Lock, EyeOff, Send, CheckCircle, 
  ArrowLeft, Info, Sparkles, Target 
} from 'lucide-react';
import { createSuggestion } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { triggerSuccessConfetti } from '@/lib/celebrate';

export default function CreateSuggestion() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    isAnonymous: false 
  });
  
  const MIN_CHARS = 50;
  
// 2. SUGGESTION MUTATION
  const mutation = useMutation({
    mutationFn: createSuggestion,
    onSuccess: () => {
      // 1. Trigger the visual celebration
      triggerSuccessConfetti();
      
      // 2. Show a modern toast indicating pending review status
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
                <p className="text-sm font-bold text-gray-900">Suggestion Submitted!</p>
                <p className="mt-1 text-sm text-gray-500">Your suggestion has been submitted and is pending review.</p>
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
  const isValid = formData.title.trim().length > 0 && formData.description.length >= MIN_CHARS;
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Suggestions</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl mb-4 shadow-lg shadow-yellow-500/30 transform hover:scale-105 transition-transform">
            <Lightbulb className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
            Share Your Idea
          </h1>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
            Propose constructive ideas to improve Sa'adu Zungur University
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Suggestion Guidelines</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Provide detailed, actionable ideas that can benefit the entire SZU community. 
              Your suggestion will be reviewed by SRC before being made public.
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-8 md:p-10">
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-8">
            
            {/* Title Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <Target className="w-5 h-5 text-green-600" />
                  Title of Your Idea
                </label>
                <span className="text-xs font-semibold text-gray-400">
                  {formData.title.length} characters
                </span>
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-5 py-4 text-lg font-semibold text-gray-900 placeholder:text-gray-400 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                placeholder="e.g., Install solar charging stations in the library"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Make it clear and compelling - this is what people will see first
              </p>
            </div>

            {/* Description Textarea */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-900">
                  Detailed Description
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    formData.description.length >= MIN_CHARS 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {formData.description.length} / {MIN_CHARS} min
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  rows={8}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-5 py-4 text-base font-medium text-gray-900 placeholder:text-gray-400 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all resize-none"
                  placeholder="Explain your idea in detail:&#10;&#10;• What problem does it solve?&#10;• How will it benefit students?&#10;• What resources would be needed?&#10;&#10;Be specific and constructive..."
                />
                
                {/* Character count overlay */}
                {formData.description.length > 0 && (
                  <div className="absolute bottom-3 right-3 text-xs font-semibold text-gray-400">
                    {formData.description.length} chars
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      progress >= 100 ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {progress >= 100 
                    ? '✓ Minimum length reached - great job!' 
                    : `${MIN_CHARS - formData.description.length} more characters needed`
                  }
                </p>
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    formData.isAnonymous 
                      ? 'bg-purple-500 shadow-lg shadow-purple-500/30' 
                      : 'bg-white shadow-md'
                  }`}>
                    {formData.isAnonymous 
                      ? <EyeOff className="w-6 h-6 text-white" /> 
                      : <Lock className="w-6 h-6 text-gray-600" />
                    }
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">
                      Post Anonymously
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      Your name will be hidden from other students
                    </p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || mutation.isPending}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-2xl hover:shadow-green-600/40 transition-all duration-200 flex items-center justify-center gap-3 group"
            >
              {mutation.isPending ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Your Idea...</span>
                </>
              ) : (
                <>
                  <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  <span>Submit to Suggestion Box</span>
                </>
              )}
            </button>

            {/* Helper Text */}
            {!isValid && (
              <p className="text-center text-sm text-gray-500 font-medium">
                {!formData.title.trim() && 'Please add a title. '}
                {formData.description.length < MIN_CHARS && `Need ${MIN_CHARS - formData.description.length} more characters in description.`}
              </p>
            )}
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border-2 border-green-100 rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Good Suggestions Include:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 font-medium">
              <li>• Specific, actionable proposals</li>
              <li>• Clear benefits to students</li>
              <li>• Realistic implementation ideas</li>
            </ul>
          </div>
          
          <div className="bg-white border-2 border-amber-100 rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-600" />
              Tips for Success:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 font-medium">
              <li>• Be constructive and positive</li>
              <li>• Provide relevant examples</li>
              <li>• Think about feasibility</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}