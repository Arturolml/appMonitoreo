import { useState, useEffect } from 'react';
import api from '../services/api';
import { UserPlus, User, Key, Power, PowerOff, Search } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [newPassword, setNewPassword] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('TODOS');

    const [formData, setFormData] = useState({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        email: '',
        passwordHash: '',
        rol: 'MEDICO'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) => {
        const fullName = `${user.nombre || ''} ${user.apellidoPaterno || ''} ${user.apellidoMaterno || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'TODOS' || user.rol === roleFilter;
        return matchesSearch && matchesRole;
    });

    const fetchUsers = async () => {
        try {
            const response = await api.get('/usuarios');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/usuarios', formData);
            setShowModal(false);
            fetchUsers();
            setFormData({
                nombre: '',
                apellidoPaterno: '',
                apellidoMaterno: '',
                email: '',
                passwordHash: '',
                rol: 'MEDICO'
            });
        } catch (err) {
            alert('Error al crear usuario');
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch(`/usuarios/${selectedUser.id}`, { passwordHash: newPassword });
            setShowPasswordModal(false);
            setNewPassword('');
            alert('Contraseña actualizada con éxito');
        } catch (err) {
            alert('Error al actualizar contraseña');
        }
    };

    const handleToggleStatus = async (user: any) => {
        try {
            // Use patch to toggle status instead of delete which only sets to false
            await api.patch(`/usuarios/${user.id}`, { activo: !user.activo });
            fetchUsers();
        } catch (err) {
            alert('Error al cambiar estado');
        }
    };

    return (
        <>
            <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Gestión de Usuarios</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Administra accesos, roles y contraseñas del sistema.</p>
                </div>
                <button className="primary" onClick={() => setShowModal(true)}>
                    <UserPlus size={20} /> Nuevo Usuario
                </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-surface)', outline: 'none', color: 'var(--text-main)' }}
                    />
                </div>
                <select 
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-surface)', outline: 'none', color: 'var(--text-main)', minWidth: '150px' }}
                >
                    <option value="TODOS">Todos los roles</option>
                    <option value="ADMIN">Administradores</option>
                    <option value="MEDICO">Médicos</option>
                    <option value="ENFERMERO">Enfermeros</option>
                </select>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-surface)' }}>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '500' }}>Usuario</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '500' }}>Rol</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '500' }}>Estado</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '500' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center' }}>Cargando...</td></tr>
                        ) : filteredUsers.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)', opacity: user.activo ? 1 : 0.6 }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{user.nombre} {user.apellidoPaterno}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        background: user.rol === 'ADMIN' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(6, 182, 212, 0.1)',
                                        color: user.rol === 'ADMIN' ? 'var(--accent)' : 'var(--secondary)'
                                    }}>
                                        {user.rol}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: user.activo ? '#10b981' : 'var(--accent)' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></div>
                                        <span style={{ fontSize: '13px' }}>{user.activo ? 'Activo' : 'Inactivo'}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            title="Cambiar Contraseña"
                                            style={{ background: 'transparent', color: 'var(--secondary)', border: 'none', cursor: 'pointer', padding: '4px' }}
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowPasswordModal(true);
                                            }}
                                        >
                                            <Key size={18} />
                                        </button>
                                        <button
                                            title={user.activo ? "Desactivar" : "Reactivar"}
                                            style={{ background: 'transparent', color: user.activo ? 'var(--accent)' : 'var(--secondary)', border: 'none', cursor: 'pointer', padding: '4px' }}
                                            onClick={() => handleToggleStatus(user)}
                                        >
                                            {user.activo ? <PowerOff size={18} /> : <Power size={18} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </div>

            {/* Modal Crear Usuario */}
            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel animate-scale-in" style={{ width: '100%', maxWidth: '500px', padding: '32px', background: 'var(--bg-surface)' }}>
                        <h2 style={{ marginBottom: '24px' }}>Crear Nuevo Usuario</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input
                                placeholder="Nombre"
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
                            <input
                                placeholder="Email"
                                type="email"
                                value={formData.email}
                                required
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)' }}
                            />
                            <input
                                placeholder="Password"
                                type="password"
                                value={formData.passwordHash}
                                required
                                minLength={6}
                                onChange={(e) => setFormData({ ...formData, passwordHash: e.target.value })}
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)' }}
                            />
                            <select
                                value={formData.rol}
                                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)' }}
                            >
                                <option value="MEDICO">Médico</option>
                                <option value="ENFERMERO">Enfermero</option>
                                <option value="ADMIN">Administrador</option>
                            </select>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="submit" className="primary" style={{ flex: 1, justifyContent: 'center', color: 'white' }}>Crear Usuario</button>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Contraseña */}
            {showPasswordModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel animate-scale-in" style={{ width: '100%', maxWidth: '400px', padding: '32px', background: 'var(--bg-surface)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <Key size={24} />
                            </div>
                            <h2>Cambiar Contraseña</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Actualizando acceso para {selectedUser?.nombre}</p>
                        </div>
                        <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input
                                placeholder="Nueva Contraseña (mín. 6 caps)"
                                type="password"
                                value={newPassword}
                                required
                                minLength={6}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)' }}
                            />
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="submit" className="primary" style={{ flex: 1, justifyContent: 'center', color: 'white' }}>Actualizar</button>
                                <button type="button" onClick={() => setShowPasswordModal(false)} style={{ flex: 1, justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Users;
