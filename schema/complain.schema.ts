// src/schema/complaint.schema.ts
import { z } from 'zod';

export const complaintSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  categoryId: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  isAnonymous: z.boolean(),
  location: z.string().optional(),
});
