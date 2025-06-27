// import React from 'react';
// import { dehydrate } from '@tans/react-query';
// import getQueryClient from '@/lib/client/get-query-client';
// import Providers from '@/providers/providers';
//
// export default async function Page() {
//
//     const queryClient = getQueryClient();
//
//        await queryClient.prefetchQuery({
//         queryKey: ['companies'],
//         queryFn: () => getCompanies({ cache: 'no-store' }),
//         staleTime: 10 * 1000,
//     });
//
//
//     const dehydratedState = dehydrate(queryClient);
//
//        return (
//         <Providers dehydratedState={dehydratedState}>
//             <CompanyTable />
//         </Providers>
//     );
// }