import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { AuthService } from '../services/api';
import { Activity, User, UserPlus } from 'lucide-react';

const Patients = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();

    const [formData, setFormData] = useState({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        email: '',
        passwordHash: '',
        curp: '',
        rol: 'PACIENTE',
        miMedicoId: user?.id,
        fechaNacimiento: '',
        tipoOrtesis: '',
        miembroAfectado: '',
        tipoSanguineo: '',
        alergias: '',
        antecedentes: ''
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const url = user.rol === 'ADMIN' ? '/usuarios' : `/usuarios?medicoId=${user.id}`;
            const response = await api.get(url);
            setPatients(response.data);
        } catch (err) {
            console.error('Error fetching patients', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/usuarios', formData);
            setShowModal(false);
            fetchPatients();
            setFormData({
                nombre: '',
                apellidoPaterno: '',
                apellidoMaterno: '',
                email: '',
                passwordHash: '',
                curp: '',
                rol: 'PACIENTE',
                miMedicoId: user?.id,
                fechaNacimiento: '',
                tipoOrtesis: '',
                miembroAfectado: '',
                tipoSanguineo: '',
                alergias: '',
                antecedentes: ''
            });
        } catch (err) {
            alert('Error al crear paciente. Verifique que el curp o email no estén duplicados.');
        }
    };

    return (
        <>
            <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Monitor de Pacientes</h1>
                {(user?.rol === 'MEDICO' || user?.rol === 'ADMIN') && (
                    <button className="primary" onClick={() => setShowModal(true)}>
                        <UserPlus size={20} /> Nuevo Paciente
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {loading ? (
                    <p>Cargando pacientes...</p>
                ) : patients.map((patient) => (
                    <div key={patient.id} className="glass-panel" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ padding: '10px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '12px' }}>
                                    <User color="var(--secondary)" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{patient.nombre} {patient.apellidoPaterno}</h3>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CURP: {patient.perfilPaciente?.curp || '---'}</span>
                                </div>
                            </div>
                            <Activity size={20} color="var(--primary)" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ background: 'rgba(0,0,0,0.03)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>Tipo Sangre</span>
                                <span style={{ fontWeight: '600' }}>{patient.perfilPaciente?.tipoSanguineo || '---'}</span>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.03)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>Estado</span>
                                <span style={{ color: '#10b981', fontWeight: '600' }}>Estable</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate(`/pacientes/${patient.id}`)}
                            style={{ width: '100%', fontSize: '14px', background: 'rgba(0,0,0,0.05)', color: 'var(--text-main)', justifyContent: 'center', cursor: 'pointer' }}
                        >
                            Ver Expediente Completo
                        </button>
                    </div>
                ))}
            </div>
            </div>

            {/* Modal Crear Paciente */}
            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel animate-scale-in" style={{ width: '100%', maxWidth: '500px', padding: '32px', background: 'var(--bg-surface)' }}>
                        <h2 style={{ marginBottom: '24px' }}>Registrar Nuevo Paciente</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input
                                placeholder="Nombre(s)"
                                value={formData.nombre}
                                required
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <input
                                    placeholder="Ap. Paterno"
                                    value={formData.apellidoPaterno}
                                    required
                                    onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })}
                                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)' }}
                                />
                                <input
                                    placeholder="Ap. Materno"
                                    value={formData.apellidoMaterno}
                                    onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
                                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', marginLeft: '4px' }}>Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        value={formData.fechaNacimiento}
                                        required
                                        onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', marginLeft: '4px' }}>Tipo de Órtesis</label>
                                    <input
                                        placeholder="Ej: Inmovilizadora"
                                        value={formData.tipoOrtesis}
                                        onChange={(e) => setFormData({ ...formData, tipoOrtesis: e.target.value })}
                                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', marginLeft: '4px' }}>Miembro Afectado</label>
                                    <input
                                        placeholder="Ej: Mano Izq."
                                        value={formData.miembroAfectado}
                                        onChange={(e) => setFormData({ ...formData, miembroAfectado: e.target.value })}
                                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)' }}
                                    />
                                </div>
                            </div>
                            <input
                                placeholder="CURP"
                                value={formData.curp}
                                required
                                onChange={(e) => setFormData({ ...formData, curp: e.target.value })}
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)' }}
                            />
                            <input
                                placeholder="Email (Contacto)"
                                type="email"
                                value={formData.email}
                                required
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)' }}
                            />
                            <input
                                placeholder="Contraseña Temporal"
                                type="password"
                                value={formData.passwordHash}
                                required
                                minLength={6}
                                onChange={(e) => setFormData({ ...formData, passwordHash: e.target.value })}
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)' }}
                            />

                            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '8px 0' }} />
                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Historial Clínico Inicial</h3>

                            <select
                                value={formData.tipoSanguineo}
                                onChange={(e) => setFormData({ ...formData, tipoSanguineo: e.target.value })}
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)' }}
                            >
                                <option value="">Seleccionar Tipo de Sangre</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>

                            <textarea
                                placeholder="Alergias (Opcional)"
                                value={formData.alergias}
                                onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', resize: 'vertical', minHeight: '60px' }}
                            />
                            
                            <textarea
                                placeholder="Antecedentes Médicos (Opcional)"
                                value={formData.antecedentes}
                                onChange={(e) => setFormData({ ...formData, antecedentes: e.target.value })}
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', resize: 'vertical', minHeight: '60px' }}
                            />

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="submit" className="primary" style={{ flex: 1, justifyContent: 'center', color: 'white' }}>Registrar Paciente</button>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Patients;
