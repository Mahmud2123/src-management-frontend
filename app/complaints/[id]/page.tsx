'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { toast } from 'sonner';
import { fetchComplaintById, addComment, updateComplaint, uploadFile, fetchMembers, assignComplaint } from '@/lib/api';
import {
  ArrowLeft, MapPin, Calendar, User, Eye, AlertCircle, Send,
  Paperclip, Download, MessageSquare, Lock, CheckCircle, Clock,
  TrendingUp, XCircle, Edit, Save, X, Upload, FileText, Image as ImageIcon,
  UserCheck, ShieldAlert
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
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  // Fetch Complaint Details
  const { data: complaint, isLoading } = useQuery({
    queryKey: ['complaint', complaintId],
    queryFn: () => fetchComplaintById(complaintId),
  });

  // Fetch SRC/Admin Members for Assignment
  const canManage = user?.role !== 'STUDENT';
  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => fetchMembers ? fetchMembers() : Promise.resolve([]),
    enabled: canManage,
  });

  
  // Mutation: Add Comment
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

  // Mutation: Update Status
  const updateStatusMutation = useMutation({
    mutationFn: (payload: { status: string; resolutionNotes?: string }) => 
      updateComplaint(complaintId, payload),
    onSuccess: (updatedData) => {
      toast.success(`Status updated to ${updatedData.status.replace('_', ' ')}`);
      setEditingStatus(false);
      setResolutionNotes('');
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.customMessage || "Permission Denied";
      toast.error('Update Failed', {
        description: Array.isArray(message) ? message.join(', ') : message,
      });
    },
  });

  // Mutation: Assign Complaint
  const assignMutation = useMutation({
    mutationFn: (assignedToId: string) => 
      assignComplaint ? assignComplaint(complaintId, assignedToId) : updateComplaint(complaintId, { assignedToId }),
    onSuccess: () => {
      toast.success('Complaint assigned successfully');
      setEditingAssignee(false);
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.customMessage || "Assignment Failed";
      toast.error('Assignment Failed', {
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
      e.target.value = '';
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
    updateStatusMutation.mutate({ 
      status: selectedStatus, 
      ...(resolutionNotes ? { resolutionNotes } : {}) 
    });
  };

  const handleAssignUpdate = () => {
    if (!selectedAssignee) {
      toast.error('Please select a team member');
      return;
    }
    assignMutation.mutate(selectedAssignee);
  };

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
      case 'LOW': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 bg-gray-50">
        <Card className="p-8 sm:p-12 max-w-md text-center border-0 shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Complaint Not Found</h3>
          <p className="text-gray-600 mb-6">The complaint you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.back()} className="w-full bg-green-600 text-white hover:bg-green-700">Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="secondary" onClick={() => router.back()} className="flex items-center gap-2 shrink-0 border border-gray-200">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate flex-1">{complaint.title}</h1>
          </div>
          <Badge className={`${getStatusColor(complaint.status)} flex items-center gap-1.5 px-3.5 py-2 border text-sm font-semibold shrink-0 self-start sm:self-auto`}>
            {getStatusIcon(complaint.status)}
            {complaint.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card className="p-4 sm:p-6 md:p-8 border-0 shadow-md bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 ${getPriorityColor(complaint.priority)} rounded-xl shrink-0`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Complaint Description</h2>
                  <p className="text-sm text-gray-600">Priority: <span className="font-semibold">{complaint.priority}</span></p>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
              </div>

              {Array.isArray(complaint.tags) && complaint.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
                  {complaint.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <Card className="p-4 sm:p-6 md:p-8 border-0 shadow-md bg-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-green-600" />
                    Attachments ({complaint.attachments.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {complaint.attachments.map((attachment: any) => (
                    <div key={attachment.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-300 transition-colors group">
                      <div className="p-3 bg-green-100 rounded-lg shrink-0">
                        {attachment.type?.includes('image') ? (
                          <ImageIcon className="w-5 h-5 text-green-700" />
                        ) : (
                          <FileText className="w-5 h-5 text-green-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">{attachment.filename}</p>
                        <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <a
                        href={attachment.url}
                        download
                        className="p-2 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors shrink-0"
                        aria-label={`Download ${attachment.filename}`}
                      >
                        <Download className="w-4 h-4 text-gray-600 hover:text-green-600" />
                      </a>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Comments Thread */}
            <Card className="p-4 sm:p-6 md:p-8 border-0 shadow-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Comments ({complaint.comments?.length || 0})
              </h3>

              <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-1">
                {complaint.comments && complaint.comments.length > 0 ? (
                  complaint.comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-xl transition-all ${
                        comment.isInternal
                          ? 'bg-amber-50/70 border border-amber-200'
                          : 'bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 text-sm">{comment.author?.name || 'Unknown'}</span>
                              <Badge variant="secondary" className="text-[11px] px-2 py-0.5 bg-gray-200 text-gray-700">
                                {comment.author?.role?.replace('_', ' ') || 'User'}
                              </Badge>
                              {comment.isInternal && (
                                <Badge className="bg-amber-100 text-amber-800 border border-amber-300 text-[11px] px-2 py-0.5 flex items-center gap-1 font-medium">
                                  <Lock className="w-3 h-3" />
                                  Internal
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed break-words">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No comments yet. Be the first to start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your response here..."
                  rows={4}
                  aria-label="Add comment text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all resize-none text-sm text-gray-900 placeholder:text-gray-400"
                />

                {canManage && (
                  <label className="flex items-start sm:items-center gap-3 p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="mt-0.5 sm:mt-0 w-4 h-4 text-green-600 rounded focus:ring-green-500 shrink-0"
                    />
                    <div className="flex-1 text-xs sm:text-sm">
                      <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-700" /> Internal Note
                      </span>
                      <span className="text-gray-500 block sm:inline sm:ml-1">(Only visible to staff and system administrators)</span>
                    </div>
                  </label>
                )}

                <Button
                  onClick={handleAddComment}
                  disabled={addCommentMutation.isPending || !newComment.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 py-3 text-sm font-semibold rounded-xl"
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
            <Card className="p-4 sm:p-6 border-0 shadow-md bg-white">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
                <AlertCircle className="w-5 h-5 text-green-600 shrink-0" />
                Complaint Summary
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Category</p>
                  <Badge variant="secondary" className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                    {complaint.category?.name || 'General'}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Priority</p>
                  <Badge className={`${getPriorityColor(complaint.priority)} px-3 py-1 text-xs font-semibold border`}>
                    {complaint.priority}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Assigned To</p>
                  {complaint.assignedTo ? (
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-600 shrink-0" />
                      {complaint.assignedTo.name}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" /> Unassigned
                    </p>
                  )}
                </div>

                {complaint.location && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                    <p className="font-medium text-gray-800 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span className="break-words">{complaint.location}</span>
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Submitted By</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                    {complaint.isAnonymous ? 'Anonymous' : (complaint.author?.name || 'Student')}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Created</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    {new Date(complaint.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Last Updated</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    {new Date(complaint.updatedAt).toLocaleString()}
                  </p>
                </div>

                {complaint.resolvedAt && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Resolved On</p>
                    <p className="font-medium text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      {new Date(complaint.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Views</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400 shrink-0" />
                    {complaint.viewCount || 0}
                  </p>
                </div>
              </div>
            </Card>

            {/* Admin Management Panel */}
            {canManage && (
              <Card className="p-4 sm:p-6 border-0 shadow-md bg-white">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
                  <Edit className="w-5 h-5 text-green-600 shrink-0" />
                  Admin Management Panel
                </h3>

                <div className="space-y-4">
                  {/* Status Management */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Update Status</label>
                    {editingStatus ? (
                      <div className="space-y-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          aria-label="Select complaint status"
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        >
                          <option value="">Select Status</option>
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>

                        {(selectedStatus === 'RESOLVED' || selectedStatus === 'REJECTED') && (
                          <textarea
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            placeholder="Add optional notes/reasoning..."
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-green-500"
                          />
                        )}

                        <div className="flex gap-2">
                          <Button 
                            onClick={handleStatusUpdate} 
                            disabled={updateStatusMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white hover:bg-green-700 text-xs py-2"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {updateStatusMutation.isPending ? 'Saving...' : 'Save'}
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={() => setEditingStatus(false)} 
                            className="flex items-center justify-center gap-1.5 text-xs py-2 border border-gray-300"
                          >
                            <X className="w-3.5 h-3.5" />
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
                        variant="secondary"
                        className="w-full flex items-center justify-center gap-2 border border-gray-200 text-sm font-semibold hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                        Change Status
                      </Button>
                    )}
                  </div>

                  {/* Assignee Management */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Assign Staff / Member</label>
                    {editingAssignee ? (
                      <div className="space-y-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                        <select
                          value={selectedAssignee}
                          onChange={(e) => setSelectedAssignee(e.target.value)}
                          aria-label="Select assignee"
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        >
                          <option value="">Select Team Member</option>
                          {members.map((member: any) => (
                            <option key={member.id} value={member.id}>
                              {member.name} ({member.role.replace('_', ' ')})
                            </option>
                          ))}
                        </select>

                        <div className="flex gap-2">
                          <Button 
                            onClick={handleAssignUpdate} 
                            disabled={assignMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white hover:bg-green-700 text-xs py-2"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            {assignMutation.isPending ? 'Assigning...' : 'Assign'}
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={() => setEditingAssignee(false)} 
                            className="flex items-center justify-center gap-1.5 text-xs py-2 border border-gray-300"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setEditingAssignee(true);
                          setSelectedAssignee(complaint.assignedToId || '');
                        }}
                        variant="secondary"
                        className="w-full flex items-center justify-center gap-2 border border-gray-200 text-sm font-semibold hover:bg-gray-50"
                      >
                        <UserCheck className="w-4 h-4 text-gray-600" />
                        {complaint.assignedTo ? 'Reassign Member' : 'Assign Member'}
                      </Button>
                    )}
                  </div>

                  {/* Attachment Upload */}
                  <div className="pt-2 border-t border-gray-100">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept="image/*,.pdf"
                    />
                    <label
                      htmlFor="file-upload"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4 text-gray-600" />
                      {uploadingFile ? 'Uploading File...' : 'Upload Attachment'}
                    </label>
                  </div>
                </div>
              </Card>
            )}

            {/* Status Timeline */}
            {complaint.statusHistory && complaint.statusHistory.length > 0 && (
              <Card className="p-4 sm:p-6 border-0 shadow-md bg-white">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
                  <TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
                  Audit Trail & History
                </h3>

                <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
                  {complaint.statusHistory.map((change: any, idx: number) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full shrink-0" />
                        {idx < (complaint.statusHistory?.length || 0) - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-3">
                        <p className="font-semibold text-gray-900 text-xs">
                          {change.fromStatus} → {change.toStatus}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          by <span className="text-gray-700 font-medium">{change.changedBy || 'Admin'}</span> • {new Date(change.changedAt).toLocaleString()}
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