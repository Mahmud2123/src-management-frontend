import { z } from 'zod';

export const complaintSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters long' })
    .max(120, { message: 'Title must not exceed 120 characters' }),
  description: z
    .string()
    .min(10, { message: 'Please provide a clear description (at least 10 characters)' }),
  categoryId: z
    .string({ required_error: 'Please select a valid category' })
    .min(1, { message: 'Please select a category' }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'], {
    invalid_type_error: 'Priority must be LOW, MEDIUM, or HIGH',
  }),
  isAnonymous: z.boolean().default(false),
  location: z.string().optional(),
});

export type ComplaintFormValues = z.infer<typeof complaintSchema>;