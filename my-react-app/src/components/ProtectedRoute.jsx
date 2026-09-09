import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { setAuthModalOpen } from '../store/authSlice';
import { ShieldAlert, ArrowLeft, Lock, Key, UserCheck } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [], requiredPermission = null }) {
  const dispatch = useDispatch();
  const { isAuthenticated, role, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-50 text-[#e40046] rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Authentication Required</h2>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          You need to sign in to access this restricted page. Please log in with your account credentials.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => dispatch(setAuthModalOpen(true))}
            className="bg-[#e40046] hover:bg-[#c7003d] text-white px-5 py-2.5 rounded font-bold text-xs uppercase tracking-wider shadow cursor-pointer"
          >
            Sign In Now
          </button>
          <Link
            to="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded font-bold text-xs uppercase tracking-wider no-underline flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>
    );
  }

  // Super Admin has master bypass access to all routes
  const isSuperAdmin = role === 'superadmin';

  // Role validation check
  const isRoleAllowed = allowedRoles.length === 0 || allowedRoles.includes(role) || isSuperAdmin;

  // Permission validation check (for Admin users)
  const userPermissions = user?.permissions || [];
  const isPermissionGranted = !requiredPermission || isSuperAdmin || userPermissions.includes(requiredPermission);

  if (!isRoleAllowed || !isPermissionGranted) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Your account role (<strong className="text-gray-800 uppercase">{role}</strong>) does not have authorization to view this page.
        </p>

        {requiredPermission && !isPermissionGranted && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded text-[11px] text-amber-800 font-medium mb-6">
            <span className="font-bold block mb-0.5">Missing Required Permission:</span>
            <code>{requiredPermission}</code> (Contact Super Admin to request access)
          </div>
        )}

        <div className="flex gap-3">
          <Link
            to="/"
            className="bg-[#e40046] hover:bg-[#c7003d] text-white px-5 py-2.5 rounded font-bold text-xs uppercase tracking-wider shadow no-underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </Link>
          <button
            onClick={() => dispatch(setAuthModalOpen(true))}
            className="bg-gray-800 hover:bg-black text-white px-4 py-2.5 rounded font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            Switch Account
          </button>
        </div>
      </div>
    );
  }

  return children;
}
