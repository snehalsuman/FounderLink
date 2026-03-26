import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice';

const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return {
    user,
    isAuthenticated,
    isFounder: user?.role === 'ROLE_FOUNDER',
    isInvestor: user?.role === 'ROLE_INVESTOR',
    isAdmin: user?.role === 'ROLE_ADMIN',
    isCoFounder: user?.role === 'ROLE_COFOUNDER',
    userId: user?.userId,
    role: user?.role,
  };
};

export default useAuth;
