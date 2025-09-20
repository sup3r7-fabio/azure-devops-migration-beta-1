import React from 'react';
import { Page } from 'azure-devops-ui/Page';
import { Header, TitleSize } from 'azure-devops-ui/Header';
import { Button } from 'azure-devops-ui/Button';
import { Card } from 'azure-devops-ui/Card';
import { Observer } from 'azure-devops-ui/Observer';
import { useAuth } from '../../auth/AuthProvider';

const HomePage: React.FC = () => {
  const { isAuthenticated, account, login, logout } = useAuth();

  return (
    <Page className="home-page">
      <Header title="Azure DevOps Migration" titleSize={TitleSize.Large} />
  <div style={{ padding: 16 }}>
        <Card className="bolt-card" contentProps={{ contentPadding: true }}>
          <h2>Welcome</h2>
          <p>This is the starter landing page using azure-devops-ui components.</p>
          <p>
            {isAuthenticated ? (
              <>Signed in as <strong>{account?.name}</strong></>
            ) : 'You are not signed in.'}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Observer>
              {() => (
                <>
                  {!isAuthenticated && (
                    <Button primary text="Sign In" onClick={() => login()} />
                  )}
                  {isAuthenticated && (
                    <Button text="Profile" onClick={() => (window.location.href = '/profile')} />
                  )}
                  <Button text="Explorer" onClick={() => (window.location.href = '/explorer')} />
                  {isAuthenticated && (
                    <Button danger text="Sign Out" onClick={() => logout()} />
                  )}
                </>
              )}
            </Observer>
          </div>
        </Card>
  </div>
    </Page>
  );
};

export default HomePage;
