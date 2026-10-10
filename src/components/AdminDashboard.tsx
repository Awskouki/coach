import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, Calendar, CreditCard, LayoutDashboard, Plus, TrendingUp,
  Bell, LogOut, UserPlus, X, Search, Trash2, Phone, Mail,
  CheckCircle2, Clock, Copy, Download, Upload, History,
  Weight, Package, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client, Session } from '../types';
import type { SignUpRequest } from '../utils/dataExport';
import { downloadDataBackup, importAllData } from '../utils/dataExport';
import {
  normalizeSubscriptionType,
  getSubscriptionPrice,
  formatSubscriptionDisplay,
  SUBSCRIPTION_LABELS,
  type SubscriptionType,
} from '../utils/subscriptions';
import { 
  requestNotificationPermission, 
  getReminderStatus,
  checkUpcomingSessions,
  sendSessionReminder,
  initializeReminderSystem,
  formatReminderMessage,
} from '../utils/reminderService';

interface AdminDashboardProps {
  onLogout: () => void;
}

type View = 'Tableau de bord' | 'Clients' | 'Planning' | 'Paiements' | 'signups' | 'Historique';

const ProStatCard = ({ title, value, icon: Icon, trend, trendUp }: any) => (
  <motion.div 
    className="pro-stat fade-up"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="pro-stat__icon">
      <Icon size={26} strokeWidth={2.25} />
    </div>
    <p className="pro-stat__label">{title}</p>
    <h3 className="pro-stat__value">{value}</h3>
    {trend !== undefined && (
      <span className={`pro-stat__delta ${trendUp ? 'up' : 'down'}`}>
        {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
      </span>
    )}
  </motion.div>
);

const ProModal = ({ isOpen, onClose, title, children, footer }: any) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div 
        className="pro-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="pro-modal__header">
          <h2 className="pro-modal__title">{title}</h2>
          <button className="pro-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="pro-modal__content">
          {children}
        </div>
        {footer && (
          <div className="pro-modal__footer">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [view, setView] = useState<View>('Tableau de bord');
  const [clients, setClients] = useLocalStorage<Client[]>('coach_clients', []);
  const [sessions, setSessions] = useLocalStorage<Session[]>('coach_sessions', []);
  const [signUpRequests, setSignUpRequests] = useLocalStorage<SignUpRequest[]>('signup_requests', []);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ clientId: '', date: '', time: '09:00', notes: '' });
  const [reminderStatus, setReminderStatus] = useState(getReminderStatus());
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    poid: '',
    taille: '',
    regime: '',
    subscriptionType: 'partner' as SubscriptionType,
    paymentMethod: 'cash' as 'bank_transfer' | 'cash',
  });

  const [upcomingCount, setUpcomingCount] = useState(0);

  useEffect(() => {
    const initReminders = async () => {
      await requestNotificationPermission();
      setReminderStatus(getReminderStatus());
    };
    initReminders();
  }, []);

  useEffect(() => {
    const cleanup = initializeReminderSystem(sessions, clients, (upcoming) => {
      setUpcomingCount(upcoming.length);
    });
    return cleanup;
  }, [sessions, clients]);

  const pendingSignUps = useMemo(
    () => signUpRequests.filter((r) => r.status === 'pending'),
    [signUpRequests]
  );

  const localDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.toISOString().slice(0, 7);

    const activeClients = clients.length;
    const lastMonthClients = clients.filter(c => c.createdAt.startsWith(lastMonth)).length;
    const thisMonthClients = clients.filter(c => c.createdAt.startsWith(thisMonth)).length;
    const clientTrend = lastMonthClients > 0
      ? Math.round(((thisMonthClients - lastMonthClients) / lastMonthClients) * 100)
      : thisMonthClients > 0 ? 100 : 0;

    const pendingPayments = clients.filter((c) => c.paymentStatus === 'pending').length;
    const todayKey = localDateKey(now);
    const sessionsToday = sessions.filter((s) => {
      const sessionDate = new Date(s.dateTime);
      return localDateKey(sessionDate) === todayKey && s.status === 'scheduled';
    }).length;

    const totalRevenue = clients.reduce(
      (acc, c) => (c.paymentStatus === 'paid' ? acc + getSubscriptionPrice(c.subscriptionType) : acc),
      0
    );

    return { activeClients, pendingPayments, sessionsToday, totalRevenue, clientTrend };
  }, [clients, sessions]);

  const navItems = [
    { id: 'Tableau de bord', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'signups', label: 'Inscriptions', icon: UserPlus, badge: pendingSignUps.length },
    { id: 'Clients', label: 'Clients', icon: Users },
    { id: 'Planning', label: 'Planning', icon: Calendar },
    { id: 'Paiements', label: 'Paiements', icon: CreditCard },
    { id: 'Historique', label: 'Historique', icon: History },
  ];

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
  );
  const selectedClient = clients.find(c => c.id === selectedClientId);

  const calcBMI = (poid: number, taille: number) => {
    if (!poid || !taille) return 0;
    const h = taille / 100;
    return Math.round((poid / (h * h)) * 10) / 10;
  };

  const bmiLabel = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Insuffisance', color: '#3b82f6' };
    if (bmi < 25) return { label: 'Normal', color: '#10b981' };
    if (bmi < 30) return { label: 'Surpoids', color: '#f59e0b' };
    return { label: 'Obésité', color: '#ef4444' };
  };

  const deleteClient = (id: string) => {
    if (!confirm('Supprimer ce client ? Cette action est irréversible.')) return;
    setClients(clients.filter(c => c.id !== id));
    setSessions(sessions.filter(s => s.clientId !== id));
    setSelectedClientId(null);
  };

  const updateClient = (updated: Client) => {
    const existing = clients.find((c) => c.id === updated.id);
    if (existing && (updated.poid !== existing.poid || updated.taille !== existing.taille)) {
      const today = new Date().toISOString().split('T')[0];
      const progress = [...(existing.progress || [])];
      const idx = progress.findIndex((p) => p.date === today);
      const point = {
        date: today,
        poid: updated.poid,
        taille: updated.taille,
        bmi: calcBMI(updated.poid, updated.taille),
      };
      if (idx >= 0) progress[idx] = point;
      else progress.push(point);
      updated.progress = progress;
    }
    updated.updatedAt = new Date().toISOString();
    setClients(clients.map((c) => (c.id === updated.id ? updated : c)));
  };

  const saveSession = () => {
    if (!scheduleForm.clientId || !scheduleForm.date || !scheduleForm.time) {
      alert('Veuillez sélectionner un client, une date et une heure');
      return;
    }
    const client = clients.find(c => c.id === scheduleForm.clientId);
    if (!client) return;
    const newSession: Session = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: scheduleForm.clientId,
      clientName: client.name,
      dateTime: new Date(`${scheduleForm.date}T${scheduleForm.time}`).toISOString(),
      notes: scheduleForm.notes,
      status: 'scheduled',
    };
    setSessions([newSession, ...sessions]);
    setShowScheduleModal(false);
    setScheduleForm({ clientId: '', date: '', time: '09:00', notes: '' });
  };

  const approveSignUp = (id: string) => {
    const s = signUpRequests.find(r => r.id === id);
    if (!s) return;
    const newClient: Client = {
      id: Date.now().toString(),
      name: s.name, phone: s.phone, email: s.email || '',
      poid: Number(s.poid) || 0, taille: Number(s.taille) || 0,
      progress: [{ date: new Date().toISOString().split('T')[0], poid: Number(s.poid) || 0, taille: Number(s.taille) || 0 }],
      regime: s.message || '',
      subscriptionType: normalizeSubscriptionType(s.subscriptionType || 'partner'),
      subscriptionStartDate: new Date().toISOString(),
      paymentStatus: 'pending',
      paymentMethod: (s.paymentMethod === 'bank_transfer' ? 'bank_transfer' : 'cash') as 'bank_transfer' | 'cash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClients([newClient, ...clients]);
    setSignUpRequests(signUpRequests.filter(r => r.id !== id));
  };

  const rejectSignUp = (id: string) => {
    if (!confirm('Rejeter cette inscription ?')) return;
    setSignUpRequests(
      signUpRequests.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r))
    );
  };

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setReminderStatus(getReminderStatus());
    if (granted) alert('Notifications activées !');
    else alert('Notifications refusées. Activez-les dans les paramètres du navigateur.');
  };

  const notifySession = (session: Session) => {
    const sent = sendSessionReminder(session, session.clientName);
    if (!sent) {
      void enableNotifications();
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importAllData(file);
    alert(result.message);
    if (result.success) window.location.reload();
    e.target.value = '';
  };

  const copyReminder = async (session: Session) => {
    const time = new Date(session.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = new Date(session.dateTime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    const msg = `Bonjour ${session.clientName} ! Rappel : vous avez une séance d'entraînement le ${date} à ${time}. À bientôt ! 💪`;
    try { await navigator.clipboard.writeText(msg); alert('Message copié !'); }
    catch { alert('Erreur de copie'); }
  };

  const handleAddClient = (e: React.FormEvent) => {    e.preventDefault();
    if (!newClientForm.name || !newClientForm.poid || !newClientForm.taille) {
      alert('Veuillez remplir le nom, poids et taille');
      return;
    }
    const newClient: Client = {
      id: Date.now().toString(),
      name: newClientForm.name,
      phone: newClientForm.phone,
      email: newClientForm.email,
      poid: Number(newClientForm.poid),
      taille: Number(newClientForm.taille),
      progress: [{ date: new Date().toISOString().split('T')[0], poid: Number(newClientForm.poid), taille: Number(newClientForm.taille) }],
      regime: newClientForm.regime || 'Aucun régime spécifié',
      subscriptionType: newClientForm.subscriptionType,
      subscriptionStartDate: new Date().toISOString(),
      paymentStatus: 'pending',
      paymentMethod: newClientForm.paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClients([newClient, ...clients]);
    setNewClientForm({ name: '', phone: '', email: '', poid: '', taille: '', regime: '', subscriptionType: 'partner', paymentMethod: 'cash' });
    setShowAddClientModal(false);
  };

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar__logo">
          <div className="sidebar__logo-mark">C</div>
          <span className="sidebar__logo-text">Coach Aymen</span>
        </div>
        
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={`sidebar__item ${view === item.id ? 'active' : ''}`}
            >
              <item.icon size={20} strokeWidth={2.25} />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="pro-badge pro-badge--danger" style={{ marginLeft: 'auto', padding: '4px 10px' }}>
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar__footer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button type="button" onClick={downloadDataBackup} className="btn-pro btn-pro-ghost btn-pro-sm" style={{ width: '100%' }}>
            <Download size={16} /> Exporter
          </button>
          <button type="button" onClick={() => importInputRef.current?.click()} className="btn-pro btn-pro-ghost btn-pro-sm" style={{ width: '100%' }}>
            <Upload size={16} /> Importer
          </button>
          <input ref={importInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
          <button 
            onClick={onLogout}
            className="btn-pro btn-pro-ghost btn-pro-sm"
            style={{ width: '100%' }}
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            {view}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="btn-pro btn-pro-ghost btn-pro-sm"
              title={upcomingCount > 0 ? `${upcomingCount} séance(s) à venir` : 'Rappels'}
              onClick={() => void enableNotifications()}
            >
              <Bell size={16} />
              {upcomingCount > 0 && (
                <span className="pro-badge pro-badge--danger" style={{ marginLeft: 4, padding: '2px 6px', fontSize: 10 }}>
                  {upcomingCount}
                </span>
              )}
            </button>
            <button 
              className="btn-pro btn-pro-primary"
              onClick={() => setShowAddClientModal(true)}
            >
              <Plus size={16} />
              Nouveau Client
            </button>
          </div>
        </header>

        <div className="admin-content">
          <AnimatePresence mode="wait">
            {view === 'Tableau de bord' && (
              <motion.div 
                key="dashboard"
                className="fade-up"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="pro-grid pro-grid--4" style={{ marginBottom: '2rem' }}>
                  <ProStatCard 
                    title="Clients Actifs" 
                    value={stats.activeClients} 
                    icon={Users} 
                    trend={stats.clientTrend}
                    trendUp={stats.clientTrend >= 0}
                  />
                  <ProStatCard 
                    title="Séances Aujourd'hui" 
                    value={stats.sessionsToday} 
                    icon={Calendar} 
                  />
                  <ProStatCard 
                    title="Paiements en Attente" 
                    value={stats.pendingPayments} 
                    icon={CreditCard} 
                  />
                  <ProStatCard 
                    title="Revenu Total" 
                    value={`${stats.totalRevenue} TND`} 
                    icon={TrendingUp} 
                  />
                </div>

                <div className="pro-grid pro-grid--2">
                  <div className="pro-card">
                    <div className="pro-card__header">
                      <h3 className="pro-card__title">Derniers Clients</h3>
                    </div>
                    <div className="pro-card__content">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {clients.slice(-3).reverse().map(client => (
                          <div key={client.id} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: 'rgba(148,163,184,0.05)',
                            borderRadius: '12px',
                            border: '1px solid var(--border)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ 
                                width: '40px', height: '40px', borderRadius: '10px', 
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, fontSize: '16px'
                              }}>
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700 }}>{client.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                  {client.phone}
                                </div>
                              </div>
                            </div>
                            <span className={`pro-badge ${client.paymentStatus === 'paid' ? 'pro-badge--success' : 'pro-badge--warning'}`}>
                              {client.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                            </span>
                          </div>
                        ))}
                        {clients.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            Pas de clients encore
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pro-card">
                    <div className="pro-card__header">
                      <h3 className="pro-card__title">Inscriptions en Attente</h3>
                      <span className="pro-badge pro-badge--info">
                        {pendingSignUps.length}
                      </span>
                    </div>
                    <div className="pro-card__content">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pendingSignUps.slice(-3).reverse().map((signup) => (
                          <div key={signup.id} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: 'rgba(148,163,184,0.05)',
                            borderRadius: '12px',
                            border: '1px solid var(--border)'
                          }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>{signup.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {signup.email}
                              </div>
                            </div>
                            <span className="pro-badge pro-badge--warning">
                              Nouveau
                            </span>
                          </div>
                        ))}
                        {pendingSignUps.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            Pas d'inscriptions en attente
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pro-card" style={{ marginTop: '2rem' }}>
                  <div className="pro-card__header">
                    <h3 className="pro-card__title">Rappels Intelligents</h3>
                    <button
                      className="btn-pro btn-pro-primary btn-pro-sm"
                      onClick={() => void enableNotifications()}
                    >
                      {reminderStatus.browserNotifications ? 'Activé' : 'Activer'}
                    </button>
                  </div>
                  <div className="pro-card__content">
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                      Notifications navigateur {reminderStatus.browserNotifications ? 'activées' : 'désactivées'}.
                      {upcomingCount > 0 && ` ${upcomingCount} séance(s) dans les 2 prochaines heures.`}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {checkUpcomingSessions(sessions, clients).slice(0, 3).map((s) => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }}>
                          <Clock size={14} />
                          {s.clientName} — {new Date(s.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <button className="btn-pro btn-pro-ghost btn-pro-sm" onClick={() => notifySession(s)} title="Notifier"><Bell size={12} /></button>
                          <button className="btn-pro btn-pro-ghost btn-pro-sm" onClick={() => copyReminder(s)} title="Copier"><Copy size={12} /></button>
                        </div>
                      ))}
                      {checkUpcomingSessions(sessions, clients).length === 0 && (
                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Aucune séance imminente</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view !== 'Tableau de bord' && (
              <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                {/* ── CLIENTS ── */}
                {view === 'Clients' && (
                  <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 140px)' }}>
                    {/* List */}
                    <div className="pro-card" style={{ width: selectedClientId ? 300 : '100%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                      <div className="pro-card__header">
                        <h3 className="pro-card__title">Clients ({clients.length})</h3>
                        <button className="btn-pro btn-pro-primary btn-pro-sm" onClick={() => setShowAddClientModal(true)}><Plus size={14} /> Ajouter</button>
                      </div>
                      <div style={{ padding: '0 16px 12px' }}>
                        <div style={{ position: 'relative' }}>
                          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          <input className="pro-input" style={{ paddingLeft: 32 }} placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
                        {filteredClients.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Aucun client</div>}
                        {filteredClients.map(c => (
                          <div key={c.id} onClick={() => setSelectedClientId(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', marginBottom: 4, background: selectedClientId === c.id ? 'rgba(var(--primary-rgb),0.12)' : 'transparent', border: `1px solid ${selectedClientId === c.id ? 'var(--primary)' : 'transparent'}`, transition: 'all 0.15s' }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>{c.name.charAt(0)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.poid}kg · {c.taille}cm</div>
                            </div>
                            <span className={`pro-badge ${c.paymentStatus === 'paid' ? 'pro-badge--success' : 'pro-badge--warning'}`}>{c.paymentStatus === 'paid' ? 'Payé' : 'Att.'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Profile */}
                    {selectedClient && (
                      <div className="pro-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div className="pro-card__header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>{selectedClient.name.charAt(0)}</div>
                            <div>
                              <input value={selectedClient.name} onChange={e => updateClient({ ...selectedClient, name: e.target.value })} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 800, fontSize: 18, color: 'var(--text)' }} />
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Membre depuis {new Date(selectedClient.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-pro btn-pro-ghost btn-pro-sm" onClick={() => setSelectedClientId(null)}>Fermer</button>
                            <button className="btn-pro btn-pro-sm" style={{ background: '#ef4444', color: '#fff', border: 'none' }} onClick={() => deleteClient(selectedClient.id)}><Trash2 size={14} /> Supprimer</button>
                          </div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
                          {/* Stats row */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                            {[
                              { label: 'Poids', node: <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}><input type="number" value={selectedClient.poid} onChange={e => updateClient({ ...selectedClient, poid: Number(e.target.value) })} style={{ width: 64, background: 'none', border: 'none', outline: 'none', fontWeight: 800, fontSize: 22, color: 'var(--primary)' }} /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>kg</span></div> },
                              { label: 'Taille', node: <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}><input type="number" value={selectedClient.taille} onChange={e => updateClient({ ...selectedClient, taille: Number(e.target.value) })} style={{ width: 64, background: 'none', border: 'none', outline: 'none', fontWeight: 800, fontSize: 22, color: 'var(--primary)' }} /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>cm</span></div> },
                              { label: 'IMC', node: (() => { const bmi = calcBMI(selectedClient.poid, selectedClient.taille); const { label, color } = bmiLabel(bmi); return <div><span style={{ fontWeight: 800, fontSize: 22, color }}>{bmi || '—'}</span><div style={{ fontSize: 11, color, marginTop: 2 }}>{bmi ? label : ''}</div></div>; })() },
                              { label: 'Statut', node: <select value={selectedClient.paymentStatus} onChange={e => updateClient({ ...selectedClient, paymentStatus: e.target.value as any })} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 800, fontSize: 14, color: selectedClient.paymentStatus === 'paid' ? '#10b981' : '#f59e0b', cursor: 'pointer' }}><option value="paid">Payé</option><option value="pending">En attente</option></select> },
                            ].map(({ label, node }) => (
                              <div key={label} style={{ background: 'var(--surface)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
                                {node}
                              </div>
                            ))}
                          </div>
                          {/* Contact */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><label className="pro-label">Téléphone</label><input className="pro-input" value={selectedClient.phone} onChange={e => updateClient({ ...selectedClient, phone: e.target.value })} /></div>
                            <div><label className="pro-label">Email</label><input className="pro-input" type="email" value={selectedClient.email || ''} onChange={e => updateClient({ ...selectedClient, email: e.target.value })} /></div>
                          </div>
                          {/* Plan */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><label className="pro-label">Abonnement</label>
                              <select className="pro-input pro-select" value={normalizeSubscriptionType(selectedClient.subscriptionType)} onChange={e => updateClient({ ...selectedClient, subscriptionType: e.target.value as SubscriptionType })}>
                                {(Object.keys(SUBSCRIPTION_LABELS) as SubscriptionType[]).map((key) => (
                                  <option key={key} value={key}>{SUBSCRIPTION_LABELS[key]} — {getSubscriptionPrice(key)} TND/mois</option>
                                ))}
                              </select>
                            </div>
                            <div><label className="pro-label">Paiement</label>
                              <select className="pro-input pro-select" value={selectedClient.paymentMethod} onChange={e => updateClient({ ...selectedClient, paymentMethod: e.target.value as any })}>
                                <option value="cash">Espèces</option>
                                <option value="bank_transfer">Virement</option>
                              </select>
                            </div>
                          </div>
                          {/* Progress chart */}
                          {(selectedClient.progress?.length ?? 0) > 0 && (
                            <div>
                              <label className="pro-label">Évolution du poids (kg)</label>
                              <div style={{ height: 200, marginTop: 8 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={selectedClient.progress}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                                    <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" domain={['dataMin - 2', 'dataMax + 2']} />
                                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                    <Line type="monotone" dataKey="poid" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          )}
                          {/* Regime */}
                          <div>
                            <label className="pro-label">Plan nutritionnel / Régime</label>
                            <textarea className="pro-input" rows={4} style={{ resize: 'vertical' }} value={selectedClient.regime} onChange={e => updateClient({ ...selectedClient, regime: e.target.value })} placeholder="Instructions alimentaires..." />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── PLANNING ── */}
                {view === 'Planning' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="pro-card">
                      <div className="pro-card__header">
                        <h3 className="pro-card__title">Séances à venir</h3>
                        <button className="btn-pro btn-pro-primary btn-pro-sm" onClick={() => setShowScheduleModal(true)}><Plus size={14} /> Planifier</button>
                      </div>
                      <div className="pro-card__content">
                        {sessions.filter(s => s.status === 'scheduled').length === 0 && (
                          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Aucune séance planifiée</div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {sessions.filter(s => s.status === 'scheduled').sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).map(s => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
                                  {new Date(s.dateTime).getDate()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700 }}>{s.clientName}</div>
                                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {new Date(s.dateTime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} · {new Date(s.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {s.notes && ` · ${s.notes}`}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-pro btn-pro-ghost btn-pro-sm" onClick={() => notifySession(s)} title="Notifier"><Bell size={14} /></button>
                                <button className="btn-pro btn-pro-ghost btn-pro-sm" onClick={() => copyReminder(s)} title="Copier rappel"><Copy size={14} /></button>
                                <button className="btn-pro btn-pro-ghost btn-pro-sm" style={{ color: '#10b981' }} onClick={() => setSessions(sessions.map(x => x.id === s.id ? { ...x, status: 'completed' } : x))} title="Marquer terminée"><CheckCircle2 size={14} /></button>
                                <button className="btn-pro btn-pro-ghost btn-pro-sm" style={{ color: '#ef4444' }} onClick={() => setSessions(sessions.map(x => x.id === s.id ? { ...x, status: 'cancelled' } : x))} title="Annuler"><X size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PAIEMENTS ── */}
                {view === 'Paiements' && (
                  <div className="pro-card">
                    <div className="pro-card__header">
                      <h3 className="pro-card__title">Aperçu Financier</h3>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span className="pro-badge pro-badge--success">Payé: {clients.filter(c => c.paymentStatus === 'paid').reduce((a, c) => a + getSubscriptionPrice(c.subscriptionType), 0)} TND</span>
                        <span className="pro-badge pro-badge--warning">En attente: {clients.filter(c => c.paymentStatus === 'pending').length}</span>
                      </div>
                    </div>
                    <div className="pro-card__content">
                      {clients.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Aucune transaction</div>}
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['Client', 'Abonnement', 'Montant', 'Méthode', 'Statut'].map(h => (
                              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {clients.map(c => (
                            <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '12px' }}><div style={{ fontWeight: 700 }}>{c.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.phone}</div></td>
                              <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{SUBSCRIPTION_LABELS[normalizeSubscriptionType(c.subscriptionType)]}</td>
                              <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>{getSubscriptionPrice(c.subscriptionType)} TND</td>
                              <td style={{ padding: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{c.paymentMethod === 'cash' ? 'Espèces' : 'Virement'}</td>
                              <td style={{ padding: '12px' }}>
                                <button onClick={() => updateClient({ ...c, paymentStatus: c.paymentStatus === 'paid' ? 'pending' : 'paid' })} className={`pro-badge ${c.paymentStatus === 'paid' ? 'pro-badge--success' : 'pro-badge--warning'}`} style={{ cursor: 'pointer', border: 'none' }}>
                                  {c.paymentStatus === 'paid' ? '✓ Payé' : '○ En attente'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── INSCRIPTIONS ── */}
                {view === 'signups' && (
                  <div className="pro-card">
                    <div className="pro-card__header">
                      <h3 className="pro-card__title">Inscriptions en Attente ({pendingSignUps.length})</h3>
                    </div>
                    <div className="pro-card__content">
                      {pendingSignUps.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Aucune inscription en attente</div>}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 16 }}>
                        {pendingSignUps.map(s => (
                          <div key={s.id} style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                              <div style={{ fontWeight: 800, fontSize: 18 }}>{s.name}</div>
                              <span className="pro-badge pro-badge--info">Nouveau</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, marginBottom: 16 }}>
                              {s.phone && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Phone size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />{s.phone}</div>}
                              {s.email && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Mail size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />{s.email}</div>}
                              {s.poid && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Weight size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />{s.poid} kg · {s.taille} cm</div>}
                              {s.goal && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Package size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />{s.goal.replace('_', ' ')}</div>}
                              {s.subscriptionType && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><DollarSign size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />{formatSubscriptionDisplay(s.subscriptionType)}</div>}
                              {s.message && <div style={{ marginTop: 4, padding: '8px 10px', background: 'rgba(148,163,184,0.08)', borderRadius: 6, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>"{s.message}"</div>}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn-pro btn-pro-primary" style={{ flex: 2, fontSize: 12, justifyContent: 'center' }} onClick={() => approveSignUp(s.id)}><CheckCircle2 size={14} /> Approuver</button>
                              <button className="btn-pro btn-pro-ghost" style={{ flex: 1, fontSize: 12, color: '#ef4444', justifyContent: 'center' }} onClick={() => rejectSignUp(s.id)}><X size={14} /> Rejeter</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── HISTORIQUE ── */}
                {view === 'Historique' && (
                  <div className="pro-card">
                    <div className="pro-card__header">
                      <h3 className="pro-card__title">Historique des Séances</h3>
                    </div>
                    <div className="pro-card__content">
                      {sessions.filter(s => s.status !== 'scheduled').length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Aucun historique</div>}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {sessions.filter(s => s.status !== 'scheduled').sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()).map(s => (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', opacity: s.status === 'cancelled' ? 0.6 : 1 }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>{s.clientName}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(s.dateTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {new Date(s.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              {s.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.notes}</div>}
                            </div>
                            <span className={`pro-badge ${s.status === 'completed' ? 'pro-badge--success' : 'pro-badge--danger'}`}>{s.status === 'completed' ? 'Terminée' : 'Annulée'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <ProModal 
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        title="Ajouter un Client"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              className="btn-pro btn-pro-ghost"
              onClick={() => setShowAddClientModal(false)}
            >
              Annuler
            </button>
            <button 
              className="btn-pro btn-pro-primary"
              type="button"
              onClick={(e) => { e.preventDefault(); handleAddClient(e as any); }}
            >
              Ajouter
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddClient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="pro-label">Nom complet</label>
            <input 
              type="text" 
              className="pro-input"
              required
              value={newClientForm.name}
              onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="pro-label">Téléphone</label>
              <input 
                type="text" 
                className="pro-input"
                required
                value={newClientForm.phone}
                onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                placeholder="+216 XX XXX XXX"
              />
            </div>
            <div>
              <label className="pro-label">Email</label>
              <input 
                type="email" 
                className="pro-input"
                value={newClientForm.email}
                onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="pro-label">Poids (kg)</label>
              <input 
                type="number" 
                className="pro-input"
                value={newClientForm.poid}
                onChange={(e) => setNewClientForm({ ...newClientForm, poid: e.target.value })}
                placeholder="75"
              />
            </div>
            <div>
              <label className="pro-label">Taille (cm)</label>
              <input 
                type="number" 
                className="pro-input"
                value={newClientForm.taille}
                onChange={(e) => setNewClientForm({ ...newClientForm, taille: e.target.value })}
                placeholder="180"
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="pro-label">Type d'abonnement</label>
              <select 
                className="pro-input pro-select"
                value={newClientForm.subscriptionType}
                onChange={(e) => setNewClientForm({ ...newClientForm, subscriptionType: e.target.value as SubscriptionType })}
              >
                {(Object.keys(SUBSCRIPTION_LABELS) as SubscriptionType[]).map((key) => (
                  <option key={key} value={key}>{SUBSCRIPTION_LABELS[key]} ({getSubscriptionPrice(key)} TND/mois)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="pro-label">Méthode de paiement</label>
              <select 
                className="pro-input pro-select"
                value={newClientForm.paymentMethod}
                onChange={(e) => setNewClientForm({ ...newClientForm, paymentMethod: e.target.value as any })}
              >
                <option value="cash">Espèces</option>
                <option value="bank_transfer">Virement bancaire</option>
              </select>
            </div>
          </div>
        </form>
      </ProModal>

      {/* Schedule Session Modal */}
      <ProModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Planifier une Séance"
        footer={
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn-pro btn-pro-ghost" onClick={() => setShowScheduleModal(false)}>Annuler</button>
            <button className="btn-pro btn-pro-primary" onClick={saveSession}>Planifier</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="pro-label">Client *</label>
            <select className="pro-input pro-select" value={scheduleForm.clientId} onChange={e => setScheduleForm({ ...scheduleForm, clientId: e.target.value })}>
              <option value="">Sélectionner un client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="pro-label">Date *</label>
              <input type="date" className="pro-input" value={scheduleForm.date} min={new Date().toISOString().split('T')[0]} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} />
            </div>
            <div>
              <label className="pro-label">Heure *</label>
              <input type="time" className="pro-input" value={scheduleForm.time} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="pro-label">Notes (optionnel)</label>
            <textarea className="pro-input" rows={3} style={{ resize: 'none' }} placeholder="Notes de séance..." value={scheduleForm.notes} onChange={e => setScheduleForm({ ...scheduleForm, notes: e.target.value })} />
          </div>
        </div>
      </ProModal>
    </div>
  );
}
