import { cache } from 'react';
import { QueryClient } from '@tanstack/react-query';

const queryClient = cache(() => new QueryClient()) as () => QueryClient;
export default queryClient;
