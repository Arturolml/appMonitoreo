import { useState, useEffect } from 'react';
import { Users, Bell, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [summary, setSummary] = useState({
        activePatients: 0,
        activeDoctors: 0,
        criticalAlerts: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await api.get('/dashboard/resumen');
                setSummary(response.data);
            } catch (err) {
                console.error("Error al cargar resumen", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color, onClick }: any) => (
        <div 
            onClick={onClick}
            className="glass-panel" 
            style={{ 
                padding: '24px', 
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ 
                    padding: '10px', 
                    background: `${color}1A`, 
                    color: color,
                    borderRadius: '12px'
                }}>
                    <Icon size={24} />
                </div>
                {onClick && <ArrowRight size={16} color="var(--text-muted)" />}
            </div>
            <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>{title}</p>
                <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '4px' }}>
                    {loading ? '...' : value}
                </h2>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Dashboard Resumen</h1>
                <p style={{ color: 'var(--text-muted)' }}>Bienvenido al centro de control regional.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <StatCard 
                    title="Pacientes Activos" 
                    value={summary.activePatients} 
                    icon={Users} 
                    color="#8B5CF6"
                    onClick={() => navigate('/pacientes')}
                />
                <StatCard 
                    title="Alertas Críticas" 
                    value={summary.criticalAlerts} 
                    icon={Bell} 
                    color="#EF4444" 
                />
            </div>

        </div>
    );
};

export default Dashboard;
