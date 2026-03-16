import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ClipboardList, HeartPulse, User, Brain } from 'lucide-react';
import api from '../services/api';

const EvaluationDetail = () => {
    const { id, evalId } = useParams();
    const navigate = useNavigate();
    const [evaluation, setEvaluation] = useState<any>(null);
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [evalRes, patientRes] = await Promise.all([
                    api.get(`/evaluaciones/${evalId}`),
                    api.get(`/usuarios/${id}/expediente`)
                ]);
                setEvaluation(evalRes.data);
                setPatient(patientRes.data);
            } catch (err) {
                console.error("Error al cargar datos", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, evalId]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando expediente clínico...</div>;
    if (!evaluation) return <div style={{ padding: '40px', textAlign: 'center' }}>Evaluación no encontrada.</div>;

    const scales = evaluation.datosEscalas || {};

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <button onClick={() => navigate(-1)} className="glass-panel" style={{ padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Informe de Valoración Geriátrica</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Realizado el {new Date(evaluation.fechaCreacion).toLocaleString()} por <b>{evaluation.nombreEvaluador}</b></p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Resumen Ejecutivo */}
                    <div className="glass-panel" style={{ padding: '32px', borderLeft: '4px solid var(--primary)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ClipboardList size={22} color="var(--primary)" /> Diagnóstico y Observaciones
                        </h2>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Diagnóstico</label>
                            <p style={{ fontSize: '18px', fontWeight: '600', marginTop: '4px' }}>{evaluation.diagnostico}</p>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '12px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Observaciones Clínicas</label>
                            <p style={{ fontSize: '14px', lineHeight: '1.6', marginTop: '8px', whiteSpace: 'pre-wrap' }}>{evaluation.observaciones || 'Sin observaciones adicionales.'}</p>
                        </div>
                    </div>

                    {/* AI Insights Section */}
                    {(evaluation.nivelEstres !== null || evaluation.nivelAnsiedad !== null) && (
                        <div className="glass-panel" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Brain size={22} color="#6366f1" /> Análisis Predictivo (IA)
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nivel de Estrés</span>
                                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#6366f1' }}>{evaluation.nivelEstres?.toFixed(1) || 'N/A'}%</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nivel de Ansiedad</span>
                                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#a855f7' }}>{evaluation.nivelAnsiedad?.toFixed(1) || 'N/A'}%</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detalle de Escalas */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        
                        {/* Barthel */}
                        {scales.barthel && (
                            <div className="glass-panel" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ fontWeight: '700' }}>Índice de Barthel</h3>
                                    <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'var(--secondary)', color: 'white', fontSize: '12px', fontWeight: '700' }}>
                                        {evaluation.puntajeBarthel}/100
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {Object.entries(scales.barthel).map(([key, val]: [string, any]) => (
                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
                                            <span style={{ textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                                            <b>{val} pts</b>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tinetti */}
                        {scales.tinetti && (
                            <div className="glass-panel" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ fontWeight: '700' }}>Escala de Tinetti</h3>
                                    <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#10b981', color: 'white', fontSize: '12px', fontWeight: '700' }}>
                                        {evaluation.puntajeTinetti}/28
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {Object.entries(scales.tinetti).map(([key, val]: [string, any]) => (
                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
                                            <span style={{ textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                                            <b>{val} pts</b>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Norton */}
                        {scales.norton && (
                            <div className="glass-panel" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ fontWeight: '700' }}>Escala de Norton</h3>
                                    <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#f59e0b', color: 'white', fontSize: '12px', fontWeight: '700' }}>
                                        {evaluation.puntajeNorton}/20
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {Object.entries(scales.norton).map(([key, val]: [string, any]) => (
                                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
                                            <span style={{ textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                                            <b>{val} pts</b>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pfeiffer */}
                        {scales.pfeiffer && (
                            <div className="glass-panel" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ fontWeight: '700' }}>Test de Pfeiffer</h3>
                                    <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: '700' }}>
                                        {evaluation.puntajePfeiffer} Errores
                                    </span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    Se registraron {evaluation.puntajePfeiffer} respuestas incorrectas durante la evaluación cognitiva.
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div style={{ position: 'sticky', top: '32px' }}>
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={18} /> Perfil Paciente
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)' }}>NOMBRE</label>
                                <p style={{ fontWeight: '600' }}>{patient?.nombre} {patient?.apellidoPaterno}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)' }}>CURP</label>
                                <p style={{ fontWeight: '600' }}>{patient?.perfilPaciente?.curp || '---'}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)' }}>ÓRTESIS</label>
                                <p style={{ fontWeight: '600', color: 'var(--primary)' }}>{patient?.perfilPaciente?.tipoOrtesis || 'No especificada'}</p>
                            </div>
                        </div>

                        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)' }} />

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', marginBottom: '12px' }}>
                                <HeartPulse size={32} color="#ef4444" />
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nivel de Dolor Reportado</p>
                            <h4 style={{ fontSize: '24px', fontWeight: '800', color: '#ef4444' }}>{evaluation.nivelDolor}/10</h4>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EvaluationDetail;
