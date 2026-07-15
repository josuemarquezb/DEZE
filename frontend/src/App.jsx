// App.jsx — top-level route definitions.
// Add new screens under pages/ and register their routes here.

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import DetailerOnboarding from './pages/DetailerOnboarding.jsx';
import DetailerDashboard from './pages/DetailerDashboard.jsx';
import DetailerProfile from './pages/DetailerProfile.jsx';
import PostJob from './pages/PostJob.jsx';
import JobsList from './pages/JobsList.jsx';
import JobsMap from './pages/JobsMap.jsx';
import JobDetail from './pages/JobDetail.jsx';
import CustomerJobs from './pages/CustomerJobs.jsx';
import DetailerJobs from './pages/DetailerJobs.jsx';
import JobChat from './pages/JobChat.jsx';
import LeaveReview from './pages/LeaveReview.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminDetailers from './pages/AdminDetailers.jsx';
import AdminDetailerDetail from './pages/AdminDetailerDetail.jsx';
import AdminJobs from './pages/AdminJobs.jsx';
import AdminRevenue from './pages/AdminRevenue.jsx';
import NotificationCenter from './pages/NotificationCenter.jsx';

/** Restricts a route to logged-in detailers; sends everyone else to /login or /. */
function RequireDetailer({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.userType !== 'DETAILER') return <Navigate to="/" replace />;
  return children;
}

/** Restricts a route to logged-in customers; sends everyone else to /login or /. */
function RequireCustomer({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.userType !== 'CUSTOMER') return <Navigate to="/" replace />;
  return children;
}

/** Restricts a route to any logged-in user; sends anonymous visitors to /login. */
function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/** Restricts a route to admins; sends everyone else to /login or /. */
function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;
  return children;
}

/** Public marketing homepage for anonymous visitors; sends logged-in users to their dashboard. */
function HomeRoute() {
  const { user } = useAuth();
  if (!user) return <LandingPage />;
  if (user.isAdmin) return <Navigate to="/admin" replace />;
  if (user.userType === 'DETAILER') return <Navigate to="/detailer/dashboard" replace />;
  return <Navigate to="/customer/jobs" replace />;
}

function App() {
  const { user } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/' && !user;

  return (
    <div className="min-h-screen bg-zinc-950">
      {!isLandingPage && <Navbar />}
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/onboarding"
          element={
            <RequireDetailer>
              <DetailerOnboarding />
            </RequireDetailer>
          }
        />
        <Route
          path="/detailer/dashboard"
          element={
            <RequireDetailer>
              <DetailerDashboard />
            </RequireDetailer>
          }
        />
        <Route path="/detailer/:id" element={<DetailerProfile />} />

        <Route
          path="/jobs/new"
          element={
            <RequireCustomer>
              <PostJob />
            </RequireCustomer>
          }
        />
        <Route
          path="/jobs"
          element={
            <RequireDetailer>
              <JobsList />
            </RequireDetailer>
          }
        />
        <Route
          path="/jobs/map"
          element={
            <RequireDetailer>
              <JobsMap />
            </RequireDetailer>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <RequireAuth>
              <JobDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/jobs/:id/chat"
          element={
            <RequireAuth>
              <JobChat />
            </RequireAuth>
          }
        />
        <Route
          path="/jobs/:id/review"
          element={
            <RequireCustomer>
              <LeaveReview />
            </RequireCustomer>
          }
        />
        <Route
          path="/customer/jobs"
          element={
            <RequireCustomer>
              <CustomerJobs />
            </RequireCustomer>
          }
        />
        <Route
          path="/detailer/jobs"
          element={
            <RequireDetailer>
              <DetailerJobs />
            </RequireDetailer>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/detailers"
          element={
            <RequireAdmin>
              <AdminDetailers />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/detailers/:id"
          element={
            <RequireAdmin>
              <AdminDetailerDetail />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <RequireAdmin>
              <AdminJobs />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/revenue"
          element={
            <RequireAdmin>
              <AdminRevenue />
            </RequireAdmin>
          }
        />

        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <NotificationCenter />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
