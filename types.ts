// types/index.ts
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'SRC_MEMBER' | 'SRC_EXECUTIVE' | 'ADMIN' | 'CLASS_REP';
    department?:{
      name:string;
      code:string;
    }

  }
  
  export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  
  export interface Category {
    id: string;
    name: string;
  }
  export interface Complaint {
    id: string;
    title: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    isAnonymous: boolean;
    location?: string | null;
    viewCount: number;
    tags?: string[]; // ✅ Added this
    author: any;
    category: any;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string | null;
    comments?: any[];
    attachments?: any[];
    statusHistory?: { // ✅ Added this
      fromStatus: string;
      toStatus: string;
      changedBy: string;
      changedAt: string;
    }[];
  }
  export interface Comment {
    id: string;
    content: string;
    isInternal: boolean;
    complaintId: string;
    authorId: string;
    author: User;
    createdAt: string;
    updatedAt: string;
    attachments?: Attachment[];
  }

// types/index.ts
export interface ComplaintStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  byCategory: {
    categoryId: string;
    _count: number;
  }[];
  byPriority: {
    priority: string;
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
  metadata?: any; // For extra flexible data
}

// Interface for the dashboard statistics response

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  complaintId?: string;
  commentId?: string;
  uploadedAt: string;
}