import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import Users from './pages/Users';
import Patients from './pages/Patients';
import PatientExpediente from './pages/PatientExpediente';
import NewEvaluation from './pages/NewEvaluation';
import EvaluationDetail from './pages/EvaluationDetail';
import { AuthService } from './services/api';

const RoleRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const user = AuthService.getCurrentUser();
  if (!user) return <Navigate to="/" />;
  if (!allowedRoles.includes(user.rol)) {
    // Redirect unauthorized users to their designated homepage
    return <Navigate to={user.rol === 'ADMIN' ? '/usuarios' : '/dashboard'} />;
  }
  return <>{children}</>;
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main style={{ padding: '32px', overflowY: 'auto', background: 'rgba(0,0,0,0.02)' }}>
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={
          <RoleRoute allowedRoles={['MEDICO', 'ENFERMERO']}>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </RoleRoute>
        } />

        <Route path="/pacientes" element={
          <RoleRoute allowedRoles={['MEDICO', 'ENFERMERO']}>
            <DashboardLayout>
              <Patients />
            </DashboardLayout>
          </RoleRoute>
        } />

        <Route path="/pacientes/:id" element={
          <RoleRoute allowedRoles={['MEDICO', 'ENFERMERO', 'ADMIN']}>
            <DashboardLayout>
              <PatientExpediente />
            </DashboardLayout>
          </RoleRoute>
        } />

        <Route path="/pacientes/:id/evaluacion" element={
          <RoleRoute allowedRoles={['MEDICO', 'ENFERMERO']}>
            <DashboardLayout>
              <NewEvaluation />
            </DashboardLayout>
          </RoleRoute>
        } />

        <Route path="/pacientes/:id/evaluaciones/:evalId" element={
          <RoleRoute allowedRoles={['MEDICO', 'ENFERMERO', 'ADMIN']}>
            <DashboardLayout>
              <EvaluationDetail />
            </DashboardLayout>
          </RoleRoute>
        } />

        <Route path="/usuarios" element={
          <RoleRoute allowedRoles={['ADMIN']}>
            <DashboardLayout>
              <Users />
            </DashboardLayout>
          </RoleRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
