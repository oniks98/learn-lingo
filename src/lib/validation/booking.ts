// src/lib/validation/booking.ts
import { z } from 'zod';

export const bookingSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  email: z.email({ message: 'Invalid email format' }),
  phone: z.string().min(1, 'Phone number is required'),
  reason: z.string().min(1, 'Please select a reason'),
  bookingDate: z.date(),
  comment: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
