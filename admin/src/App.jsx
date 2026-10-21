import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManageApps from './pages/ManageApps';
import AppForm from './pages/AppForm';
import Categories from './pages/Categories';
import Analytics from './pages/Analytics';
export default function App() { return <AuthProvider><Routes><Route path="/login" element={<Login />} /><Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}><Route path="/" element={<Dashboard />} /><Route path="/apps" element={<ManageApps />} /><Route path="/apps/new" element={<AppForm />} /><Route path="/apps/:id" element={<AppForm />} /><Route path="/categories" element={<Categories />} /><Route path="/analytics" element={<Analytics />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></AuthProvider>; }
