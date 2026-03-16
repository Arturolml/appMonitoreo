import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import api from '../services/api';

const NewEvaluation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        diagnostico: '',
        observaciones: '',
        indicaciones: '',
        medicamentos: ''
    });

    const [barthelScores, setBarthelScores] = useState<Record<string, number>>({});
    const [tinettiScores, setTinettiScores] = useState<Record<string, number>>({});
    const [nortonScores, setNortonScores] = useState<Record<string, number>>({});
    const [pfeifferErrors, setPfeifferErrors] = useState<Record<string, number>>({});
    const [evalDolor, setEvalDolor] = useState<number>(0);
    const [lawtonScores, setLawtonScores] = useState<Record<string, number>>({});
    const [mnaScores, setMnaScores] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const response = await api.get(`/usuarios/${id}/expediente`);
                setPatient(response.data);
            } catch (err) {
                console.error("Error al cargar paciente", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatient();
    }, [id]);

    const handleScoreChange = (scale: string, key: string, val: number) => {
        let text = form.observaciones;
        const updateState = (setter: any, currentScores: any, max: number, label: string) => {
            const next = { ...currentScores, [key]: val };
            setter(next);
            const total = Object.values(next).reduce((a: any, b: any) => a + b, 0);
            const tag = `${label}:`;
            if (text.includes(tag)) {
                text = text.replace(new RegExp(`${tag} \\d+/${max}`), `${tag} ${total}/${max}`);
            } else {
                text += `\n${tag} ${total}/${max}`;
            }
            setForm(prev => ({ ...prev, observaciones: text.trim() }));
        };

        if (scale === 'barthel') updateState(setBarthelScores, barthelScores, 100, 'BARTHEL');
        if (scale === 'tinetti') updateState(setTinettiScores, tinettiScores, 28, 'TINETTI');
        if (scale === 'norton') updateState(setNortonScores, nortonScores, 20, 'NORTON');
        if (scale === 'pfeiffer') updateState(setPfeifferErrors, pfeifferErrors, 10, 'PFEIFFER (Errores)');
        if (scale === 'lawton') updateState(setLawtonScores, lawtonScores, 8, 'LAWTON');
        if (scale === 'mna') updateState(setMnaScores, mnaScores, 14, 'MNA');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const sum = (obj: any) => Object.values(obj).reduce((a: any, b: any) => a + b, 0);

            await api.post('/evaluaciones', {
                ...form,
                pacienteId: id,
                puntajeBarthel: Object.keys(barthelScores).length > 0 ? sum(barthelScores) : undefined,
                puntajeTinetti: Object.keys(tinettiScores).length > 0 ? sum(tinettiScores) : undefined,
                puntajeNorton: Object.keys(nortonScores).length > 0 ? sum(nortonScores) : undefined,
                puntajePfeiffer: Object.keys(pfeifferErrors).length > 0 ? sum(pfeifferErrors) : undefined,
                nivelDolor: evalDolor,
                puntajeLawton: Object.keys(lawtonScores).length > 0 ? sum(lawtonScores) : undefined,
                puntajeMNA: Object.keys(mnaScores).length > 0 ? sum(mnaScores) : undefined,
                datosEscalas: {
                    barthel: barthelScores,
                    tinetti: tinettiScores,
                    norton: nortonScores,
                    pfeiffer: pfeifferErrors,
                    dolor: evalDolor,
                    lawton: lawtonScores,
                    mna: mnaScores
                }
            });
            alert('Evaluación Integral guardada exitosamente');
            navigate(`/pacientes/${id}`);
        } catch (err) {
            alert('Error al guardar evaluación');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={() => navigate(-1)} className="glass-panel" style={{ padding: '8px', borderRadius: '50%', color: 'var(--text-muted)' }}>
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Valoración Geriátrica Integral (VGI)</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Paciente: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{patient?.nombre} {patient?.apellidoPaterno}</span></p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Dolor EVA */}
                        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #ef4444' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Escala Visual Analógica (Dolor)</h2>
                                <span style={{ fontSize: '24px', fontWeight: '800', color: '#ef4444' }}>{evalDolor}/10</span>
                            </div>
                            <input 
                                type="range" min="0" max="10" step="1"
                                value={evalDolor}
                                onChange={(e) => setEvalDolor(parseInt(e.target.value))}
                                style={{ width: '100%', height: '8px', appearance: 'none', background: '#fee2e2', borderRadius: '4px', outline: 'none' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                <span>Sin dolor</span>
                                <span>Dolor moderado</span>
                                <span>Máximo dolor</span>
                            </div>
                        </div>

                        {/* Cognitivo - Pfeiffer */}
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>🧠 Test de Pfeiffer (Cognitivo)</h2>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Marque si la respuesta es INCORRECTA (Error)</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {Object.entries(PFEIFFER_QUESTIONS).map(([key, label]: [string, any]) => (
                                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input 
                                            type="checkbox" 
                                            onChange={(e) => handleScoreChange('pfeiffer', key, e.target.checked ? 1 : 0)}
                                        />
                                        <span style={{ fontSize: '13px' }}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* Norton */}
                            <div className="glass-panel" style={{ padding: '20px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>🛡️ Escala de Norton (Piel)</h3>
                                {Object.entries(NORTON_QUESTIONS).map(([key, q]: [string, any]) => (
                                    <div key={key} style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>{q.label}</label>
                                        <select required className="glass-input" style={{ width: '100%' }} onChange={(e) => handleScoreChange('norton', key, parseInt(e.target.value))}>
                                            <option value="">...</option>
                                            {q.options.map((opt: any) => <option key={opt.val} value={opt.val}>{opt.text} ({opt.val})</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            {/* Nutricional - MNA */}
                            <div className="glass-panel" style={{ padding: '20px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>🍎 MNA (Nutrición)</h3>
                                {Object.entries(MNA_QUESTIONS).map(([key, q]: [string, any]) => (
                                    <div key={key} style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>{q.label}</label>
                                        <select required className="glass-input" style={{ width: '100%' }} onChange={(e) => handleScoreChange('mna', key, parseInt(e.target.value))}>
                                            <option value="">...</option>
                                            {q.options.map((opt: any) => <option key={opt.val} value={opt.val}>{opt.text} ({opt.val})</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Barthel */}
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: 'var(--secondary)' }}>🏠 Índice de Barthel (Básicas)</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {Object.entries(BARTHEL_QUESTIONS).map(([key, q]: [string, any]) => (
                                    <div key={key}>
                                        <label style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>{q.label}</label>
                                        <select required className="glass-input" style={{ width: '100%' }} onChange={(e) => handleScoreChange('barthel', key, parseInt(e.target.value))}>
                                            <option value="">Seleccionar...</option>
                                            {q.options.map((opt: any) => <option key={opt.val} value={opt.val}>{opt.text} ({opt.val})</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lawton */}
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>📡 Lawton & Brody (Instrumentales)</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {Object.entries(LAWTON_QUESTIONS).map(([key, q]: [string, any]) => (
                                    <div key={key}>
                                        <label style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>{q.label}</label>
                                        <select required className="glass-input" style={{ width: '100%' }} onChange={(e) => handleScoreChange('lawton', key, parseInt(e.target.value))}>
                                            <option value="">...</option>
                                            {q.options.map((opt: any) => <option key={opt.val} value={opt.val}>{opt.text} ({opt.val})</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tinetti */}
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#10b981' }}>🚶 Tinetti (Marcha / Eq)</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {Object.entries(TINETTI_QUESTIONS).map(([key, q]: [string, any]) => (
                                    <div key={key}>
                                        <label style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>{q.label}</label>
                                        <select required className="glass-input" style={{ width: '100%' }} onChange={(e) => handleScoreChange('tinetti', key, parseInt(e.target.value))}>
                                            <option value="">...</option>
                                            {q.options.map((opt: any) => <option key={opt.val} value={opt.val}>{opt.text} ({opt.val})</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Resumen Final */}
                    <div style={{ position: 'sticky', top: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <h3 style={{ marginBottom: '16px', fontWeight: '700' }}>Finalizar Evaluación</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', display: 'block' }}>Diagnóstico</label>
                                    <input required className="glass-input" value={form.diagnostico} onChange={(e) => setForm({...form, diagnostico: e.target.value})} style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', display: 'block' }}>Observaciones Auto-generadas</label>
                                    <textarea className="glass-input" rows={6} value={form.observaciones} onChange={(e) => setForm({...form, observaciones: e.target.value})} style={{ width: '100%', fontSize: '12px' }} />
                                </div>
                                <button type="submit" className="primary" disabled={submitting} style={{ width: '100%', height: '50px', justifyContent: 'center' }}>
                                    <Save size={18} /> {submitting ? 'Guardando...' : 'Registrar VGI'}
                                </button>
                            </div>
                        </div>

                        {/* Score Board */}
                        <div className="glass-panel" style={{ padding: '20px', fontSize: '13px' }}>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Barthel</span> <b>{Object.values(barthelScores).reduce((a, b) => a + b, 0)}/100</b></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tinetti</span> <b>{Object.values(tinettiScores).reduce((a, b) => a + b, 0)}/28</b></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Norton</span> <b>{Object.values(nortonScores).reduce((a, b) => a + b, 0)}/20</b></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Errores Pfeiffer</span> <b>{Object.values(pfeifferErrors).reduce((a, b) => a + b, 0)}/10</b></div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

const PFEIFFER_QUESTIONS = {
    fecha: '¿Qué día es hoy? (Fecha completa)',
    dia_semana: '¿Qué día de la semana es?',
    lugar: '¿Dónde estamos ahora?',
    telefono: '¿Cuál es su número de teléfono?',
    edad: '¿Qué edad tiene?',
    nacimiento: '¿Cuándo nació?',
    presidente: '¿Quién es el presidente actual?',
    presidente_ant: '¿Quién fue el presidente anterior?',
    apellido_madre: '¿Cuál era el apellido de su madre?',
    resta: 'Resta de 3 en 3 desde 20'
};

const NORTON_QUESTIONS = {
    estado_fisico: { label: 'Estado Físico', options: [{val:1, text:'Muy malo'}, {val:2, text:'Pobre'}, {val:3, text:'Mediano'}, {val:4, text:'Bueno'}] },
    estado_mental: { label: 'Estado Mental', options: [{val:1, text:'Estuporoso'}, {val:2, text:'Confuso'}, {val:3, text:'Apático'}, {val:4, text:'Alerta'}] },
    actividad: { label: 'Actividad', options: [{val:1, text:'Encamado'}, {val:2, text:'Silla de ruedas'}, {val:3, text:'Camina con ayuda'}, {val:4, text:'Ambulante'}] },
    movilidad: { label: 'Movilidad', options: [{val:1, text:'Inmóvil'}, {val:2, text:'Muy limitada'}, {val:3, text:'Limitada'}, {val:4, text:'Total'}] },
    incontinencia: { label: 'Incontinencia', options: [{val:1, text:'Urinaria y Fecal'}, {val:2, text:'Urinaria o Fecal'}, {val:3, text:'Ocasional'}, {val:4, text:'Ninguna'}] },
};

const MNA_QUESTIONS = {
    ingesta: { label: 'Ingesta de alimentos', options: [{val:0, text:'Grave disminución'}, {val:1, text:'Moderada'}, {val:2, text:'Sin disminución'}] },
    peso: { label: 'Pérdida de peso', options: [{val:0, text:'>3kg'}, {val:1, text:'No sabe'}, {val:2, text:'1-3kg'}, {val:3, text:'No hubo'}] },
    movilidad: { label: 'Movilidad', options: [{val:0, text:'Cama/Silla'}, {val:1, text:'Camina en casa'}, {val:2, text:'Sale al exterior'}] },
    estres: { label: 'Estrés psicológico', options: [{val:0, text:'Sí'}, {val:2, text:'No'}] },
};

const LAWTON_QUESTIONS = {
    telefono: { label: 'Uso del Teléfono', options: [{val:0, text:'No usa'}, {val:1, text:'Iniciativa propia'}] },
    compras: { label: 'Compras', options: [{val:0, text:'Necesita ayuda'}, {val:1, text:'Independiente'}] },
    comida: { label: 'Preparación de comida', options: [{val:0, text:'Necesita que lo sirvan'}, {val:1, text:'Organiza/Prepara'}] },
    casa: { label: 'Cuidado de la casa', options: [{val:0, text:'No participa'}, {val:1, text:'Tareas ligeras'}] },
};

const BARTHEL_QUESTIONS = {
    comida: { label: 'Comida', options: [{val:0, text:'Dependiente'}, {val:5, text:'Necesita ayuda'}, {val:10, text:'Independiente'}] },
    lavado: { label: 'Lavado', options: [{val:0, text:'Dependiente'}, {val:5, text:'Independiente'}] },
    vestido: { label: 'Vestido', options: [{val:0, text:'Dependiente'}, {val:5, text:'Necesita ayuda'}, {val:10, text:'Independiente'}] },
    aseo: { label: 'Aseo Personal', options: [{val:0, text:'Dependiente'}, {val:5, text:'Independiente'}] },
    deposicion: { label: 'Deposición', options: [{val:0, text:'Incontinente'}, {val:5, text:'Accidente ocasional'}, {val:10, text:'Continente'}] },
    miccion: { label: 'Micción', options: [{val:0, text:'Incontinente'}, {val:5, text:'Accidente ocasional'}, {val:10, text:'Continente'}] },
    retrete: { label: 'Uso del Retrete', options: [{val:0, text:'Dependiente'}, {val:5, text:'Necesita ayuda'}, {val:10, text:'Independiente'}] },
    traslado: { label: 'Traslado (Cama-Silla)', options: [{val:0, text:'Dependiente'}, {val:10, text:'Gran ayuda'}, {val:15, text:'Independiente'}] },
    deambulacion: { label: 'Deambulación', options: [{val:0, text:'Inmóvil'}, {val:10, text:'Independiente con silla'}, {val:15, text:'Independiente'}] },
    escaleras: { label: 'Escaleras', options: [{val:0, text:'Dependiente'}, {val:5, text:'Necesita ayuda'}, {val:10, text:'Independiente'}] },
};

const TINETTI_QUESTIONS = {
    equilibrio: { label: 'Equilibrio (Sentado)', options: [{val:0, text:'Se inclina'}, {val:1, text:'Seguro'}] },
    levantarse: { label: 'Levantarse', options: [{val:0, text:'Incapaz'}, {val:1, text:'Capaz con ayuda'}, {val:2, text:'Capaz sin ayuda'}] },
    sentarse: { label: 'Sentarse', options: [{val:0, text:'Inseguro'}, {val:1, text:'Usa brazos'}, {val:2, text:'Seguro'}] },
    giro: { label: 'Giro 360 grados', options: [{val:0, text:'Pasos discontinuos'}, {val:1, text:'Continuo'}, {val:2, text:'Seguro'}] },
    inicio_marcha: { label: 'Inicio de la marcha', options: [{val:0, text:'Duda'}, {val:1, text:'Sin duda'}] },
    longitud: { label: 'Longitud del paso', options: [{val:0, text:'Corto'}, {val:1, text:'Normal'}] },
    trayectoria: { label: 'Trayectoria', options: [{val:0, text:'Desviación'}, {val:1, text:'Recto'}] },
};

export default NewEvaluation;
