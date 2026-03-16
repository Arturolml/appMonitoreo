import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Droplets, Heart, Wind, Clock, AlertTriangle, LineChart as ChartIcon, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../services/api';

interface TelemetryDashboardProps {
    patientId: string;
}

const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({ patientId }) => {
    const [readings, setReadings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeChart, setActiveChart] = useState<string | null>(null);

    const fetchReadings = async () => {
        try {
            const response = await api.get(`/lecturas-salud/paciente/${patientId}`);
            setReadings(response.data);
        } catch (err) {
            console.error("Error al cargar telemetría", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReadings();
        const interval = setInterval(fetchReadings, 5000); // Poll every 5s for "Real-time" feel
        return () => clearInterval(interval);
    }, [patientId]);

    const lastReading = readings[0];
    const chartData = [...readings].reverse().map(r => ({
        ...r,
        time: new Date(r.fechaRegistro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }));

    if (loading && readings.length === 0) return <div>Iniciando monitor...</div>;
    if (!lastReading) return (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
            <Activity size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>No hay datos de monitoreo activos para este dispositivo.</p>
        </div>
    );

    const VitalCard = ({ id, icon: Icon, label, value, unit, color, isAnomaly }: any) => (
        <div 
            onClick={() => setActiveChart(activeChart === id ? null : id)}
            className="glass-panel animate-fade-in" 
            style={{ 
                padding: '20px', 
                borderLeft: isAnomaly ? '4px solid #ef4444' : `4px solid ${color}`,
                background: isAnomaly ? 'rgba(239, 68, 68, 0.05)' : activeChart === id ? 'rgba(0,0,0,0.02)' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: activeChart === id ? 'translateY(-2px)' : 'none',
                boxShadow: activeChart === id ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ color: isAnomaly ? '#ef4444' : color }}><Icon size={20} /></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <ChartIcon size={16} color={activeChart === id ? color : 'var(--text-muted)'} style={{ opacity: 0.5 }} />
                    {isAnomaly && <AlertTriangle size={18} color="#ef4444" />}
                </div>
            </div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: '24px', fontWeight: '800' }}>{value}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{unit}</span>
            </div>
        </div>
    );

    const renderChart = () => {
        if (!activeChart) return null;

        let dataKey = activeChart;
        let color = "#6366f1";
        let title = "";
        let yDomain = [0, 'auto'];

        switch(activeChart) {
            case 'frecuenciaCardiaca': 
                color = "#ef4444"; 
                title = "Frecuencia Cardíaca (BPM)"; 
                yDomain = [40, 150];
                break;
            case 'oxigenoSangre': 
                color = "#06b6d4"; 
                title = "Oxigenación (SpO2 %)"; 
                yDomain = [80, 100];
                break;
            case 'presion': 
                title = "Presión Arterial (mmHg)"; 
                yDomain = [40, 180];
                break;
            case 'temperaturaCorporal': 
                color = "#f59e0b"; 
                title = "Temperatura Corporal (°C)"; 
                yDomain = [34, 40];
                break;
            case 'humedadAmbiental': 
                color = "#3b82f6"; 
                title = "Humedad Ambiente (%)"; 
                yDomain = [0, 100];
                break;
        }

        return (
            <div className="glass-panel animate-scale-in" style={{ padding: '24px', marginTop: '24px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h4 style={{ fontWeight: '700', fontSize: '16px' }}>{title}</h4>
                    <button onClick={() => setActiveChart(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                </div>
                <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer>
                        {activeChart === 'presion' ? (
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="time" fontSize={10} tickMargin={10} />
                                <YAxis domain={yDomain as any} fontSize={10} />
                                <Tooltip />
                                <Line type="monotone" dataKey="presionSistolica" name="Sistólica" stroke="#6366f1" strokeWidth={3} dot={false} animationDuration={500} />
                                <Line type="monotone" dataKey="presionDiastolica" name="Diastólica" stroke="#a855f7" strokeWidth={3} dot={false} animationDuration={500} />
                            </LineChart>
                        ) : (
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="time" fontSize={10} tickMargin={10} />
                                <YAxis domain={yDomain as any} fontSize={10} />
                                <Tooltip />
                                <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" animationDuration={500} />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={20} color="var(--primary)" /> Monitor en Tiempo Real (ESP32)
                </h3>
                <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} className="animate-pulse"></div>
                    Sincronizado (5s): {new Date(lastReading.fechaRegistro).toLocaleTimeString()}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <VitalCard 
                    id="frecuenciaCardiaca"
                    icon={Heart} 
                    label="Frecuencia Cardíaca" 
                    value={lastReading.frecuenciaCardiaca} 
                    unit="BPM" 
                    color="#ef4444" 
                    isAnomaly={lastReading.esAnomalia && lastReading.frecuenciaCardiaca > 100}
                />
                <VitalCard 
                    id="oxigenoSangre"
                    icon={Wind} 
                    label="Oxigenación (SpO2)" 
                    value={lastReading.oxigenoSangre} 
                    unit="%" 
                    color="#06b6d4" 
                />
                <VitalCard 
                    id="presion"
                    icon={Activity} 
                    label="Presión Arterial" 
                    value={lastReading.presionSistolica ? `${Math.round(lastReading.presionSistolica)}/${Math.round(lastReading.presionDiastolica)}` : '---'} 
                    unit="mmHg" 
                    color="#6366f1" 
                />
                <VitalCard 
                    id="temperaturaCorporal"
                    icon={Thermometer} 
                    label="Temp. Corporal" 
                    value={lastReading.temperaturaCorporal?.toFixed(1)} 
                    unit="°C" 
                    color="#f59e0b" 
                />
                <VitalCard 
                    id="humedadAmbiental"
                    icon={Droplets} 
                    label="Humedad Ambiente" 
                    value={lastReading.humedadAmbiental} 
                    unit="%" 
                    color="#3b82f6" 
                />
            </div>

            {renderChart()}

            <div className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-muted)' }}>HISTORIAL RECIENTE</h4>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <th style={{ padding: '12px 0' }}>Hora</th>
                                <th>BPM</th>
                                <th>SpO2</th>
                                <th>Presión</th>
                                <th>Temp</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {readings.slice(0, 10).map((r: any) => (
                                <tr key={r.id.toString()} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                                    <td style={{ padding: '12px 0', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={12} /> {new Date(r.fechaRegistro).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: '600' }}>{r.frecuenciaCardiaca}</td>
                                    <td>{r.oxigenoSangre}%</td>
                                    <td>{r.presionSistolica ? `${Math.round(r.presionSistolica)}/${Math.round(r.presionDiastolica)}` : '---'}</td>
                                    <td>{r.temperaturaCorporal}°C</td>
                                    <td>
                                        <span style={{ 
                                            padding: '2px 8px', 
                                            borderRadius: '10px', 
                                            fontSize: '11px',
                                            background: r.esAnomalia ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                                            color: r.esAnomalia ? '#ef4444' : '#10b981',
                                            fontWeight: '700'
                                        }}>
                                            {r.esAnomalia ? 'ANOMALÍA' : 'NORMAL'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TelemetryDashboard;
