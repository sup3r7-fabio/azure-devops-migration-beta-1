import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { Page } from 'azure-devops-ui/Page';
import { Header, TitleSize } from 'azure-devops-ui/Header';
import { Card } from 'azure-devops-ui/Card';
import { Button } from 'azure-devops-ui/Button';

const ProfilePage: React.FC = () => {
  const { account, roles, getAccessToken } = useAuth();
  const [tokenSnippet, setTokenSnippet] = useState<string>('');

  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      if (token) {
        setTokenSnippet(token.substring(0, 24) + '...');
      }
    })();
  }, [getAccessToken]);

  return (
    <Page className="profile-page">
      <Header title="Profile" titleSize={TitleSize.Large} />
      <div style={{ padding: 16 }}>
        <Card className="bolt-card" contentProps={{ contentPadding: true }}>
          <h3>Account</h3>
          {account ? (
            <>
              <p><strong>Name:</strong> {account.name}</p>
              <p><strong>Username:</strong> {account.username}</p>
              <p><strong>Home Tenant:</strong> {account.tenantId}</p>
              <p><strong>Roles:</strong> {roles.length ? roles.join(', ') : 'None'}</p>
              <p><strong>Access Token (preview):</strong> {tokenSnippet || 'Loading...'}</p>
              <Button
                text="Refresh Token"
                onClick={async () => {
                  const t = await getAccessToken();
                  if (t) setTokenSnippet(t.substring(0, 24) + '...');
                }}
              />
            </>
          ) : <p>No account loaded.</p>}
        </Card>
      </div>
    </Page>
  );
};

export default ProfilePage;
