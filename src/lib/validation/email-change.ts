import { z } from 'zod';

export const emailChangeSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
});

export type EmailChangeFormValues = z.infer<typeof emailChangeSchema>;
