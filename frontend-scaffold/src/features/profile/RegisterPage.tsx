import React, { useState } from 'react';
import RegisterForm from './RegisterForm';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import AvatarUpload from './AvatarUpload';
import PageContainer from '@/components/layout/PageContainer';

const RegisterPage: React.FC = () => {
  const [ipfsHash, setIpfsHash] = useState<string>('');

  return (
    <ErrorBoundary>
      <PageContainer maxWidth="md" ariaLabel="Register profile content" className="py-16">
        <div className="max-w-lg mx-auto">
          <h1 className="text-4xl font-black mb-2">Create Your Profile</h1>
          <p className="text-gray-600 mb-10">
            Register once on-chain. Supporters will find you at {import.meta.env.VITE_APP_URL || window.location.origin}/@you.
          </p>
          <section
            role="region"
            aria-labelledby="profile-picture-heading"
            className="mb-8"
          >
            <h2 id="profile-picture-heading" className="text-lg font-semibold mb-4">Profile Picture</h2>
            <AvatarUpload onUploadSuccess={(hash) => setIpfsHash(hash)} />
            {ipfsHash && <p className="text-sm text-green-600 mt-2 text-center">Image uploaded successfully!</p>}
          </section>
          <RegisterForm initialImageUrl={ipfsHash} />
        </div>
      </PageContainer>
    </ErrorBoundary>
  );
};

export default RegisterPage;
