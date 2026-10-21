import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { fetchFleet, vehicleRemoved, vehicleUpserted } from './features/fleet/fleetSlice'
import { fleetService } from './services/fleetService'
import type { Vehicle, VehicleStatus } from './features/fleet/fleetTypes'
import { ManagementPanel } from './components/ManagementPanel'
import { ManagementWorkspace } from './components/ManagementWorkspace'
import { fetchResource } from './features/management/managementSlice'
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, Check, ChevronDown, ChevronLeft,
  ChevronRight, CircleHelp, ClipboardList, Clock3, Command, Download,
  Fuel, Gauge, LayoutDashboard, Menu, Plus, Search, Settings2, ShieldCheck,
  SlidersHorizontal, Sparkles, Truck, Wrench, X, Pencil, Trash2, RefreshCw,
  Users, Boxes, HandCoins, UserCog, LogOut, ArrowRight, Shield,
} from 'lucide-react'
import { apiRequest } from './services/apiClient'
import { UserAccountsWorkspace } from './components/UserAccountsWorkspace'
import { VehicleConfigurator } from './components/VehicleConfigurator'

type Status = VehicleStatus
type Veiculo = Vehicle
type Draft = { marca: string; modelo: string; ano: string; placa: string; status: Status; cor: string; combustivel: string; categoria: string; imagemUrl: string; problemaAtual: string; proprietarioId: string; recargaExterna: boolean; autonomiaEletricaKm: string; fonteImagem: string }
const emptyDraft: Draft = { marca: '', modelo: '', ano: String(new Date().getFullYear()), placa: '', status: 'ATIVO', cor: 'Branco', combustivel: 'FLEX', categoria: 'HATCH', imagemUrl: '', problemaAtual: '', proprietarioId: '', recargaExterna: false, autonomiaEletricaKm: '', fonteImagem: '' }
const statusLabel: Record<Status, string> = { ATIVO: 'Em operação', MANUTENCAO: 'Em manutenção', INATIVO: 'Inativo' }
const initials = (v: Veiculo) => `${v.marca.slice(0, 1)}${v.modelo.slice(0, 1)}`.toUpperCase()
const vehiclePhoto = (v: Veiculo) => v.imagemUrl || (/ford/i.test(v.marca) && /ka/i.test(v.modelo)
  ? 'https://commons.wikimedia.org/wiki/Special:FilePath/2020_Ford_Ka_1.5_SEL,_front_view_(Brazil).jpg?width=900'
  : '')

type SessionUser = { id: number; nome: string; email: string; perfil: string }
const profileNames: Record<string, string> = { ADMIN_MASTER: 'Administrador Master', GERENTE: 'Gerente', RH: 'Recursos Humanos', VENDEDOR: 'Vendedor', MECANICO: 'Mecânico', OPERACAO: 'Operações' }

function App() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    apiRequest<SessionUser>('/api/auth/me').then(setUser).catch(() => setUser(null)).finally(() => setCheckingSession(false))
  }, [])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setLoginError('')
    try {
      const session = await apiRequest<SessionUser>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, senha: password }) })
      setUser(session)
    } catch (error) { setLoginError(error instanceof Error ? error.message : 'Não foi possível entrar.') }
    finally { setSubmitting(false) }
  }

  async function logout() {
    try { await apiRequest<void>('/api/auth/logout', { method: 'POST' }) } catch { /* The local session is cleared even if the server session already expired. */ } finally { setUser(null); setShowLogin(false); setPassword('') }
  }

  if (checkingSession) return <div className="auth-loading"><div className="brand-symbol"><Truck size={23} /></div><span>Preparando seu espaço de trabalho...</span></div>
  if (!user) return <PublicHome showLogin={showLogin} setShowLogin={setShowLogin} email={email} setEmail={setEmail} password={password} setPassword={setPassword} error={loginError} submitting={submitting} onLogin={login} />
  return <FleetApp user={user} onLogout={() => void logout()} />
}

function PublicHome({ showLogin, setShowLogin, email, setEmail, password, setPassword, error, submitting, onLogin }: {
  showLogin: boolean; setShowLogin: (value: boolean) => void; email: string; setEmail: (value: string) => void;
  password: string; setPassword: (value: string) => void; error: string; submitting: boolean; onLogin: (event: FormEvent<HTMLFormElement>) => void
}) {
  return <main className="public-shell">
    <nav className="public-nav"><a className="public-brand" href="#inicio"><span className="brand-symbol"><Truck size={22} /></span><strong>frota<span>flow</span></strong></a><div><a href="#recursos">Recursos</a><a href="#operacao">Operação</a><button className="button button-primary" onClick={() => setShowLogin(true)}>Acessar plataforma <ArrowRight size={15} /></button></div></nav>
    <section className="public-hero" id="inicio"><div className="hero-copy"><div className="hero-eyebrow"><span /> GESTÃO INTELIGENTE DE FROTAS</div><h1>Mais controle.<br /><em>Mais movimento.</em></h1><p>Uma visão clara da frota, da equipe e da operação em um só lugar. Decisões melhores começam com dados organizados.</p><div className="hero-actions"><button className="button button-primary" onClick={() => setShowLogin(true)}>Entrar na plataforma <ArrowRight size={16} /></button><a href="#recursos">Conheça a operação <ChevronRight size={16} /></a></div><div className="hero-proof"><span><Shield size={14} /> Acesso por perfil</span><i /><span>Frota, oficina e equipe conectadas</span></div></div>
      <div className="hero-visual" id="operacao"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-card hero-card-top"><span className="hero-card-icon"><Activity size={15} /></span><div><small>DISPONIBILIDADE</small><strong>Operação em foco</strong></div><span className="hero-live"><i /> AO VIVO</span></div><div className="hero-vehicle"><div className="hero-car-roof" /><div className="hero-car-body"><i /><b /></div><div className="hero-wheel wheel-one" /><div className="hero-wheel wheel-two" /><span className="hero-headlight" /></div><div className="hero-card hero-card-bottom"><span className="hero-stat-dot" /><div><small>VISÃO INTEGRADA</small><strong>Frota · Pessoas · Resultados</strong></div><ChevronRight size={16} /></div></div></section>
    <section className="public-features" id="recursos"><div><span>01</span><strong>Frota organizada</strong><small>Veículos, status e histórico em uma única visão.</small></div><div><span>02</span><strong>Equipe conectada</strong><small>Acesso adequado para cada responsabilidade.</small></div><div><span>03</span><strong>Operação acompanhada</strong><small>Manutenção, estoque e vendas integrados.</small></div></section>
    {showLogin && <div className="login-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowLogin(false) }}><section className="login-card" role="dialog" aria-modal="true" aria-labelledby="login-title"><button className="login-close" onClick={() => setShowLogin(false)} aria-label="Fechar login"><X size={18} /></button><span className="login-emblem"><Shield size={22} /></span><span className="login-kicker">ÁREA SEGURA</span><h2 id="login-title">Boas-vindas de volta.</h2><p>Entre com sua conta para acessar o FrotaFlow.</p><form onSubmit={onLogin}><label>E-mail<input autoFocus type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} placeholder="voce@empresa.com" /></label><label>Senha<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} placeholder="Sua senha" /></label>{error && <div className="login-error">{error}</div>}<button className="button button-primary login-submit" disabled={submitting}>{submitting ? 'Entrando...' : 'Entrar com segurança'} <ArrowRight size={15} /></button></form><small className="login-roles">Gerente <i /> RH <i /> Vendedor <i /> Administrador Master</small></section></div>}
    <footer className="public-footer"><span>© 2026 FrotaFlow</span><span>Clareza para manter tudo em movimento.</span></footer>
  </main>
}

function FleetApp({ user, onLogout }: { user: SessionUser; onLogout: () => void }) {
  const dispatch = useAppDispatch()
  const { vehicles, dashboard, loading, error: apiError } = useAppSelector(state => state.fleet)
  const owners = useAppSelector(state => state.management.records.proprietarios ?? [])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'TODOS' | Status>('TODOS')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Veiculo | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const defaultPage = user.perfil === 'RH' ? 'Funcionários' : user.perfil === 'VENDEDOR' ? 'Vendas' : user.perfil === 'MECANICO' ? 'Manutenção' : 'Visão geral'
  const [activeNav, setActiveNav] = useState(defaultPage)
  const [photoVehicle, setPhotoVehicle] = useState<Veiculo | null>(null)

  const load = () => dispatch(fetchFleet())
  useEffect(() => { void dispatch(fetchFleet()) }, [dispatch])
  useEffect(() => { if (['ADMIN_MASTER', 'GERENTE', 'VENDEDOR', 'RH'].includes(user.perfil)) void dispatch(fetchResource('proprietarios')) }, [dispatch, user.perfil])
  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timeout)
  }, [toast])
  useEffect(() => {
    if (!photoVehicle) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setPhotoVehicle(null) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [photoVehicle])

  const filteredVehicles = useMemo(() => vehicles.filter(v => {
    const term = search.trim().toLowerCase()
    const matchesTerm = !term || `${v.marca} ${v.modelo} ${v.placa} ${v.ano}`.toLowerCase().includes(term)
    return matchesTerm && (filter === 'TODOS' || v.status === filter)
  }), [vehicles, search, filter])

  const openCreate = () => { setEditing(null); setDraft(emptyDraft); setModalOpen(true) }
  const openEdit = (vehicle: Veiculo) => {
    setEditing(vehicle); setDraft({ marca: vehicle.marca, modelo: vehicle.modelo, ano: String(vehicle.ano), placa: vehicle.placa, status: vehicle.status, cor: vehicle.cor ?? 'Branco', combustivel: vehicle.combustivel ?? 'FLEX', categoria: vehicle.categoria ?? 'HATCH', imagemUrl: vehicle.imagemUrl ?? '', problemaAtual: vehicle.problemaAtual ?? '', proprietarioId: String(vehicle.proprietario?.id ?? ''), recargaExterna: vehicle.recargaExterna ?? false, autonomiaEletricaKm: String(vehicle.autonomiaEletricaKm ?? ''), fonteImagem: vehicle.fonteImagem ?? '' }); setModalOpen(true)
  }

  async function saveVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true)
    const payload = { ...draft, ano: Number(draft.ano), placa: draft.placa.toUpperCase().replace(/[^A-Z0-9]/g, ''), proprietarioId: draft.proprietarioId ? Number(draft.proprietarioId) : null, autonomiaEletricaKm: draft.autonomiaEletricaKm ? Number(draft.autonomiaEletricaKm) : null }
    try {
      const saved = editing
        ? await fleetService.updateVehicle(editing.id, payload)
        : await fleetService.createVehicle(payload)
      dispatch(vehicleUpserted(saved))
      setModalOpen(false); setToast(editing ? 'Veículo atualizado com sucesso.' : 'Veículo cadastrado com sucesso.')
    } catch (error) { setToast(error instanceof Error ? error.message : 'Não foi possível salvar o veículo.') }
    finally { setSaving(false) }
  }

  async function deleteVehicle(vehicle: Veiculo) {
    if (!window.confirm(`Deseja realmente excluir ${vehicle.marca} ${vehicle.modelo} (${vehicle.placa})?`)) return
    try { await fleetService.deleteVehicle(vehicle.id); dispatch(vehicleRemoved(vehicle.id)); setToast('Veículo removido.') }
    catch (error) { setToast(error instanceof Error ? error.message : 'Não foi possível excluir o veículo.') }
  }

  function exportCsv() {
    const header = ['ID', 'Marca', 'Modelo', 'Ano', 'Placa', 'Status']
    const rows = filteredVehicles.map(v => [v.id, v.marca, v.modelo, v.ano, v.placa, statusLabel[v.status]])
    const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(';')).join('\r\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob)
    const link = document.createElement('a'); link.href = url; link.download = 'frotaflow-veiculos.csv'; link.click(); URL.revokeObjectURL(url)
    setToast('Relatório CSV exportado.')
  }

  const canManageFleet = ['ADMIN_MASTER', 'GERENTE'].includes(user.perfil)
  const navItems = [
    { label: 'Visão geral', icon: LayoutDashboard }, { label: 'Veículos', icon: Truck },
    { label: 'Funcionários', icon: Users },
    { label: 'Proprietários', icon: Users }, { label: 'Peças', icon: Boxes },
    { label: 'Manutenção', icon: Wrench }, { label: 'Vendas', icon: HandCoins },
    { label: 'Relatórios', icon: ClipboardList },
    ...(user.perfil === 'ADMIN_MASTER' ? [{ label: 'Usuários', icon: UserCog }] : []),
  ]
  const rolePages: Record<string, string[]> = {
    ADMIN_MASTER: navItems.map(item => item.label),
    GERENTE: ['Visão geral', 'Veículos', 'Funcionários', 'Proprietários', 'Peças', 'Manutenção', 'Vendas', 'Relatórios'],
    RH: ['Funcionários'], VENDEDOR: ['Veículos', 'Proprietários', 'Vendas'],
    MECANICO: ['Veículos', 'Peças', 'Manutenção'], OPERACAO: ['Visão geral', 'Veículos', 'Peças', 'Manutenção'],
  }
  const visibleNavItems = navItems.filter(item => rolePages[user.perfil]?.includes(item.label))
  const todayLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toLocaleUpperCase('pt-BR')

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="brand-row"><div className="brand-symbol"><Truck size={23} strokeWidth={2.3} /></div><div className="brand-name">frota<span>flow</span><small>FLEET INTELLIGENCE</small></div><button className="mobile-close icon-button" onClick={() => setMobileMenu(false)} aria-label="Fechar menu"><X size={18} /></button></div>
      <div className="workspace"><div className="workspace-icon"><Command size={17} /></div><div><span>Workspace</span><strong>Operação principal</strong></div><ChevronDown size={15} className="muted-icon" /></div>
      <div className="nav-caption">PLATAFORMA</div>
      <nav className="nav-list">{visibleNavItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-link ${activeNav === label ? 'active' : ''}`} onClick={() => { setActiveNav(label); setMobileMenu(false); if (label === 'Veículos') window.setTimeout(() => document.getElementById('vehicle-section')?.scrollIntoView({ behavior: 'smooth' }), 0) }}><Icon size={18} /><span>{label}</span>{label === 'Veículos' && <span className="nav-pill">{dashboard.total}</span>}{label === 'Manutenção' && dashboard.manutencao > 0 && <span className="nav-pill warning-pill">{dashboard.manutencao}</span>}</button>)}</nav>
      <div className="nav-caption tools-caption">PREFERÊNCIAS</div>
      <button className="nav-link" onClick={() => setToast('Configurações disponíveis em uma próxima versão.')}><Settings2 size={18} /><span>Configurações</span></button>
      <div className="sidebar-spacer" />
      <div className="upgrade-card"><div className="upgrade-glow"><Sparkles size={17} /></div><strong>Sua frota, em outro nível.</strong><p>Dados claros. Decisões melhores. Operação eficiente.</p><div className="upgrade-meter"><span /></div><small><span>FrotaFlow</span><span>PRO CONCEPT</span></small></div>
      <div className="profile-row"><div className="profile-avatar">{user.nome.split(/\s+/).map(name => name[0]).slice(0, 2).join('').toUpperCase()}</div><div className="profile-text"><strong>{user.nome}</strong><span>{profileNames[user.perfil] ?? user.perfil}</span></div><button className="icon-button profile-more" aria-label="Sair da conta" onClick={onLogout}><LogOut size={17} /></button></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><button className="mobile-menu icon-button" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu size={20} /></button><span>Workspace</span><ChevronRight size={14} /><strong>{activeNav}</strong></div><div className="topbar-actions"><div className="system-status"><span className={`status-dot ${apiError ? 'offline' : ''}`} />{apiError ? 'API desconectada' : 'Sistema operacional'}</div><button className="icon-button notification-button" onClick={() => setToast('Você está em dia. Nenhuma nova notificação.')} aria-label="Notificações"><Bell size={18} /><i /></button><div className="topbar-divider" /><div className="top-avatar">AA</div></div></header>

      <div className="page-content">
        {['Visão geral', 'Veículos'].includes(activeNav) ? <>
        <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> {todayLabel} <span className="live-chip"><span /> PAINEL OPERACIONAL</span></div><h1>Visão geral<span className="heading-period">.</span></h1><p className="page-subtitle">Sua operação em movimento. Tudo sob controle, em um só lugar.</p></div><div className="welcome-actions"><button className="button button-secondary" onClick={exportCsv}><Download size={16} /> Exportar relatório</button>{canManageFleet && <button className="button button-primary" onClick={openCreate}><Plus size={18} strokeWidth={2.5} /> Novo veículo</button>}</div></section>

        {apiError && <div className="api-alert"><div className="api-alert-icon"><Activity size={19} /></div><div><strong>Não foi possível carregar os dados</strong><p>{apiError}. Confirme se o backend Java está iniciado.</p></div><button className="button button-secondary button-small" onClick={() => void load()}><RefreshCw size={14} /> Tentar novamente</button></div>}

        <section className="metric-grid" aria-label="Indicadores da frota">
          <article className="metric-card metric-primary"><div className="metric-top"><span className="metric-label">FROTA TOTAL</span><div className="metric-icon purple"><Truck size={19} /></div></div><div className="metric-value-row"><strong>{loading ? '—' : dashboard.total.toString().padStart(2, '0')}</strong><span className="metric-trend"><ArrowUpRight size={14} /> Inventário</span></div><div className="metric-foot"><span className="metric-track"><span style={{ width: dashboard.total ? '100%' : '0%' }} /></span><span>Veículos cadastrados</span></div><div className="metric-watermark"><Truck size={76} /></div></article>
          <article className="metric-card"><div className="metric-top"><span className="metric-label">EM OPERAÇÃO</span><div className="metric-icon green"><Activity size={19} /></div></div><div className="metric-value-row"><strong>{loading ? '—' : dashboard.ativos.toString().padStart(2, '0')}</strong><span className="metric-trend positive"><ArrowUpRight size={14} /> Ativos</span></div><div className="metric-foot"><span className="mini-bars green-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></span><span>{dashboard.total ? Math.round(dashboard.ativos / dashboard.total * 100) : 0}% da frota</span></div></article>
          <article className="metric-card"><div className="metric-top"><span className="metric-label">EM MANUTENÇÃO</span><div className="metric-icon amber"><Wrench size={19} /></div></div><div className="metric-value-row"><strong>{loading ? '—' : dashboard.manutencao.toString().padStart(2, '0')}</strong><span className="metric-trend warning-text"><Clock3 size={13} /> Atenção</span></div><div className="metric-foot"><span className="metric-track amber-track"><span style={{ width: dashboard.total ? `${dashboard.manutencao / dashboard.total * 100}%` : '0%' }} /></span><span>Precisam de cuidado</span></div></article>
          <article className="metric-card"><div className="metric-top"><span className="metric-label">INDISPONÍVEIS</span><div className="metric-icon rose"><Gauge size={19} /></div></div><div className="metric-value-row"><strong>{loading ? '—' : dashboard.inativos.toString().padStart(2, '0')}</strong><span className="metric-trend neutral-trend"><ArrowDownRight size={14} /> Inativos</span></div><div className="metric-foot"><span className="metric-track rose-track"><span style={{ width: dashboard.total ? `${dashboard.inativos / dashboard.total * 100}%` : '0%' }} /></span><span>Fora da operação</span></div></article>
        </section>

        <section className="insight-banner"><div className="insight-icon"><Sparkles size={20} /></div><div className="insight-copy"><span>INSIGHT DA OPERAÇÃO</span><strong>{dashboard.manutencao ? `${dashboard.manutencao} veículo(s) precisam de atenção.` : 'Sua operação está pronta para acelerar.'}</strong><p>{dashboard.manutencao ? 'Acompanhe os veículos em manutenção para manter a disponibilidade da frota.' : 'Mantenha os dados atualizados para acompanhar disponibilidade e desempenho em tempo real.'}</p></div><div className="insight-decoration"><div className="insight-ring ring-one" /><div className="insight-ring ring-two" /><Activity size={46} /></div><button className="insight-action" onClick={() => { setFilter(dashboard.manutencao ? 'MANUTENCAO' : 'TODOS'); document.getElementById('vehicle-section')?.scrollIntoView({ behavior: 'smooth' }) }} aria-label="Ver veículos"><ChevronRight size={20} /></button></section>

        <ManagementPanel dashboard={dashboard} />

        <section className="vehicle-section" id="vehicle-section"><div className="section-heading"><div><div className="section-kicker"><span /> CONTROLE OPERACIONAL</div><h2>Veículos da frota <span>{filteredVehicles.length}</span></h2><p>Gerencie seus veículos e acompanhe o status de cada ativo.</p></div><button className="button button-secondary filter-button" onClick={() => setFilter(filter === 'TODOS' ? 'ATIVO' : 'TODOS')}><SlidersHorizontal size={16} /> {filter === 'TODOS' ? 'Filtros' : 'Limpar filtro'}{filter !== 'TODOS' && <span className="filter-active-dot" />}</button></div>
          <div className="table-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por veículo, placa ou marca..." aria-label="Buscar veículos" /><kbd>⌘ K</kbd></div><div className="table-toolbar-right"><div className="filter-tabs"><button className={filter === 'TODOS' ? 'selected' : ''} onClick={() => setFilter('TODOS')}>Todos <span>{dashboard.total}</span></button><button className={filter === 'ATIVO' ? 'selected' : ''} onClick={() => setFilter('ATIVO')}>Ativos</button><button className={filter === 'MANUTENCAO' ? 'selected' : ''} onClick={() => setFilter('MANUTENCAO')}>Manutenção</button><button className={filter === 'INATIVO' ? 'selected' : ''} onClick={() => setFilter('INATIVO')}>Inativos</button></div><button className="icon-button table-settings" aria-label="Exportar CSV" onClick={exportCsv}><Download size={16} /></button></div></div>
          <div className="table-wrap"><table><thead><tr><th><input type="checkbox" aria-label="Selecionar todos" disabled /></th><th>VEÍCULO</th><th>PLACA</th><th>PROPRIETÁRIO</th><th>MOTORIZAÇÃO</th><th>STATUS</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>
            {loading && <tr><td colSpan={7}><div className="table-state"><RefreshCw size={18} className="spin" /> Carregando frota...</div></td></tr>}
            {!loading && filteredVehicles.map((vehicle, index) => { const image = vehiclePhoto(vehicle); return <tr key={vehicle.id} style={{ animationDelay: `${index * 35}ms` }}><td><input type="checkbox" aria-label={`Selecionar ${vehicle.modelo}`} /></td><td><div className="vehicle-cell"><button type="button" className={`vehicle-avatar vehicle-photo avatar-${vehicle.status.toLowerCase()} ${image ? 'has-photo' : ''}`} aria-label={image ? `Abrir foto de ${vehicle.marca} ${vehicle.modelo}` : `Foto não cadastrada para ${vehicle.marca} ${vehicle.modelo}`} disabled={!image} onClick={() => setPhotoVehicle(vehicle)}><span>{initials(vehicle)}</span>{image && <img src={image} alt={`${vehicle.marca} ${vehicle.modelo}`} loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; const button = event.currentTarget.parentElement as HTMLButtonElement | null; if (button) { button.disabled = true; button.classList.remove('has-photo') } }} />}</button><div><button type="button" className="vehicle-open-detail" onClick={() => setPhotoVehicle(vehicle)}>{vehicle.marca} {vehicle.modelo}</button><span>{vehicle.cor ?? 'Cor não informada'} · {vehicle.ano} · {vehicle.categoria ?? 'Veículo'}</span>{vehicle.problemaAtual && <small className="vehicle-problem">{vehicle.problemaAtual}</small>}</div></div></td><td><span className="plate-tag">{vehicle.placa}</span></td><td>{vehicle.proprietario?.nome ?? '—'}</td><td><span className="fuel-badge">{vehicle.combustivel === 'ELETRICO' ? '100% elétrico' : vehicle.combustivel?.replace(/_/g, ' ') ?? 'Não informado'}{vehicle.recargaExterna && ' · recarga externa'}{vehicle.autonomiaEletricaKm ? ` · ${vehicle.autonomiaEletricaKm} km` : ''}</span></td><td><span className={`status-badge status-${vehicle.status.toLowerCase()}`}><i />{statusLabel[vehicle.status]}</span></td><td><div className="row-actions">{canManageFleet && <><button className="icon-button" aria-label={`Editar ${vehicle.modelo}`} onClick={() => openEdit(vehicle)}><Pencil size={15} /></button><button className="icon-button danger-action" aria-label={`Excluir ${vehicle.modelo}`} onClick={() => void deleteVehicle(vehicle)}><Trash2 size={15} /></button></>}</div></td></tr> })}
            {!loading && filteredVehicles.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="empty-illustration"><Truck size={29} /></div><strong>{vehicles.length ? 'Nenhum veículo encontrado' : 'Sua frota começa aqui'}</strong><p>{vehicles.length ? 'Tente mudar a busca ou os filtros selecionados.' : 'Cadastre seu primeiro veículo para visualizar os dados da operação.'}</p><button className="button button-primary button-small" onClick={vehicles.length ? () => { setSearch(''); setFilter('TODOS') } : openCreate}>{vehicles.length ? 'Limpar filtros' : <><Plus size={15} /> Cadastrar primeiro veículo</>}</button></div></td></tr>}
          </tbody></table></div>
          <div className="table-footer"><span>Exibindo <strong>{filteredVehicles.length}</strong> de <strong>{vehicles.length}</strong> veículos</span><div className="pagination"><button className="icon-button" disabled aria-label="Página anterior"><ChevronLeft size={16} /></button><button className="page-number active-page">1</button><button className="icon-button" disabled aria-label="Próxima página"><ChevronRight size={16} /></button></div><span className="updated-label"><span /> Dados sincronizados</span></div>
        </section>
        <footer className="footer"><span>© 2026 FrotaFlow <span className="footer-dot">·</span> Fleet intelligence platform</span><span><ShieldCheck size={13} /> Operação protegida <span className="footer-dot">·</span> Feito para mover o futuro.</span></footer>
        </> : activeNav === 'Usuários' ? <UserAccountsWorkspace onToast={setToast} /> : <ManagementWorkspace page={activeNav} onToast={setToast} readOnly={user.perfil === 'VENDEDOR' && activeNav === 'Proprietários'} />}
      </div>
    </main>

    {mobileMenu && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}
    {photoVehicle && <VehicleConfigurator vehicle={photoVehicle} onClose={() => setPhotoVehicle(null)} />}
    {modalOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false) }}><section className="vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><div className="modal-heading-icon"><Truck size={20} /></div><div><span>GESTÃO DA FROTA</span><h2 id="modal-title">{editing ? 'Editar veículo' : 'Novo veículo'}</h2><p>{editing ? 'Atualize as informações deste ativo.' : 'Adicione um veículo ao seu inventário.'}</p></div><button className="icon-button" onClick={() => setModalOpen(false)} aria-label="Fechar modal"><X size={19} /></button></div><form onSubmit={saveVehicle}><div className="form-grid"><label className="form-field"><span>Marca</span><input required maxLength={80} value={draft.marca} onChange={e => setDraft({ ...draft, marca: e.target.value })} placeholder="Ex.: Toyota" autoFocus /></label><label className="form-field"><span>Modelo / versão</span><input required maxLength={100} value={draft.modelo} onChange={e => setDraft({ ...draft, modelo: e.target.value })} placeholder="Ex.: Corolla Cross Hybrid" /></label><label className="form-field"><span>Ano do veículo</span><input required type="number" min="1950" max="2100" value={draft.ano} onChange={e => setDraft({ ...draft, ano: e.target.value })} /></label><label className="form-field"><span>Placa Mercosul</span><input required maxLength={7} minLength={7} pattern="[A-Za-z]{3}[0-9][A-Za-z0-9][0-9]{2}" value={draft.placa} onChange={e => setDraft({ ...draft, placa: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })} placeholder="ABC1D23" /></label><label className="form-field"><span>Cor</span><input maxLength={40} value={draft.cor} onChange={e => setDraft({ ...draft, cor: e.target.value })} placeholder="Prata" /></label><label className="form-field"><span>Categoria</span><select value={draft.categoria} onChange={e => setDraft({ ...draft, categoria: e.target.value })}><option value="HATCH">Hatch</option><option value="SEDAN">Sedan</option><option value="SUV">SUV</option><option value="PICAPE">Picape / caminhoneta</option><option value="VAN">Van</option><option value="CAMINHAO">Caminhão</option><option value="ONIBUS">Ônibus</option><option value="MOTO">Moto</option><option value="OUTRO">Outro</option></select></label><label className="form-field"><span>Motorização / combustível</span><select value={draft.combustivel} onChange={e => setDraft({ ...draft, combustivel: e.target.value, recargaExterna: ['ELETRICO','HIBRIDO_PLUGIN'].includes(e.target.value) })}><option value="FLEX">Flex (gasolina / etanol)</option><option value="FLEX_ETANOL">Flex / etanol</option><option value="GASOLINA">Gasolina</option><option value="DIESEL">Diesel</option><option value="ELETRICO">100% elétrico</option><option value="HIBRIDO_FLEX">Híbrido flex autorrecarregável</option><option value="HIBRIDO_LEVE">Híbrido leve (MHEV)</option><option value="HIBRIDO_PLUGIN">Híbrido plug-in (PHEV)</option></select></label><label className="form-field"><span>Proprietário</span><select value={draft.proprietarioId} onChange={e => setDraft({ ...draft, proprietarioId: e.target.value })}><option value="">Sem proprietário vinculado</option>{owners.map(owner => <option key={String(owner.id)} value={String(owner.id)}>{String(owner.nome)}</option>)}</select></label><label className="form-field full-field"><span>URL da foto real do veículo</span><input type="url" maxLength={500} value={draft.imagemUrl} onChange={e => setDraft({ ...draft, imagemUrl: e.target.value })} placeholder="Cole a URL da imagem oficial ou do veículo" /></label><label className="form-field full-field"><span>Fonte / crédito da imagem</span><input maxLength={180} value={draft.fonteImagem} onChange={e => setDraft({ ...draft, fonteImagem: e.target.value })} placeholder="Ex.: Chevrolet Brasil ou Wikimedia Commons" /></label><label className="form-field full-field"><span>Problema / observação da oficina</span><textarea rows={2} maxLength={500} value={draft.problemaAtual} onChange={e => setDraft({ ...draft, problemaAtual: e.target.value })} placeholder="Ex.: Onix batido; capô amassado e farol esquerdo quebrado." /></label><label className="form-field"><span>Autonomia elétrica (km)</span><input type="number" min="0" value={draft.autonomiaEletricaKm} onChange={e => setDraft({ ...draft, autonomiaEletricaKm: e.target.value })} placeholder="Opcional" /></label><label className="form-field"><span>Carrega na tomada?</span><select value={String(draft.recargaExterna)} onChange={e => setDraft({ ...draft, recargaExterna: e.target.value === 'true' })}><option value="false">Não — bateria autorrecarregável</option><option value="true">Sim — plug-in / carregamento externo</option></select></label><label className="form-field full-field"><span>Status operacional</span><select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as Status })}><option value="ATIVO">Em operação</option><option value="MANUTENCAO">Em manutenção</option><option value="INATIVO">Inativo</option></select></label></div><div className="modal-tip"><Fuel size={16} /><span>Informações, vínculo do proprietário e imagens são armazenados no PostgreSQL.</span></div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setModalOpen(false)}>Cancelar</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? <><RefreshCw size={15} className="spin" /> Salvando...</> : <><Check size={16} /> {editing ? 'Salvar alterações' : 'Cadastrar veículo'}</>}</button></div></form></section></div>}
    {toast && <div className="toast-message"><div className="toast-check"><Check size={15} /></div><span>{toast}</span><button className="icon-button" onClick={() => setToast('')} aria-label="Fechar mensagem"><X size={15} /></button></div>}
    <button className="help-floating" onClick={() => setToast('FrotaFlow · Central de ajuda')} aria-label="Ajuda"><CircleHelp size={18} /></button>
  </div>
}

export default App
