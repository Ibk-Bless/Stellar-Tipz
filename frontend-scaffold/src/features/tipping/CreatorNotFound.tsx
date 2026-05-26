import React from 'react';
import { Link } from 'react-router-dom';

import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface CreatorNotFoundProps {
  username?: string;
}

const CreatorNotFound: React.FC<CreatorNotFoundProps> = ({ username }) => {
  return (
    <PageContainer maxWidth="md" className="py-10">
      <Card className="space-y-4" padding="lg">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-gray-800 dark:text-gray-200">Creator lookup</p>
        <h1 className="text-3xl font-black uppercase">Creator not found</h1>
        <p className="text-sm font-bold text-gray-700">
          We could not find @{username ?? 'unknown'}. Check the username and try again.
        </p>
        <Link to="/leaderboard" className="inline-flex">
          <Button type="button">Browse creators</Button>
        </Link>
      </Card>
    </PageContainer>
  );
};

export default CreatorNotFound;
