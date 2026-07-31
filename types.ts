// Role enum matching backend database schema
export type Role =
  | 'SUPER_ADMIN'
  | 'SRC_EXECUTIVE'
  | 'SRC_MEMBER'
  | 'ICT_UNIT'
  | 'SECURITY_UNIT'
  | 'HOSTEL_MANAGEMENT_UNIT'
  | 'SENATE_UNIT'
  | 'CLASS_REP'
  | 'STUDENT';

export interface Department {
  id: string;
  name: string;
  code: string;
  facultyId?: string;
}

export interface Faculty {
  id: string;
  name: string;
  code?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  studentId?: string | null;
  role: Role;
  departmentId?: string | null;
  department?: Department | null;
  facultyId?: string | null;
  faculty?: Faculty | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  assignedUnit?: Role | null; // e.g. ICT_UNIT, HOSTEL_MANAGEMENT_UNIT
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  complaintId?: string | null;
  commentId?: string | null;
  uploadedAt: string;
}

export interface StatusHistory {
  id?: string;
  fromStatus: ComplaintStatus | string;
  toStatus: ComplaintStatus;
  changedBy: {
    id: string;
    name: string;
    role: Role;
  } | string;
  reason?: string | null;
  changedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  isInternal: boolean; // True for internal staff/SRC notes invisible to students
  complaintId: string;
  authorId: string;
  author: User;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: Priority;
  isAnonymous: boolean;
  location?: string | null;
  viewCount: number;
  tags?: string[];
  
  // Author can be null or anonymous metadata if isAnonymous is true
  authorId?: string | null;
  author?: User | null;
  
  // Add this property
  _count?: {
    comments?: number;
    upvotes?: number;
  };
  categoryId: string;
  category: Category;

  // Departmental routing
  assignedUnit?: Role | null;
  assignedToId?: string | null;
  assignedTo?: User | null;

  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;

  moderationNotes?: string | null;
  comments?: Comment[];
  attachments?: Attachment[];
  statusHistory?: StatusHistory[];
}

export interface ComplaintStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  byCategory: {
    categoryId: string;
    categoryName?: string;
    _count: number;
  }[];
  byPriority: {
    priority: Priority;
    _count: number;
  }[];
  byStatus?: {
    status: ComplaintStatus;
    _count: number;
  }[];
}

export type NotificationType =
  | 'COMPLAINT_CREATED'
  | 'COMPLAINT_UPDATED'
  | 'COMMENT_ADDED'
  | 'STATUS_CHANGED'
  | 'ASSIGNED';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  complaintId?: string | null;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}