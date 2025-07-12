import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
  password: z.string().min(1, 'Please select a password'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
