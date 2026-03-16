import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, User, Activity, Calendar, ClipboardList, Shield, Zap } from 'lucide-react';
import TelemetryDashboard from '../components/TelemetryDashboard';

const PatientExpediente = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [expediente, setExpediente] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchExpediente = async () => {
        try {
            const response = await api.get(`/usuarios/${id}/expediente`);
            setExpediente(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar el expediente');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpediente();
    }, [id]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando expediente...</div>;
    if (error) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--accent)' }}>{error}</p>
            <button onClick={() => navigate('/pacientes')} className="primary" style={{ marginTop: '16px' }}>Volver</button>
        </div>
    );

    const perfil = expediente?.perfilPaciente;
    const evaluations = perfil?.evaluaciones || [];
    const devices = perfil?.dispositivos || [];

    if (!expediente || !expediente.id) return null;

    const calculateAge = (birthday: string) => {
        if (!birthday) return '---';
        const ageDifMs = Date.now() - new Date(birthday).getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    return (
        <div className="animate-fade-in">
            <button 
                onClick={() => navigate(-1)} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '24px' }}
            >
                <ArrowLeft size={20} /> Volver a pacientes
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <User size={32} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>{expediente.nombre} {expediente.apellidoPaterno} {expediente.apellidoMaterno}</h1>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <p style={{ color: 'var(--text-muted)' }}>Expediente Digital # {expediente.id?.substring(0, 8).toUpperCase()}</p>
                            <span style={{ color: 'var(--text-muted)' }}>•</span>
                            <p style={{ fontWeight: '500' }}>{calculateAge(perfil?.fechaNacimiento)} Años</p>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button className="primary" onClick={() => navigate(`/pacientes/${id}/evaluacion`)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClipboardList size={18} /> Nueva Evaluación
                    </button>
                    <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                        Monitor Activo
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '32px' }}>
                {/* Lateral: Info Personal y Clínica */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ClipboardList size={20} color="var(--primary)" /> Datos Clínicos
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>TIPO DE ÓRTESIS</label>
                                <div style={{ fontWeight: '600' }}>{perfil?.tipoOrtesis || 'No especificada'}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>MIEMBRO AFECTADO</label>
                                <div style={{ fontWeight: '600' }}>{perfil?.miembroAfectado || 'No especificado'}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>TIPO DE SANGRE</label>
                                <div style={{ fontWeight: '600', fontSize: '18px' }}>{perfil?.tipoSanguineo || 'No registrado'}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CURP</label>
                                <div style={{ fontWeight: '500' }}>{expediente.curp || perfil?.curp || '---'}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ALERGIAS</label>
                                <div style={{ color: perfil?.alergias ? 'var(--accent)' : 'inherit' }}>{perfil?.alergias || 'Ninguna conocida'}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ANTECEDENTES</label>
                                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{perfil?.antecedentes || 'Sin registros médicos previos.'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Zap size={20} color="#10b981" /> Dispositivos Hardware
                        </h3>
                        {devices.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No hay dispositivos vinculados.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {devices.map((d: any) => (
                                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>
                                        <div style={{ color: '#10b981' }}><Activity size={18} /></div>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: '600' }}>{d.dispositivoId}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.modelo}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Principal: Historial Evaluaciones */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Telemetry Dashboard Component */}
                    <TelemetryDashboard patientId={id!} />

                    <div className="glass-panel" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Historial de Evaluaciones Clínicas</h3>
                        
                        {evaluations.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                                <Calendar size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                <p>No se han registrado evaluaciones para este paciente aún.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {evaluations.map((evalu: any) => (
                                    <div key={evalu.id} style={{ padding: '24px', border: '1px solid var(--glass-border)', borderRadius: '16px', background: 'rgba(0,0,0,0.01)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                                    <Shield size={20} color="var(--primary)" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>Evaluado por: {evalu.nombreEvaluador}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(evalu.fechaCreacion).toLocaleDateString()} a las {new Date(evalu.fechaCreacion).toLocaleTimeString()}</div>
                                                </div>
                                            </div>
                                            <div style={{ background: 'var(--secondary)', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '500' }}>
                                                Consulta Presencial
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Diagnóstico Principal</label>
                                            <p style={{ fontWeight: '500', lineHeight: '1.6' }}>{evalu.diagnostico}</p>
                                        </div>

                                        {evalu.observaciones && (
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Observaciones Doctores</label>
                                                <p style={{ fontSize: '14px', color: 'var(--text-main)', opacity: 0.8 }}>{evalu.observaciones}</p>
                                            </div>
                                        )}

                                        {evalu.indicaciones && (
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Indicaciones Médicas</label>
                                                <p style={{ fontSize: '14px', color: 'var(--text-main)', opacity: 0.8 }}>{evalu.indicaciones}</p>
                                            </div>
                                        )}

                                        {evalu.medicamentos && (
                                            <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.05)', borderRadius: '12px', border: '1px dashed rgba(6, 182, 212, 0.3)', marginBottom: '16px' }}>
                                                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Medicamentos Recetados</label>
                                                <p style={{ fontSize: '14px', fontWeight: '500' }}>{evalu.medicamentos}</p>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => navigate(`/pacientes/${id}/evaluaciones/${evalu.id}`)}
                                            style={{ width: '100%', marginTop: '8px', background: 'var(--primary)', color: 'white', justifyContent: 'center', fontWeight: '700' }}
                                        >
                                            <ClipboardList size={16} /> Ver Detalle Completo (VGI)
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientExpediente;
