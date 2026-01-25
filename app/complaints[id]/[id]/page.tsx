'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { toast } from 'sonner';
import { fetchComplaintById, addComment, updateComplaint, uploadFile } from '@/lib/api';
import {
  ArrowLeft, MapPin, Calendar, User, Eye, AlertCircle, Send,
  Paperclip, Download, MessageSquare, Lock, CheckCircle, Clock,
  TrendingUp, XCircle, Edit, Save, X, Upload, FileText, Image as ImageIcon
} from 'lucide-react';

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const complaintId = params.id as string;

  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const { data: complaint, isLoading } = useQuery({
    queryKey: ['complaint', complaintId],
    queryFn: () => fetchComplaintById(complaintId),
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ content, isInternal }: { content: string; isInternal: boolean }) =>
      addComment(complaintId, content, isInternal),
    onSuccess: () => {
      toast.success('Comment added successfully');
      setNewComment('');
      setIsInternal(false);
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
    },
    onError: (error: any) => {
      toast.error('Failed to add comment', {
        description: error.customMessage || error.message,
      });
    },
  });

 
const updateStatusMutation = useMutation({
  mutationFn: (status: string) => updateComplaint(complaintId, { status }),
  onSuccess: (updatedData) => {
    // 1. Show success feedback
    toast.success(`Status updated to ${updatedData.status.replace('_', ' ')}`);
    
    // 2. Stop editing mode immediately
    setEditingStatus(false);
    
    // 3. FORCE REFRESH DATA: Invalidate both the list and this specific complaint
    queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
    queryClient.invalidateQueries({ queryKey: ['complaints'] });
    
    // 4. Update the local selected status just in case
    setSelectedStatus(updatedData.status);
  },
  onError: (error: any) => {
    // Better error parsing
    const message = error.response?.data?.message || error.customMessage || "Permission Denied";
    toast.error('Update Failed', {
      description: Array.isArray(message) ? message.join(', ') : message,
    });
  },
});
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      await uploadFile(file, complaintId);
      toast.success('File uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
    } catch (error: any) {
      toast.error('Failed to upload file', {
        description: error.customMessage || error.message,
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    addCommentMutation.mutate({ content: newComment, isInternal });
  };

  const handleStatusUpdate = () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }
    updateStatusMutation.mutate(selectedStatus);
  };

  const canManage = user?.role !== 'STUDENT';
  const isOwner = user?.id === complaint?.createdBy?.id;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-5 h-5" />;
      case 'IN_PROGRESS': return <TrendingUp className="w-5 h-5" />;
      case 'RESOLVED': return <CheckCircle className="w-5 h-5" />;
      case 'REJECTED': return <XCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'URGENT': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading complaint...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="p-12 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Complaint Not Found</h3>
          <p className="text-gray-600 mb-6">The complaint you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{complaint.title}</h1>
              <Badge className={`${getStatusColor(complaint.status)} flex items-center gap-1.5 px-3 py-1.5 border text-sm`}>
                {getStatusIcon(complaint.status)}
                {complaint.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-gray-600">Complaint #{complaint.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card className="p-8 border-0 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 ${getPriorityColor(complaint.priority)} rounded-xl`}>
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Complaint Details</h2>
                  <p className="text-sm text-gray-600">Priority: {complaint.priority}</p>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
              </div>

              {complaint.tags && complaint.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-200">
                  {complaint.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <Card className="p-8 border-0 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-green-600" />
                    Attachments ({complaint.attachments.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {complaint.attachments.map((attachment: any) => (
                    <div key={attachment.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                      <div className="p-3 bg-green-100 rounded-lg">
                        {attachment.type?.includes('image') ? (
                          <ImageIcon className="w-6 h-6 text-green-700" />
                        ) : (
                          <FileText className="w-6 h-6 text-green-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{attachment.filename}</p>
                        <p className="text-sm text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <a
                        href={attachment.url}
                        download
                        className="p-2 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
                      >
                        <Download className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                      </a>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Comments Thread */}
            <Card className="p-8 border-0 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Comments ({complaint.comments?.length || 0})
              </h3>

              <div className="space-y-4 mb-6">
                {complaint.comments && complaint.comments.length > 0 ? (
                  complaint.comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className={`p-5 rounded-xl ${
                        comment.isInternal
                          ? 'bg-yellow-50 border-2 border-yellow-200'
                          : 'bg-gray-50 border-2 border-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">{comment.author?.name || 'Unknown'}</span>
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              {comment.author?.role?.replace('_', ' ') || 'User'}
                            </Badge>
                            {comment.isInternal && (
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Internal
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500 ml-auto">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your comment..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all resize-none text-gray-900"
                />

                {canManage && (
                  <label className="flex items-center gap-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl cursor-pointer hover:bg-yellow-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <Lock className="w-5 h-5 text-yellow-700" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Internal Comment</p>
                      <p className="text-sm text-gray-600">Only visible to SRC members and administrators</p>
                    </div>
                  </label>
                )}

                <Button
                  onClick={handleAddComment}
                  disabled={addCommentMutation.isPending || !newComment.trim()}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details Card */}
            <Card className="p-6 border-0 shadow-lg sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-green-600" />
                Complaint Information
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Category</p>
                  <Badge variant="secondary" className="text-sm px-3 py-1.5">
                    {complaint.category?.name || 'General'}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Priority</p>
                  <Badge className={`${getPriorityColor(complaint.priority)} text-sm px-3 py-1.5 font-semibold`}>
                    {complaint.priority}
                  </Badge>
                </div>

                {complaint.location && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Location</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {complaint.location}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Submitted By</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {complaint.isAnonymous ? 'Anonymous' : complaint.author?.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Created</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(complaint.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {new Date(complaint.updatedAt).toLocaleString()}
                  </p>
                </div>

                {complaint.resolvedAt && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Resolved</p>
                    <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {new Date(complaint.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Views</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    {complaint.viewCount || 0}
                  </p>
                </div>
              </div>
            </Card>

            {/* Actions Card - SRC/Admin Only */}
            {canManage && (
              <Card className="p-6 border-0 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-green-600" />
                  Manage Complaint
                </h3>

                <div className="space-y-4">
                  {editingStatus ? (
                    <div className="space-y-3">
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none"
                      >
                        <option value="">Select Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                      <div className="flex gap-2">
                        <Button onClick={handleStatusUpdate} className="flex-1 flex items-center justify-center gap-2">
                          <Save className="w-4 h-4" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setEditingStatus(false)} className="flex items-center gap-2">
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setEditingStatus(true);
                        setSelectedStatus(complaint.status);
                      }}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Change Status
                    </Button>
                  )}

                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept="image/*,.pdf"
                    />
                    <label htmlFor="file-upload">
                      <Button
                        as="span"
                        variant="outline"
                        disabled={uploadingFile}
                        className="w-full flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingFile ? 'Uploading...' : 'Upload Attachment'}
                      </Button>
                    </label>
                  </div>
                </div>
              </Card>
            )}

            {/* Status History */}
            {complaint.statusHistory && complaint.statusHistory.length > 0 && (
              <Card className="p-6 border-0 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Status History
                </h3>

                <div className="space-y-4">
                  {complaint.statusHistory.map((change: any, idx: number) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        {idx < complaint.statusHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900">
                          {change.fromStatus} → {change.toStatus}
                        </p>
                        <p className="text-sm text-gray-600">
                          by {change.changedBy} • {new Date(change.changedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}