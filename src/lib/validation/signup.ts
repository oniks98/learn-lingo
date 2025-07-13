import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  email: z.email({ message: 'Invalid email format' }),
  password: z.string().min(6, 'Please select a password min 6'),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
