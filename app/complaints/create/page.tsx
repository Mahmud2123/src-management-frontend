'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchCategories,createComplaint } from '@/lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { toast } from 'sonner';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  FileText, AlertCircle, MapPin, Tag, Lock, Upload, X,
  CheckCircle, ArrowLeft, Sparkles, Shield, Info
} from 'lucide-react';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  location: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateComplaintPage() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: 'MEDIUM',
      isAnonymous: false,
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data:FormData)=>{
       const formattedData = {
        ...data,
        tags:data.tags?
        data.tags.split(',').map(tag => tag.trim()).filter(tag=>tag !== " "):[]
       };
       return createComplaint(formattedData)
    },
    onSuccess: () => {
      toast.success('Complaint Submitted!', {
        description: 'Your complaint has been successfully submitted and is being reviewed.',
      });
      router.push('/complaints');
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      toast.error('Submission Failed', {
        description: serverMessage || 'Failed to create complaint. Please try again.',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const watchedPriority = watch('priority');
  const watchedIsAnonymous = watch('isAnonymous');
  const titleLength = watch('title')?.length || 0;
  const descriptionLength = watch('description')?.length || 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-600" />
              Submit New Complaint
            </h1>
            <p className="text-gray-600 mt-1">Your concerns matter to us. Fill out the form below to submit your complaint.</p>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Info className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-600" />
                Tips for Effective Complaints
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Be specific and provide detailed information</li>
                <li>• Include location and time if relevant</li>
                <li>• Use clear and respectful language</li>
                <li>• Attach supporting documents or images if available</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Information Card */}
          <Card className="p-8 border-0 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Complaint Details
            </h2>

            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title')}
                  placeholder="Brief summary of your complaint (e.g., 'Broken AC in Library')"
                  className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400 ${
                    errors.title ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                <div className="flex justify-between items-center">
                  {errors.title && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title.message}
                    </p>
                  )}
                  <p className={`text-xs ml-auto ${titleLength >= 5 ? 'text-green-600' : 'text-gray-500'}`}>
                    {titleLength}/100 characters
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={6}
                  placeholder="Provide a detailed description of the issue. Include relevant details such as when it occurred, who was involved, and any steps you've already taken..."
                  className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400 resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                <div className="flex justify-between items-center">
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description.message}
                    </p>
                  )}
                  <p className={`text-xs ml-auto ${descriptionLength >= 20 ? 'text-green-600' : 'text-gray-500'}`}>
                    {descriptionLength}/1000 characters
                  </p>
                </div>
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...field}
                        className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all duration-200 text-gray-900 ${
                          errors.categoryId ? 'border-red-500' : 'border-gray-200'
                        }`}
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat: any) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      {errors.categoryId && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.categoryId.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Priority Level <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...field}
                        className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all duration-200 text-gray-900 ${
                          getPriorityColor(watchedPriority)
                        } border-gray-200`}
                      >
                        <option value="LOW">Low - Minor issue</option>
                        <option value="MEDIUM">Medium - Moderate concern</option>
                        <option value="HIGH">High - Significant issue</option>
                        <option value="URGENT">Urgent - Immediate attention required</option>
                      </select>
                    </div>
                  )}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Location (Optional)
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    {...register('location')}
                    placeholder="e.g., Main Library - 2nd Floor, Block A Hostel"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Tags (Optional)
                </label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    {...register('tags')}
                    placeholder="Add tags separated by commas (e.g., wifi, urgent, maintenance)"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Tags help us categorize and process your complaint faster
                </p>
              </div>
            </div>
          </Card>

          {/* Privacy & Attachments Card */}
          <Card className="p-8 border-0 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Privacy & Attachments
            </h2>

            <div className="space-y-6">
              {/* Anonymous Toggle */}
              <div className={`p-6 rounded-xl border-2 transition-all ${
                watchedIsAnonymous 
                  ? 'bg-yellow-50 border-yellow-300' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <label className="flex items-start gap-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register('isAnonymous')}
                    className="w-5 h-5 mt-1 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-5 h-5 text-gray-700" />
                      <span className="font-semibold text-gray-900">Submit Anonymously</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Your identity will be hidden from other students. SRC members and administrators 
                      will still be able to see your details for verification purposes.
                    </p>
                  </div>
                </label>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Attachments (Optional)
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 hover:bg-green-50/50 transition-all group cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 group-hover:text-green-600 mx-auto mb-4 transition-colors" />
                    <p className="text-gray-700 font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, PDF up to 10MB each
                    </p>
                  </label>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg group hover:bg-green-100 transition-colors">
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Submit Actions */}
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 sm:flex-none px-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/30 text-white font-semibold py-4 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Submit Complaint</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}