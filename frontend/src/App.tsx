import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@context/AuthContext';
import { ToastProvider, useToast } from '@context/ToastContext';
import { ToastContainer } from '@components/ui/Toast';
import { Layout } from '@components/layout/Layout';
import { ProtectedRoute } from '@components/layout/ProtectedRoute';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { ImportPage } from '@pages/ImportPage';
import { ModelosPage } from '@pages/ModelosPage';
import { ModeloDetailPage } from '@pages/ModeloDetailPage';
import { MarcasPage } from '@pages/MarcasPage';
import { AgregarDatosPage } from '@pages/AgregarDatosPage';
import { RevisarVehiculosPage } from '@pages/RevisarVehiculosPage';
import { UsuariosPage } from '@pages/UsuariosPage';
import { CargarDatosPage } from '@pages/CargarDatosPage';
import { RevisarPage } from '@pages/RevisarPage';
import '@styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppRoutes() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Navigate to="/dashboard" replace />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/marcas"
          element={
            <ProtectedRoute>
              <Layout>
                <MarcasPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/import"
          element={
            <ProtectedRoute>
              <Layout>
                <ImportPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/modelos"
          element={
            <ProtectedRoute>
              <Layout>
                <ModelosPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/modelos/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ModeloDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/agregar-equipamiento"
          element={
            <ProtectedRoute>
              <Layout>
                <AgregarDatosPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/agregar-datos"
          element={
            <ProtectedRoute>
              <Layout>
                <AgregarDatosPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cargar-datos"
          element={
            <ProtectedRoute>
              <Layout>
                <CargarDatosPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/revisar"
          element={
            <ProtectedRoute>
              <Layout>
                <RevisarPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <Layout>
                <UsuariosPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
