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
    status: ComplaintStatus;
    priority: Priority;
    weeklyTrend: { day: string; count: number }[];
    // New fields from your Prisma schema/Controllers
    isAnonymous: boolean;
    location?: string | null;
    viewCount: number;
    
    // Relations
    author: User | null;     // This represents 'createdBy' (User who made it)
    authorId?: string | null;
    
    assignedTo: User | null;
    assignedToId?: string | null;
    
    category: Category;
    categoryId: string;
  
    // Timestamps
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string | null;
    deletedAt?: string | null;
  
    // Nested Data
    comments?: Comment[];      // Added for the comments array
    attachments?: Attachment[];
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