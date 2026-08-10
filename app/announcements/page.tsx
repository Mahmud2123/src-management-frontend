// app/announcements/page.tsx
'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '@/providers/auth';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  fetchAnnouncements,
  createAnnouncement,
  uploadAnnouncementImage,
  deleteAnnouncement,
  updateAnnouncement,
  Announcement,
  CreateAnnouncementPayload,
} from '@/lib/api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { AnnouncementImage } from '@/components/AnnouncementImage';
import {
  Megaphone,
  Calendar,
  Search,
  Plus,
  X,
  Upload,
  Loader2,
  Trash2,
  AlertCircle,
  Bell,
  User,
  Edit,
  Clock,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';
import { ImagePreviewModal } from '@/components/ImagePreviewModal';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // State
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Announcement | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: announcements = [], isLoading, error, refetch } = useQuery({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload: CreateAnnouncementPayload) => {
      return await createAnnouncement(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement published successfully!');
      resetForm();
      setShowCreateModal(false);
      refetch();
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish announcement: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreateAnnouncementPayload> }) => {
      return await updateAnnouncement(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement updated successfully!');
      resetForm();
      setShowEditModal(null);
      refetch();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update announcement: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteAnnouncement(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted successfully');
      setShowDeleteConfirm(null);
      refetch();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete announcement: ${error.message}`);
    },
  });

  // Cleanup image preview
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const filteredAnnouncements = useMemo(() => {
    if (!search.trim()) return announcements;
    const keyword = search.toLowerCase().trim();
    return announcements.filter((a) => {
      return (
        a.title?.toLowerCase().includes(keyword) ||
        a.message?.toLowerCase().includes(keyword)
      );
    });
  }, [announcements, search]);

  // Active and archived announcements
  const activeAnnouncements = useMemo(() => {
    const now = new Date();
    return filteredAnnouncements.filter((a) => {
      if (!a.isActive) return false;
      if (a.expiryDate) {
        return isAfter(new Date(a.expiryDate), now);
      }
      return true;
    });
  }, [filteredAnnouncements]);

  const archivedAnnouncements = useMemo(() => {
    const now = new Date();
    return filteredAnnouncements.filter((a) => {
      if (!a.isActive) return true;
      if (a.expiryDate) {
        return isBefore(new Date(a.expiryDate), now);
      }
      return false;
    });
  }, [filteredAnnouncements]);

  const resetForm = useCallback(() => {
    setTitle('');
    setMessage('');
    setImageFile(null);
    setExpiryDate('');
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setIsSubmitting(false);
    setEditingId(null);
  }, [imagePreview]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, WEBP, and GIF images are allowed');
      return;
    }

    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        const uploadResult = await uploadAnnouncementImage(imageFile);
        imageUrl = uploadResult.imageUrl;
      }

      await createMutation.mutateAsync({
        title: title.trim(),
        message: message.trim(),
        imageUrl,
        expiryDate: expiryDate || undefined,
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [title, message, imageFile, expiryDate, createMutation]);

  const handleUpdate = useCallback(async () => {
    if (!editingId || !title.trim() || !message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        const uploadResult = await uploadAnnouncementImage(imageFile);
        imageUrl = uploadResult.imageUrl;
      }

      await updateMutation.mutateAsync({
        id: editingId,
        payload: {
          title: title.trim(),
          message: message.trim(),
          imageUrl: imageUrl || showEditModal?.imageUrl,
          expiryDate: expiryDate || undefined,
        },
      });
    } catch (error) {
      console.error('Error updating announcement:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingId, title, message, imageFile, expiryDate, showEditModal, updateMutation]);

  const openEditModal = useCallback((announcement: Announcement) => {
    setShowEditModal(announcement);
    setTitle(announcement.title);
    setMessage(announcement.message);
    setEditingId(announcement.id);
    setExpiryDate(announcement.expiryDate || '');
    if (announcement.imageUrl) {
      setImagePreview(announcement.imageUrl);
    }
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-700" />
            <span className="ml-3 text-gray-600">Loading announcements...</span>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <Card className="p-8 text-center rounded-3xl border-0 shadow-md bg-white">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Failed to load announcements</h3>
            <p className="text-gray-600 mt-2">
              {error instanceof Error ? error.message : 'Please try again later'}
            </p>
            <Button
              onClick={() => refetch()}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl px-6 py-3 font-bold"
            >
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-green-700" />
              Announcements
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {activeAnnouncements.length} active, {archivedAnnouncements.length} archived
            </p>
          </div>

          {isSuperAdmin && (
            <Button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-5 py-3 font-bold flex items-center gap-2 shadow-lg shadow-green-700/20"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements by title or message..."
            className="pl-10 rounded-2xl border-2 border-gray-200 focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Active Announcements */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-600" />
            Active Announcements
          </h2>

          {activeAnnouncements.length === 0 ? (
            <Card className="p-8 text-center rounded-3xl border-0 shadow-md bg-white">
              <p className="text-gray-500">No active announcements</p>
            </Card>
          ) : (
            activeAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                isSuperAdmin={isSuperAdmin}
                onEdit={openEditModal}
                onDelete={(id) => setShowDeleteConfirm(id)}
              />
            ))
          )}
        </div>

        {/* Archived Announcements */}
        {archivedAnnouncements.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Archived Announcements
            </h2>

            {archivedAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                isSuperAdmin={isSuperAdmin}
                onEdit={openEditModal}
                onDelete={(id) => setShowDeleteConfirm(id)}
                isArchived
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && isSuperAdmin && (
        <AnnouncementModal
          title="Create Announcement"
          submitLabel="Publish Announcement"
          isSubmitting={isSubmitting}
          onClose={() => {
            resetForm();
            setShowCreateModal(false);
          }}
          onSubmit={handleCreate}
          titleValue={title}
          onTitleChange={setTitle}
          messageValue={message}
          onMessageChange={setMessage}
          expiryDateValue={expiryDate}
          onExpiryDateChange={setExpiryDate}
          imagePreview={imagePreview}
          onFileChange={handleFileChange}
          onRemoveImage={() => {
            setImageFile(null);
            if (imagePreview) {
              URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && isSuperAdmin && (
        <AnnouncementModal
          title="Edit Announcement"
          submitLabel="Update Announcement"
          isSubmitting={isSubmitting}
          onClose={() => {
            resetForm();
            setShowEditModal(null);
          }}
          onSubmit={handleUpdate}
          titleValue={title}
          onTitleChange={setTitle}
          messageValue={message}
          onMessageChange={setMessage}
          expiryDateValue={expiryDate}
          onExpiryDateChange={setExpiryDate}
          imagePreview={imagePreview}
          onFileChange={handleFileChange}
          onRemoveImage={() => {
            setImageFile(null);
            if (imagePreview) {
              URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => deleteMutation.mutate(showDeleteConfirm)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

// ============================================
// Announcement Card Component
// ============================================


function AnnouncementCard({
  announcement,
  isSuperAdmin,
  onEdit,
  onDelete,
  isArchived = false,
}: {
  announcement: Announcement;
  isSuperAdmin: boolean;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  isArchived?: boolean;
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <Card className={`overflow-hidden border-0 shadow-md rounded-3xl bg-white transition-all hover:shadow-lg ${
        isArchived ? 'opacity-75' : ''
      }`}>
        <div className="p-5 sm:p-6 space-y-4">
          {/* Large Image with click to preview */}
          {announcement.imageUrl && (
            <div 
              className="relative w-full rounded-2xl overflow-hidden cursor-pointer group bg-gray-100"
              onClick={() => setShowPreview(true)}
            >
              {/* Large image - takes more space on the card */}
              <div className="w-full" style={{ paddingBottom: '45%' }}> {/* 16:9 aspect ratio but slightly taller */}
                <div className="absolute inset-0">
                  <AnnouncementImage
                    src={announcement.imageUrl}
                    alt={announcement.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              
              {/* Gradient overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Preview overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2.5 backdrop-blur-sm transform group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-4 h-4" />
                  Click to preview
                </div>
              </div>
              
              {/* Status badge */}
              {isArchived && (
                <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-gray-900/80 text-white text-xs font-bold rounded-full backdrop-blur-sm border border-white/10 z-10">
                  Archived
                </div>
              )}
              
              {/* Image count or indicator */}
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3" />
                <span>1/{announcement.imageUrl ? '1' : '0'}</span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h4 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                {announcement.title}
              </h4>
              {isSuperAdmin && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onEdit(announcement)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Announcement"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(announcement.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {announcement.message}
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-gray-500 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(announcement.createdAt), 'PPP p')}
            </div>

            {announcement.createdBy?.name && (
              <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                <User className="w-3.5 h-3.5" />
                Posted by: {announcement.createdBy.name}
              </div>
            )}

            {announcement.expiryDate && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <Clock className="w-3.5 h-3.5" />
                Expires: {format(new Date(announcement.expiryDate), 'PPP')}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Image Preview Modal */}
      {showPreview && (
        <ImagePreviewModal
          src={announcement.imageUrl!}
          alt={announcement.title}
          title={announcement.title}
          date={format(new Date(announcement.createdAt), 'PPP p')}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

// ============================================
// Announcement Modal Component
// ============================================

function AnnouncementModal({
  title,
  submitLabel,
  isSubmitting,
  onClose,
  onSubmit,
  titleValue,
  onTitleChange,
  messageValue,
  onMessageChange,
  expiryDateValue,
  onExpiryDateChange,
  imagePreview,
  onFileChange,
  onRemoveImage,
}: {
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  titleValue: string;
  onTitleChange: (value: string) => void;
  messageValue: string;
  onMessageChange: (value: string) => void;
  expiryDateValue: string;
  onExpiryDateChange: (value: string) => void;
  imagePreview: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between sticky top-0 bg-white pb-4 border-b border-gray-100">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-green-700" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={titleValue}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter announcement title"
              className="rounded-2xl"
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {titleValue.length}/100
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={messageValue}
              onChange={(e) => onMessageChange(e.target.value)}
              rows={5}
              placeholder="Write your announcement message..."
              className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-green-600 focus:ring-4 focus:ring-green-600/10 outline-none text-sm resize-none transition-all"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {messageValue.length}/1000
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Expiry Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={expiryDateValue}
              onChange={(e) => onExpiryDateChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-green-600 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Image (Optional)
            </label>
            <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition-all">
              <Upload className="w-5 h-5 text-green-700 flex-shrink-0" />
              <div className="flex-1 text-sm text-gray-700 truncate">
                {imagePreview ? 'Image uploaded' : 'Click to upload announcement image'}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </label>
            {imagePreview && (
              <div className="mt-3 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-2xl"
                />
                <button
                  onClick={onRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Max 5MB. Supports JPEG, PNG, WEBP, GIF
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <Button
            variant="secondary"
            onClick={onClose}
            className="rounded-2xl px-5 py-3 font-bold"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!titleValue.trim() || !messageValue.trim() || isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-6 py-3 font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {submitLabel === 'Publish Announcement' ? 'Publishing...' : 'Updating...'}
              </>
            ) : (
              <>
                <Megaphone className="w-4 h-4" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Delete Confirmation Modal
// ============================================

function DeleteConfirmModal({
  onClose,
  onConfirm,
  isDeleting,
}: {
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-black text-gray-900">Delete Announcement</h3>
        </div>

        <p className="text-gray-600">
          Are you sure you want to delete this announcement? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="rounded-2xl px-5 py-3 font-bold"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-6 py-3 font-bold flex items-center gap-2"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}