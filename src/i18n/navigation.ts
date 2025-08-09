import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Легкі обгортки навколо навігації Next.js
// API, що враховують конфігурацію маршрутизації
export const { Link, usePathname, useRouter } = createNavigation(routing);
