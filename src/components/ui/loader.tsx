'use client';

import { ThreeDots } from 'react-loader-spinner';

export default function Loader() {
  return (
    <div className="mt-8 flex justify-center">
      <ThreeDots
        height="60"
        width="60"
        color="#f4c550"
        ariaLabel="loading"
        visible={true}
      />
    </div>
  );
}
