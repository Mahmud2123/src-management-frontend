// app/complaints/create/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// API & Utilities
import { fetchCategories, createComplaint, checkDuplicateComplaints, uploadComplaintFile } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

// UI Components & Icons
import {
  FileText, AlertCircle, MapPin, Tag, Lock, Upload, X,
  CheckCircle, ArrowLeft, Sparkles, Shield, Info, Image as ImageIcon,
  Loader2, Paperclip, File, Trash2, Eye
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

// ✅ Schema
const schema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  location: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ✅ Uploaded file type
interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  uploaded: boolean;
  fileUrl?: string;
  filename?: string;
}

export default function CreateComplaintPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Hook
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: 'MEDIUM',
      isAnonymous: false,
    }
  });

  // Watchers
  const watchedTitle = watch('title');
  const watchedPriority = watch('priority');
  const watchedIsAnonymous = watch('isAnonymous');
  const debouncedTitle = useDebounce(watchedTitle, 500);
  
  const titleLength = watchedTitle?.length || 0;
  const descriptionLength = watch('description')?.length || 0;

  // Queries
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 60000,
  });

  // Duplicate Check
  useEffect(() => {
    const handleFetch = async () => {
      if (debouncedTitle && debouncedTitle.length > 4) {
        try {
          const data = await checkDuplicateComplaints(debouncedTitle);
          setDuplicates(data || []);
        } catch (error) {
          setDuplicates([]);
        }
      } else {
        setDuplicates([]);
      }
    };
    handleFetch();
  }, [debouncedTitle]);

  // ✅ Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return await uploadComplaintFile(file);
    },
    onSuccess: (data, variables) => {
      // Update the file status
      setUploadedFiles(prev => prev.map(f => {
        if (f.file === variables) {
          return {
            ...f,
            uploaded: true,
            fileUrl: data.fileUrl,
            filename: data.filename,
          };
        }
        return f;
      }));
    },
    onError: (error: any, variables) => {
      toast.error(`Failed to upload ${variables.name}: ${error.message}`);
      // Remove the failed file
      setUploadedFiles(prev => prev.filter(f => f.file !== variables));
    },
  });

  // ✅ Create complaint mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Get uploaded file URLs
      const attachments = uploadedFiles
        .filter(f => f.uploaded && f.fileUrl)
        .map(f => ({
          fileName: f.file.name,
          fileUrl: f.fileUrl!,
          fileType: f.file.type || 'application/octet-stream',
          fileSize: f.file.size,
        }));

      const payload = {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        priority: data.priority,
        location: data.location || undefined,
        isAnonymous: Boolean(data.isAnonymous),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        attachments: attachments,
      };

      return createComplaint(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      
      toast.success('Complaint Submitted!', {
        description: 'Your complaint has been successfully submitted and is pending review.',
        duration: 5000,
      });

      router.push('/complaints');
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      const errorMessage = Array.isArray(serverMessage) 
        ? serverMessage.join(', ') 
        : serverMessage || 'Failed to create complaint. Please check your inputs.';
      
      toast.error('Submission Failed', {
        description: errorMessage,
        duration: 5000,
      });
    },
  });

  const onSubmit = async (data: FormValues) => {
    // Check if any files are still uploading
    const uploading = uploadedFiles.some(f => !f.uploaded);
    if (uploading) {
      toast.warning('Uploading Files', {
        description: 'Please wait for all files to finish uploading.',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ File upload handlers
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      for (const file of files) {
        // Validate file size
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }

        // Add file to list with uploading status
        const newFile: UploadedFile = {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          uploaded: false,
        };
        setUploadedFiles(prev => [...prev, newFile]);

        // Start upload
        try {
          await uploadMutation.mutateAsync(file);
        } catch (error) {
          // Error handled in mutation
        }
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [uploadMutation]);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }
      const newFile: UploadedFile = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        uploaded: false,
      };
      setUploadedFiles(prev => [...prev, newFile]);
      try {
        await uploadMutation.mutateAsync(file);
      } catch (error) {
        // Error handled in mutation
      }
    }
  }, [uploadMutation]);

  const getPriorityColor = useCallback((priority: string) => {
    const colors = {
      LOW: 'bg-blue-100 text-blue-700 border-blue-200',
      MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
      URGENT: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  }, []);

  const totalSize = useMemo(() => {
    return uploadedFiles.reduce((acc, f) => acc + f.file.size, 0);
  }, [uploadedFiles]);

  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="flex items-center gap-2 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
              Submit New Complaint
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Your concerns matter. Fill out the form below to submit your complaint.
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                <Sparkles className="w-4 h-4 text-green-600" />
                Tips for Effective Complaints
              </h3>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-0.5">
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
          <Card className="p-4 sm:p-6 md:p-8 border-0 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Complaint Details
            </h2>

            <div className="space-y-4 sm:space-y-6">
              {/* Title */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title')}
                  placeholder="Brief summary of your complaint"
                  className={`w-full px-4 py-3 text-sm sm:text-base bg-gray-50 border-2 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-900 placeholder:text-gray-400 ${
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
                    {titleLength}/100
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={5}
                  placeholder="Provide a detailed description of the issue..."
                  className={`w-full px-4 py-3 text-sm sm:text-base bg-gray-50 border-2 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-900 placeholder:text-gray-400 resize-none ${
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
                    {descriptionLength}/2000
                  </p>
                </div>
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...field}
                        className={`w-full px-4 py-3 text-sm sm:text-base bg-gray-50 border-2 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-900 ${
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
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Priority Level <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...field}
                        className={`w-full px-4 py-3 text-sm sm:text-base bg-gray-50 border-2 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-900 ${
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
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Location (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    {...register('location')}
                    placeholder="e.g., Main Library - 2nd Floor"
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Tags (Optional)
                </label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    {...register('tags')}
                    placeholder="Add tags separated by commas (e.g., wifi, urgent, maintenance)"
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Tags help us categorize your complaint faster
                </p>
              </div>
            </div>
          </Card>

          {/* Privacy & Attachments Card */}
          <Card className="p-4 sm:p-6 md:p-8 border-0 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Privacy & Attachments
            </h2>

            <div className="space-y-4 sm:space-y-6">
              {/* Anonymous Toggle */}
              <div className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
                watchedIsAnonymous 
                  ? 'bg-yellow-50 border-yellow-300' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <label className="flex items-start gap-3 sm:gap-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register('isAnonymous')}
                    className="w-4 h-4 sm:w-5 sm:h-5 mt-1 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">Submit Anonymously</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Your identity will be hidden from other students. SRC members and administrators 
                      will still be able to see your details for verification.
                    </p>
                  </div>
                </label>
              </div>

              {/* ✅ File Upload Section */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    Attachments (Optional)
                  </label>
                  {uploadedFiles.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {uploadedFiles.length} file(s) • {(totalSize / 1024 / 1024).toFixed(1)} MB
                    </span>
                  )}
                </div>
                
                {/* Drop zone */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                    isDragging 
                      ? 'border-green-500 bg-green-50/50' 
                      : 'border-gray-300 hover:border-green-500 hover:bg-green-50/20'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 transition-colors ${
                    isDragging ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm sm:text-base font-medium text-gray-700">
                    {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    PNG, JPG, PDF, DOC up to 10MB each
                  </p>
                </div>

                {/* Uploaded files list */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="group relative flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-all shadow-sm hover:shadow-md">
                        {/* Preview thumbnail */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {file.file.type?.startsWith('image/') && file.preview ? (
                            <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-500" />
                          )}
                        </div>

                        {/* File info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.file.size / 1024).toFixed(1)} KB
                            {!file.uploaded && (
                              <span className="ml-2 text-amber-600 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Uploading...
                              </span>
                            )}
                            {file.uploaded && (
                              <span className="ml-2 text-green-600">✓ Uploaded</span>
                            )}
                          </p>
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={!file.uploaded}
                          aria-label="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Submit Actions */}
          <Card className="p-4 sm:p-6 border-0 shadow-lg">
            {duplicates.length > 0 && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 text-blue-800 font-bold mb-2 text-xs sm:text-sm">
                  <Info className="w-4 h-4" /> Similar reports found:
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {duplicates.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-2 sm:p-3 rounded-lg border border-blue-100 shadow-sm">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate flex-1 mr-2">
                        {item.title}
                      </span>
                      <button 
                        type="button"
                        onClick={() => router.push(`/complaints/${item.id}`)}
                        className="text-xs bg-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] sm:text-xs text-blue-600 mt-2">
                  If your issue is similar, please view and comment there instead of creating a duplicate.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="flex-1 sm:flex-none px-6 sm:px-8 py-3"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || uploadedFiles.some(f => !f.uploaded)}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/30 text-white font-semibold py-3 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
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