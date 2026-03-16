import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserPlus,
    LogOut,
    Activity,
    Settings
} from 'lucide-react';
import { AuthService } from '../services/api';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = AuthService.getCurrentUser();

    let menuItems: { name: string; icon: JSX.Element; path: string; }[] = [];

    if (user?.rol === 'ADMIN') {
        menuItems = [
            { name: 'Gestión Usuarios', icon: <Users size={20} />, path: '/usuarios' }
        ];
    } else {
        menuItems = [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
            { name: 'Pacientes', icon: <Activity size={20} />, path: '/pacientes' }
        ];
    }

    const handleLogout = () => {
        AuthService.logout();
        navigate('/');
    };

    return (
        <div className="glass-panel" style={{
            margin: '16px',
            height: 'calc(100vh - 32px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                <div style={{ padding: '8px', background: 'var(--primary)', borderRadius: '10px' }}>
                    <Activity color="white" />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>VitalTrack</h2>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        style={{
                            background: location.pathname === item.path ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                            color: location.pathname === item.path ? 'var(--primary)' : 'var(--text-muted)',
                            justifyContent: 'flex-start',
                            padding: '12px'
                        }}
                    >
                        {item.icon}
                        {item.name}
                    </button>
                ))}
            </nav>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <button
                    onClick={handleLogout}
                    style={{ width: '100%', color: 'var(--accent)', justifyContent: 'flex-start' }}
                >
                    <LogOut size={20} />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
