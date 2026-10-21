import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
export default function ProtectedRoute({ children }) { const { session, loading } = useAuth(); if (loading) return <div className="p-8">Loading session…</div>; return session ? children : <Navigate to="/login" replace />; }
