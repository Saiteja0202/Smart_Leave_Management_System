import { Routes, Route } from 'react-router-dom';
import LandingPage from './Components/Others/LandingPage';
import AdminLogin from './Components/Admin/AdminLogin';
import AdminRegister from './Components/Admin/AdminRegistration';
import AdminDashboard from './Components/Admin/AdminDashboard';
import AdminProfile from './Components/Admin/AdminProfile';
import AdminAddCalendar from './Components/Admin/AdminAddCalendar';
import AdminAddRoles from './Components/Admin/AdminAddRoles';
import AdminLeavePolicies from './Components/Admin/AdminAddLeavePolicies';
import AdminUserPromotion from './Components/Admin/AdminUserPromotion';
import AdminUsers from './Components/Admin/AdminUsers';
import AuthGuard from './Components/ApiCenter/AuthGuard';
import AdminReports from './Components/Admin/AdminReports';
import UserLogin from './Components/User/UserLogin';
import UserRegistration from './Components/User/UserRegistration';
import UserDashboard from './Components/User/UserDashboard';
import UserProfile from './Components/User/UserProfile';
import UserLeaveBalance from './Components/User/UserLeaveBalance';
import UserLeaveRequests from './Components/User/UserLeaveRequests';
import UserHolidays from './Components/User/UserHolidays';
import UserApplyLeave from './Components/User/UserApplyLeave';
import UserApproval from './Components/User/UserApprovals'; 
import UserAllLeaveBalances from './Components/User/UserAllLeaveBalances'; 
import AdminRegistartionHistory from  './Components/Admin/AdminRegistrationHistory';
import AdminAllUsersLeaveBalances from './Components/Admin/AdminAllUsersLeaveBalances';
import NotFound from './Components/Others/NotFound';

import AdminLeaveRequests from './Components/Admin/AdminLeaveRequests';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-register" element={<AdminRegister />} />
      <Route path="/user-login" element={<UserLogin />} />
      <Route path="/user-registration" element={<UserRegistration />} />
      
      <Route
        path="/admin-dashboard"
        element={
          <AuthGuard>
            <AdminDashboard />
          </AuthGuard>
        }
      >
        <Route index element={<AdminProfile />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="add-calendar" element={<AdminAddCalendar />} />
        <Route path="add-roles" element={<AdminAddRoles />} />
        <Route path="leave-policies" element={<AdminLeavePolicies />} />
        <Route path="user-promotion" element={<AdminUserPromotion />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="leave-requests" element={<AdminLeaveRequests />} /> 
        <Route path="reports" element={<AdminReports />} />
        <Route path="registration-history" element={<AdminRegistartionHistory />} />
        <Route path="all-users-leavebalance" element={<AdminAllUsersLeaveBalances />} />
        
      </Route>

      <Route
  path="/user-dashboard"
  element={
    <AuthGuard>
      <UserDashboard />
    </AuthGuard>
  }
>
  <Route index element={<UserProfile />} />
  <Route path="user-profile" element={<UserProfile />} />
  <Route path="user-leavebalance" element={<UserLeaveBalance />} />
  <Route path="user-leave-requests" element={<UserLeaveRequests />} />
  <Route path="user-holidays" element={<UserHolidays />} />
  <Route path="user-apply-leave" element={<UserApplyLeave />} />
  <Route path="user-approvals" element={<UserApproval />} />
  <Route path="user-all-leavebalance" element={<UserAllLeaveBalances />} />
</Route>

 
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};


export default AppRoutes;
