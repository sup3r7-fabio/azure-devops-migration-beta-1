import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/Home/HomePage';
import DualExplorerPage from '../pages/Explorer/DualExplorerPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import { ProtectedRoute } from '../auth/routeGuards';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/explorer" element={<DualExplorerPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
