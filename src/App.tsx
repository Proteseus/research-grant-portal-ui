import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import SubmitProposal from './pages/SubmitProposal';
import ProposalDetails from './pages/ProposalDetails';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProposals from './pages/admin/Proposals';
import AdminProposalDetails from './pages/admin/ProposalDetails';
import AdminUsers from './pages/admin/Users';
import AdminCalls from './pages/admin/Calls';
import AdminCallForm from './pages/admin/CallForm';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'ADMIN') return <Navigate to="/" />;
  return children;
};

function App() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* Admin Routes */}
          <Route
            path="/"
            element={
              isAdmin ? (
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              ) : (
                <Dashboard />
              )
            }
          />
          <Route
            path="/admin/proposals"
            element={
              <AdminRoute>
                <AdminProposals />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/proposals/:id"
            element={
              <AdminRoute>
                <AdminProposals />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/calls"
            element={
              <AdminRoute>
                <AdminCalls />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/calls/new"
            element={
              <AdminRoute>
                <AdminCallForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/calls/:id"
            element={
              <AdminRoute>
                <AdminCallForm />
              </AdminRoute>
            }
          />

          {/* Researcher Routes */}
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/proposals/submit/:callId" element={<SubmitProposal />} />
          <Route path="/proposals/:id" element={<ProposalDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;