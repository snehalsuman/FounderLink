import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import store from './store/store';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import FounderDashboard from './pages/founder/FounderDashboard';
import MyStartups from './pages/founder/MyStartups';
import CreateStartup from './pages/founder/CreateStartup';
import EditStartup from './pages/founder/EditStartup';
import FounderInvestments from './pages/founder/FounderInvestments';
import MyInvitations from './pages/founder/MyInvitations';
import TeamManagement from './pages/founder/TeamManagement';
import CoFounderDashboard from './pages/cofounder/CoFounderDashboard';
import InvestorDashboard from './pages/investor/InvestorDashboard';
import BrowseStartups from './pages/investor/BrowseStartups';
import StartupDetail from './pages/investor/StartupDetail';
import MyInvestments from './pages/investor/MyInvestments';
import AdminDashboard from './pages/admin/AdminDashboard';
import Notifications from './pages/common/Notifications';
import Messages from './pages/common/Messages';
import Chat from './pages/common/Chat';
import Profile from './pages/common/Profile';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/unauthorized" element={<div className="min-h-screen flex items-center justify-center"><p className="text-xl text-gray-500">403 - Access Denied</p></div>} />

          {/* Founder — ROLE_FOUNDER only */}
          <Route path="/founder/dashboard" element={<ProtectedRoute allowedRoles={['ROLE_FOUNDER']}><FounderDashboard /></ProtectedRoute>} />
          <Route path="/founder/startups" element={<ProtectedRoute allowedRoles={['ROLE_FOUNDER']}><MyStartups /></ProtectedRoute>} />
          <Route path="/founder/startups/create" element={<ProtectedRoute allowedRoles={['ROLE_FOUNDER']}><CreateStartup /></ProtectedRoute>} />
          <Route path="/founder/startups/:id/edit" element={<ProtectedRoute allowedRoles={['ROLE_FOUNDER']}><EditStartup /></ProtectedRoute>} />
          <Route path="/founder/team/:startupId" element={<ProtectedRoute allowedRoles={['ROLE_FOUNDER']}><TeamManagement /></ProtectedRoute>} />
          <Route path="/founder/investments" element={<ProtectedRoute allowedRoles={['ROLE_FOUNDER']}><FounderInvestments /></ProtectedRoute>} />

          {/* Co-Founder — ROLE_COFOUNDER only */}
          <Route path="/cofounder/dashboard" element={<ProtectedRoute allowedRoles={['ROLE_COFOUNDER']}><CoFounderDashboard /></ProtectedRoute>} />
          <Route path="/cofounder/startups" element={<ProtectedRoute allowedRoles={['ROLE_COFOUNDER']}><BrowseStartups /></ProtectedRoute>} />
          <Route path="/cofounder/startups/:id" element={<ProtectedRoute allowedRoles={['ROLE_COFOUNDER']}><StartupDetail /></ProtectedRoute>} />
          <Route path="/founder/invitations" element={<ProtectedRoute allowedRoles={['ROLE_COFOUNDER']}><MyInvitations /></ProtectedRoute>} />

          {/* Investor */}
          <Route path="/investor/dashboard" element={<ProtectedRoute allowedRoles={['ROLE_INVESTOR']}><InvestorDashboard /></ProtectedRoute>} />
          <Route path="/investor/startups" element={<ProtectedRoute allowedRoles={['ROLE_INVESTOR']}><BrowseStartups /></ProtectedRoute>} />
          <Route path="/investor/startups/:id" element={<ProtectedRoute allowedRoles={['ROLE_INVESTOR']}><StartupDetail /></ProtectedRoute>} />
          <Route path="/investor/investments" element={<ProtectedRoute allowedRoles={['ROLE_INVESTOR']}><MyInvestments /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><AdminDashboard /></ProtectedRoute>} />

          {/* Common */}
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/messages/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
