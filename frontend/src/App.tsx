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
  ChevronRight, CircleHelp, ClipboardList, Clock3, Command, Download, Ellipsis,
  Fuel, Gauge, LayoutDashboard, Menu, Plus, Search, Settings2, ShieldCheck,
  SlidersHorizontal, Sparkles, Truck, Wrench, X, Pencil, Trash2, RefreshCw,
  Users, BriefcaseBusiness, Boxes, HandCoins,
} from 'lucide-react'

type Status = VehicleStatus
type Veiculo = Vehicle
type Draft = { marca: string; modelo: string; ano: string; placa: string; status: Status; cor: string; combustivel: string; categoria: string; imagemUrl: string; problemaAtual: string; proprietarioId: string; recargaExterna: boolean; autonomiaEletricaKm: string; fonteImagem: string }
const emptyDraft: Draft = { marca: '', modelo: '', ano: String(new Date().getFullYear()), placa: '', status: 'ATIVO', cor: 'Branco', combustivel: 'FLEX', categoria: 'HATCH', imagemUrl: '', problemaAtual: '', proprietarioId: '', recargaExterna: false, autonomiaEletricaKm: '', fonteImagem: '' }
const statusLabel: Record<Status, string> = { ATIVO: 'Em operação', MANUTENCAO: 'Em manutenção', INATIVO: 'Inativo' }
const initials = (v: Veiculo) => `${v.marca.slice(0, 1)}${v.modelo.slice(0, 1)}`.toUpperCase()

function App() {
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
  const [activeNav, setActiveNav] = useState('Visão geral')

  const load = () => dispatch(fetchFleet())
  useEffect(() => { void dispatch(fetchFleet()) }, [dispatch])
  useEffect(() => { void dispatch(fetchResource('proprietarios')) }, [dispatch])
  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timeout)
  }, [toast])

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

  const navItems = [
    { label: 'Visão geral', icon: LayoutDashboard }, { label: 'Veículos', icon: Truck },
    { label: 'Funcionários', icon: Users }, { label: 'RH', icon: BriefcaseBusiness },
    { label: 'Proprietários', icon: Users }, { label: 'Peças', icon: Boxes },
    { label: 'Manutenção', icon: Wrench }, { label: 'Vendas', icon: HandCoins },
    { label: 'Relatórios', icon: ClipboardList },
  ]

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="brand-row"><div className="brand-symbol"><Truck size={23} strokeWidth={2.3} /></div><div className="brand-name">frota<span>flow</span><small>FLEET INTELLIGENCE</small></div><button className="mobile-close icon-button" onClick={() => setMobileMenu(false)} aria-label="Fechar menu"><X size={18} /></button></div>
      <div className="workspace"><div className="workspace-icon"><Command size={17} /></div><div><span>Workspace</span><strong>Operação principal</strong></div><ChevronDown size={15} className="muted-icon" /></div>
      <div className="nav-caption">PLATAFORMA</div>
      <nav className="nav-list">{navItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-link ${activeNav === label ? 'active' : ''}`} onClick={() => { setActiveNav(label); setMobileMenu(false); if (label === 'Veículos') window.setTimeout(() => document.getElementById('vehicle-section')?.scrollIntoView({ behavior: 'smooth' }), 0) }}><Icon size={18} /><span>{label}</span>{label === 'Veículos' && <span className="nav-pill">{dashboard.total}</span>}{label === 'Manutenção' && dashboard.manutencao > 0 && <span className="nav-pill warning-pill">{dashboard.manutencao}</span>}</button>)}</nav>
      <div className="nav-caption tools-caption">PREFERÊNCIAS</div>
      <button className="nav-link" onClick={() => setToast('Configurações disponíveis em uma próxima versão.')}><Settings2 size={18} /><span>Configurações</span></button>
      <div className="sidebar-spacer" />
      <div className="upgrade-card"><div className="upgrade-glow"><Sparkles size={17} /></div><strong>Sua frota, em outro nível.</strong><p>Dados claros. Decisões melhores. Operação eficiente.</p><div className="upgrade-meter"><span /></div><small><span>FrotaFlow</span><span>PRO CONCEPT</span></small></div>
      <div className="profile-row"><div className="profile-avatar">AA</div><div className="profile-text"><strong>Administrador</strong><span>Gestor da frota</span></div><button className="icon-button profile-more" aria-label="Opções do perfil" onClick={() => setToast('Perfil do administrador')}><Ellipsis size={19} /></button></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><button className="mobile-menu icon-button" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu size={20} /></button><span>Workspace</span><ChevronRight size={14} /><strong>{activeNav}</strong></div><div className="topbar-actions"><div className="system-status"><span className={`status-dot ${apiError ? 'offline' : ''}`} />{apiError ? 'API desconectada' : 'Sistema operacional'}</div><button className="icon-button notification-button" onClick={() => setToast('Você está em dia. Nenhuma nova notificação.')} aria-label="Notificações"><Bell size={18} /><i /></button><div className="topbar-divider" /><div className="top-avatar">AA</div></div></header>

      <div className="page-content">
        {['Visão geral', 'Veículos'].includes(activeNav) ? <>
        <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> TERÇA-FEIRA, 20 DE OUTUBRO <span className="live-chip"><span /> LIVE OVERVIEW</span></div><h1>Visão geral<span className="heading-period">.</span></h1><p className="page-subtitle">Sua operação em movimento. Tudo sob controle, em um só lugar.</p></div><div className="welcome-actions"><button className="button button-secondary" onClick={exportCsv}><Download size={16} /> Exportar relatório</button><button className="button button-primary" onClick={openCreate}><Plus size={18} strokeWidth={2.5} /> Novo veículo</button></div></section>

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
            {!loading && filteredVehicles.map((vehicle, index) => <tr key={vehicle.id} style={{ animationDelay: `${index * 35}ms` }}><td><input type="checkbox" aria-label={`Selecionar ${vehicle.modelo}`} /></td><td><div className="vehicle-cell"><div className={`vehicle-avatar vehicle-photo avatar-${vehicle.status.toLowerCase()}`}>{vehicle.imagemUrl ? <img src={vehicle.imagemUrl} alt={`${vehicle.marca} ${vehicle.modelo}`} loading="lazy" onError={event => { event.currentTarget.style.display = 'none' }} /> : initials(vehicle)}</div><div><strong>{vehicle.marca} {vehicle.modelo}</strong><span>{vehicle.cor ?? 'Cor não informada'} · {vehicle.ano} · {vehicle.categoria ?? 'Veículo'}</span>{vehicle.problemaAtual && <small className="vehicle-problem">{vehicle.problemaAtual}</small>}</div></div></td><td><span className="plate-tag">{vehicle.placa}</span></td><td>{vehicle.proprietario?.nome ?? '—'}</td><td><span className="fuel-badge">{vehicle.combustivel === 'ELETRICO' ? '100% elétrico' : vehicle.combustivel?.replace(/_/g, ' ') ?? 'Não informado'}{vehicle.recargaExterna && ' · recarga externa'}{vehicle.autonomiaEletricaKm ? ` · ${vehicle.autonomiaEletricaKm} km` : ''}</span></td><td><span className={`status-badge status-${vehicle.status.toLowerCase()}`}><i />{statusLabel[vehicle.status]}</span></td><td><div className="row-actions"><button className="icon-button" aria-label={`Editar ${vehicle.modelo}`} onClick={() => openEdit(vehicle)}><Pencil size={15} /></button><button className="icon-button danger-action" aria-label={`Excluir ${vehicle.modelo}`} onClick={() => void deleteVehicle(vehicle)}><Trash2 size={15} /></button></div></td></tr>)}
            {!loading && filteredVehicles.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div className="empty-illustration"><Truck size={29} /></div><strong>{vehicles.length ? 'Nenhum veículo encontrado' : 'Sua frota começa aqui'}</strong><p>{vehicles.length ? 'Tente mudar a busca ou os filtros selecionados.' : 'Cadastre seu primeiro veículo para visualizar os dados da operação.'}</p><button className="button button-primary button-small" onClick={vehicles.length ? () => { setSearch(''); setFilter('TODOS') } : openCreate}>{vehicles.length ? 'Limpar filtros' : <><Plus size={15} /> Cadastrar primeiro veículo</>}</button></div></td></tr>}
          </tbody></table></div>
          <div className="table-footer"><span>Exibindo <strong>{filteredVehicles.length}</strong> de <strong>{vehicles.length}</strong> veículos</span><div className="pagination"><button className="icon-button" disabled aria-label="Página anterior"><ChevronLeft size={16} /></button><button className="page-number active-page">1</button><button className="icon-button" disabled aria-label="Próxima página"><ChevronRight size={16} /></button></div><span className="updated-label"><span /> Dados sincronizados</span></div>
        </section>
        <footer className="footer"><span>© 2026 FrotaFlow <span className="footer-dot">·</span> Fleet intelligence platform</span><span><ShieldCheck size={13} /> Operação protegida <span className="footer-dot">·</span> Feito para mover o futuro.</span></footer>
        </> : <ManagementWorkspace page={activeNav} onToast={setToast} />}
      </div>
    </main>

    {mobileMenu && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}
    {modalOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false) }}><section className="vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><div className="modal-heading-icon"><Truck size={20} /></div><div><span>GESTÃO DA FROTA</span><h2 id="modal-title">{editing ? 'Editar veículo' : 'Novo veículo'}</h2><p>{editing ? 'Atualize as informações deste ativo.' : 'Adicione um veículo ao seu inventário.'}</p></div><button className="icon-button" onClick={() => setModalOpen(false)} aria-label="Fechar modal"><X size={19} /></button></div><form onSubmit={saveVehicle}><div className="form-grid"><label className="form-field"><span>Marca</span><input required maxLength={80} value={draft.marca} onChange={e => setDraft({ ...draft, marca: e.target.value })} placeholder="Ex.: Toyota" autoFocus /></label><label className="form-field"><span>Modelo / versão</span><input required maxLength={100} value={draft.modelo} onChange={e => setDraft({ ...draft, modelo: e.target.value })} placeholder="Ex.: Corolla Cross Hybrid" /></label><label className="form-field"><span>Ano do veículo</span><input required type="number" min="1950" max="2100" value={draft.ano} onChange={e => setDraft({ ...draft, ano: e.target.value })} /></label><label className="form-field"><span>Placa Mercosul</span><input required maxLength={7} minLength={7} pattern="[A-Za-z]{3}[0-9][A-Za-z0-9][0-9]{2}" value={draft.placa} onChange={e => setDraft({ ...draft, placa: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })} placeholder="ABC1D23" /></label><label className="form-field"><span>Cor</span><input maxLength={40} value={draft.cor} onChange={e => setDraft({ ...draft, cor: e.target.value })} placeholder="Prata" /></label><label className="form-field"><span>Categoria</span><select value={draft.categoria} onChange={e => setDraft({ ...draft, categoria: e.target.value })}><option value="HATCH">Hatch</option><option value="SEDAN">Sedan</option><option value="SUV">SUV</option><option value="PICAPE">Picape / caminhoneta</option><option value="VAN">Van</option><option value="CAMINHAO">Caminhão</option><option value="ONIBUS">Ônibus</option><option value="MOTO">Moto</option><option value="OUTRO">Outro</option></select></label><label className="form-field"><span>Motorização / combustível</span><select value={draft.combustivel} onChange={e => setDraft({ ...draft, combustivel: e.target.value, recargaExterna: ['ELETRICO','HIBRIDO_PLUGIN'].includes(e.target.value) })}><option value="FLEX">Flex (gasolina / etanol)</option><option value="FLEX_ETANOL">Flex / etanol</option><option value="GASOLINA">Gasolina</option><option value="DIESEL">Diesel</option><option value="ELETRICO">100% elétrico</option><option value="HIBRIDO_FLEX">Híbrido flex autorrecarregável</option><option value="HIBRIDO_LEVE">Híbrido leve (MHEV)</option><option value="HIBRIDO_PLUGIN">Híbrido plug-in (PHEV)</option></select></label><label className="form-field"><span>Proprietário</span><select value={draft.proprietarioId} onChange={e => setDraft({ ...draft, proprietarioId: e.target.value })}><option value="">Sem proprietário vinculado</option>{owners.map(owner => <option key={String(owner.id)} value={String(owner.id)}>{String(owner.nome)}</option>)}</select></label><label className="form-field full-field"><span>URL da foto real do veículo</span><input type="url" maxLength={500} value={draft.imagemUrl} onChange={e => setDraft({ ...draft, imagemUrl: e.target.value })} placeholder="Cole a URL da imagem oficial ou do veículo" /></label><label className="form-field full-field"><span>Fonte / crédito da imagem</span><input maxLength={180} value={draft.fonteImagem} onChange={e => setDraft({ ...draft, fonteImagem: e.target.value })} placeholder="Ex.: Chevrolet Brasil ou Wikimedia Commons" /></label><label className="form-field full-field"><span>Problema / observação da oficina</span><textarea rows={2} maxLength={500} value={draft.problemaAtual} onChange={e => setDraft({ ...draft, problemaAtual: e.target.value })} placeholder="Ex.: Onix batido; capô amassado e farol esquerdo quebrado." /></label><label className="form-field"><span>Autonomia elétrica (km)</span><input type="number" min="0" value={draft.autonomiaEletricaKm} onChange={e => setDraft({ ...draft, autonomiaEletricaKm: e.target.value })} placeholder="Opcional" /></label><label className="form-field"><span>Carrega na tomada?</span><select value={String(draft.recargaExterna)} onChange={e => setDraft({ ...draft, recargaExterna: e.target.value === 'true' })}><option value="false">Não — bateria autorrecarregável</option><option value="true">Sim — plug-in / carregamento externo</option></select></label><label className="form-field full-field"><span>Status operacional</span><select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as Status })}><option value="ATIVO">Em operação</option><option value="MANUTENCAO">Em manutenção</option><option value="INATIVO">Inativo</option></select></label></div><div className="modal-tip"><Fuel size={16} /><span>Informações, vínculo do proprietário e imagens são armazenados no PostgreSQL.</span></div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setModalOpen(false)}>Cancelar</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? <><RefreshCw size={15} className="spin" /> Salvando...</> : <><Check size={16} /> {editing ? 'Salvar alterações' : 'Cadastrar veículo'}</>}</button></div></form></section></div>}
    {toast && <div className="toast-message"><div className="toast-check"><Check size={15} /></div><span>{toast}</span><button className="icon-button" onClick={() => setToast('')} aria-label="Fechar mensagem"><X size={15} /></button></div>}
    <button className="help-floating" onClick={() => setToast('FrotaFlow · Central de ajuda')} aria-label="Ajuda"><CircleHelp size={18} /></button>
  </div>
}

export default App
