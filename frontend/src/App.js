import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClaimsList from './pages/ClaimsList';
import ImportClaims from './pages/ImportClaims';
import 'antd/dist/reset.css';
import ClaimDetails from './pages/ClaimDetails';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/claims'
            element={
              <ProtectedRoute>
                <Layout>
                  <ClaimsList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/claims/:id'
            element={
              <ProtectedRoute>
                <Layout>
                  <ClaimDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path='/import'
            element={
              <ProtectedRoute>
                <Layout>
                  <ImportClaims />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path='/' element={<Navigate to='/dashboard' />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
