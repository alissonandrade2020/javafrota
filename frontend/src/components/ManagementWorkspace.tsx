import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownToLine, Boxes, BriefcaseBusiness, CalendarDays, Check, CircleAlert, Download, Pencil, Plus, RefreshCw, Search, Trash2, Users, Wrench, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { deleteResource, fetchReports, fetchResource, saveResource } from '../features/management/managementSlice'
import type { ManagementRecord, ResourceKey } from '../features/management/managementTypes'
import type { Vehicle } from '../features/fleet/fleetTypes'

type FieldKind = 'text' | 'email' | 'tel' | 'date' | 'number' | 'money' | 'select' | 'textarea'
type Field = { key: string; label: string; kind?: FieldKind; required?: boolean; options?: string[]; wide?: boolean; min?: number }
type ModuleDefinition = { resource: ResourceKey; title: string; eyebrow: string; description: string; singular: string; icon: typeof Users; fields: Field[]; columns: string[] }

const definitions: Record<ResourceKey, ModuleDefinition> = {
  funcionarios: { resource: 'funcionarios', title: 'Equipe & RH', eyebrow: 'PESSOAS E ACESSOS', description: 'Organize colaboradores, setores, admissões e perfis de acesso.', singular: 'funcionário', icon: Users, fields: [
    { key: 'nome', label: 'Nome completo', required: true }, { key: 'email', label: 'E-mail corporativo', kind: 'email', required: true }, { key: 'telefone', label: 'Telefone', kind: 'tel' }, { key: 'cargo', label: 'Cargo', required: true }, { key: 'setor', label: 'Setor', required: true, options: ['Gestão', 'Recursos Humanos', 'Comercial', 'Oficina', 'Operações'] }, { key: 'perfil', label: 'Perfil de acesso', kind: 'select', required: true, options: ['ADMINISTRADOR', 'RH', 'VENDEDOR', 'MECANICO', 'OPERACAO'] }, { key: 'status', label: 'Situação', kind: 'select', required: true, options: ['ATIVO', 'AFASTADO', 'INATIVO'] }, { key: 'dataAdmissao', label: 'Data de admissão', kind: 'date' },
  ], columns: ['nome', 'cargo', 'setor', 'perfil', 'status', 'email'] },
  proprietarios: { resource: 'proprietarios', title: 'Proprietários', eyebrow: 'RELACIONAMENTO', description: 'Cadastre pessoas e empresas responsáveis pelos veículos.', singular: 'proprietário', icon: BriefcaseBusiness, fields: [
    { key: 'nome', label: 'Nome / razão social', required: true }, { key: 'documento', label: 'CPF ou CNPJ', required: true }, { key: 'telefone', label: 'Telefone', kind: 'tel' }, { key: 'email', label: 'E-mail', kind: 'email' }, { key: 'cidade', label: 'Cidade' },
  ], columns: ['nome', 'documento', 'telefone', 'email', 'cidade'] },
  pecas: { resource: 'pecas', title: 'Peças & Estoque', eyebrow: 'ALMOXARIFADO', description: 'Controle saldo, custo unitário e níveis mínimos de reposição.', singular: 'peça', icon: Boxes, fields: [
    { key: 'sku', label: 'Código SKU', required: true }, { key: 'nome', label: 'Peça / produto', required: true }, { key: 'categoria', label: 'Categoria', required: true, options: ['Filtros', 'Freios', 'Elétrica', 'Lubrificantes', 'Suspensão', 'Carroceria', 'Pneus', 'Outro'] }, { key: 'quantidade', label: 'Quantidade atual', kind: 'number', min: 0, required: true }, { key: 'estoqueMinimo', label: 'Estoque mínimo', kind: 'number', min: 0, required: true }, { key: 'custoUnitario', label: 'Custo unitário (R$)', kind: 'money', min: 0, required: true }, { key: 'fornecedor', label: 'Fornecedor' },
  ], columns: ['sku', 'nome', 'categoria', 'quantidade', 'estoqueMinimo', 'custoUnitario', 'fornecedor'] },
  manutencoes: { resource: 'manutencoes', title: 'Oficina & Manutenção', eyebrow: 'ORDENS DE SERVIÇO', description: 'Registre sintomas, diagnóstico, prioridade, responsável e previsão.', singular: 'ordem de serviço', icon: Wrench, fields: [
    { key: 'veiculoId', label: 'Veículo', kind: 'select', required: true }, { key: 'problema', label: 'Problema relatado', kind: 'textarea', required: true, wide: true }, { key: 'diagnostico', label: 'Diagnóstico / serviço', kind: 'textarea', wide: true }, { key: 'prioridade', label: 'Prioridade', kind: 'select', required: true, options: ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'] }, { key: 'status', label: 'Status da ordem', kind: 'select', required: true, options: ['ABERTA', 'DIAGNOSTICO', 'AGUARDANDO_PECA', 'EM_EXECUCAO', 'CONCLUIDA', 'CANCELADA'] }, { key: 'responsavel', label: 'Mecânico responsável' }, { key: 'maoDeObra', label: 'Mão de obra (R$)', kind: 'money', min: 0, required: true }, { key: 'abertura', label: 'Data de abertura', kind: 'date' }, { key: 'previsaoConclusao', label: 'Previsão de conclusão', kind: 'date' },
  ], columns: ['placa', 'veiculo', 'problema', 'prioridade', 'status', 'responsavel', 'totalPagar'] },
  vendas: { resource: 'vendas', title: 'Vendas & Pipeline', eyebrow: 'COMERCIAL', description: 'Acompanhe oportunidades, negociações e vendas fechadas.', singular: 'oportunidade', icon: Activity, fields: [
    { key: 'cliente', label: 'Cliente', required: true }, { key: 'veiculo', label: 'Veículo', required: true }, { key: 'placa', label: 'Placa', required: true }, { key: 'vendedor', label: 'Vendedor responsável', required: true }, { key: 'status', label: 'Etapa do funil', kind: 'select', required: true, options: ['LEAD', 'NEGOCIACAO', 'FECHADA', 'PERDIDA'] }, { key: 'valor', label: 'Valor previsto (R$)', kind: 'money', min: 0, required: true }, { key: 'data', label: 'Data da oportunidade', kind: 'date' }, { key: 'observacoes', label: 'Notas comerciais', kind: 'textarea', wide: true },
  ], columns: ['cliente', 'veiculo', 'placa', 'vendedor', 'status', 'valor', 'data'] },
}

const roleLabel: Record<string, string> = { ADMINISTRADOR: 'Administrador', RH: 'Recursos humanos', VENDEDOR: 'Vendedor', MECANICO: 'Mecânico', OPERACAO: 'Operações' }
const fuelLabel: Record<string, string> = { FLEX: 'Flex', GASOLINA: 'Gasolina', DIESEL: 'Diesel', ELETRICO: '100% elétrico', HIBRIDO_FLEX: 'Híbrido flex', HIBRIDO_PLUGIN: 'Híbrido plug-in', HIBRIDO_LEVE: 'Híbrido leve', FLEX_ETANOL: 'Flex / etanol' }
const humanize = (value: unknown) => typeof value === 'string' ? (roleLabel[value] ?? fuelLabel[value] ?? value.replace(/_/g, ' ').toLowerCase().replace(/\b\p{L}/gu, char => char.toUpperCase())) : value == null ? '—' : String(value)
const money = (value: unknown) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0))

type WorkspaceProps = { page: string; onToast: (message: string) => void }
export function ManagementWorkspace({ page, onToast }: WorkspaceProps) {
  if (page === 'Relatórios') return <ReportsWorkspace onToast={onToast} />
  const key: ResourceKey = page === 'Proprietários' ? 'proprietarios' : page === 'Peças' ? 'pecas' : page === 'Manutenção' ? 'manutencoes' : page === 'Vendas' ? 'vendas' : 'funcionarios'
  return <ResourceWorkspace definition={definitions[key]} onToast={onToast} />
}

function ResourceWorkspace({ definition, onToast }: { definition: ModuleDefinition; onToast: (message: string) => void }) {
  const dispatch = useAppDispatch()
  const rows = useAppSelector(state => state.management.records[definition.resource] ?? [])
  const vehicles = useAppSelector(state => state.fleet.vehicles)
  const parts = useAppSelector(state => state.management.records.pecas ?? [])
  const loading = useAppSelector(state => state.management.loading)
  const error = useAppSelector(state => state.management.error)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<ManagementRecord | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [modal, setModal] = useState(false)
  const [itemRows, setItemRows] = useState<Array<{ pecaId: string; quantidade: string }>>([{ pecaId: '', quantidade: '1' }])
  const Icon = definition.icon

  useEffect(() => { void dispatch(fetchResource(definition.resource)); if (definition.resource === 'manutencoes') void dispatch(fetchResource('pecas')) }, [dispatch, definition.resource])

  const visible = useMemo(() => rows.filter(row => Object.values(row).some(value => String(value ?? '').toLowerCase().includes(query.toLowerCase()))), [rows, query])
  const openForm = (record?: ManagementRecord) => {
    setEditing(record ?? null)
    const values: Record<string, string> = {}
    definition.fields.forEach(field => { values[field.key] = String(record?.[field.key] ?? '') })
    const oldItems = Array.isArray(record?.itens) ? record.itens as Array<{ peca?: { id?: number }; quantidade?: number }> : []
    setItemRows(oldItems.length ? oldItems.map(item => ({ pecaId: String(item.peca?.id ?? ''), quantidade: String(item.quantidade ?? 1) })) : [{ pecaId: '', quantidade: '1' }])
    setForm(values); setModal(true)
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload: Record<string, unknown> = {}
    definition.fields.forEach(field => { const value = form[field.key]; payload[field.key] = field.kind === 'number' || field.kind === 'money' ? Number(value || 0) : value || null })
    if (definition.resource === 'manutencoes') payload.itens = itemRows.filter(item => item.pecaId).map(item => ({ pecaId: Number(item.pecaId), quantidade: Number(item.quantidade) }))
    try { await dispatch(saveResource({ resource: definition.resource, id: editing?.id, record: payload })).unwrap(); setModal(false); onToast(`${definition.singular} salvo com sucesso.`) }
    catch (reason) { onToast(String(reason)) }
  }
  const remove = async (record: ManagementRecord) => {
    if (!window.confirm(`Excluir este registro de ${definition.singular}?`)) return
    try { await dispatch(deleteResource({ resource: definition.resource, id: record.id })).unwrap(); onToast('Registro removido.') }
    catch (reason) { onToast(String(reason)) }
  }
  const countLabel = definition.resource === 'manutencoes' ? `${rows.filter(row => row.status !== 'CONCLUIDA' && row.status !== 'CANCELADA').length} em aberto` : `${rows.length} cadastrados`

  return <section className="workspace-page">
    <header className="workspace-page-heading"><div><div className="workspace-eyebrow"><span /> {definition.eyebrow}</div><h1>{definition.title}<span>.</span></h1><p>{definition.description}</p></div><button className="button button-primary" onClick={() => openForm()}><Plus size={16} /> Novo {definition.singular}</button></header>
    <div className="workspace-stat-row"><article className="workspace-stat"><span className="workspace-stat-icon"><Icon size={17} /></span><div><small>REGISTROS</small><strong>{rows.length.toString().padStart(2,'0')}</strong></div><span className="workspace-stat-note">{countLabel}</span></article>{definition.resource === 'pecas' && <article className="workspace-stat alert-stat"><span className="workspace-stat-icon"><CircleAlert size={17} /></span><div><small>REPOSIÇÃO</small><strong>{rows.filter(row => Number(row.quantidade) <= Number(row.estoqueMinimo)).length.toString().padStart(2,'0')}</strong></div><span className="workspace-stat-note">abaixo do mínimo</span></article>}{definition.resource === 'funcionarios' && <article className="workspace-stat"><span className="workspace-stat-icon"><BriefcaseBusiness size={17} /></span><div><small>ATIVOS</small><strong>{rows.filter(row => row.status === 'ATIVO').length.toString().padStart(2,'0')}</strong></div><span className="workspace-stat-note">na equipe</span></article>}{definition.resource === 'manutencoes' && <article className="workspace-stat alert-stat"><span className="workspace-stat-icon"><Wrench size={17} /></span><div><small>CRÍTICAS</small><strong>{rows.filter(row => row.prioridade === 'CRITICA' && row.status !== 'CONCLUIDA').length.toString().padStart(2,'0')}</strong></div><span className="workspace-stat-note">precisam de ação</span></article>}</div>
    <div className="resource-table-card"><div className="resource-toolbar"><div><h2>Registros</h2><p>Dados operacionais atualizados com a API.</p></div><label className="resource-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar registros..." /></label></div>
      {error && <div className="workspace-error"><CircleAlert size={16} />{error}<button onClick={() => void dispatch(fetchResource(definition.resource))}>Tentar novamente</button></div>}
      <div className="resource-table-wrap"><table className="resource-table"><thead><tr>{definition.columns.map(key => <th key={key}>{fieldLabel(definition, key)}</th>)}<th>AÇÕES</th></tr></thead><tbody>
        {loading && rows.length === 0 && <tr><td colSpan={definition.columns.length + 1} className="resource-empty"><RefreshCw size={17} className="spin" /> Carregando dados...</td></tr>}
        {!loading && visible.map(row => <tr key={row.id}>{definition.columns.map(key => <td key={key}>{key === 'custoUnitario' || key === 'valor' || key === 'custo' || key === 'totalPagar' ? money(row[key]) : key === 'status' || key === 'perfil' || key === 'prioridade' ? <span className={`resource-badge badge-${String(row[key]).toLowerCase()}`}>{humanize(row[key])}</span> : key === 'quantidade' && Number(row[key]) <= Number(row.estoqueMinimo) ? <span className="stock-low">{humanize(row[key])} <small>repor</small></span> : key === 'problema' ? <span className="problem-cell" title={String(row[key])}>{humanize(row[key])}</span> : humanize(row[key])}</td>)}<td><div className="resource-actions"><button aria-label="Editar" onClick={() => openForm(row)}><Pencil size={14} /></button><button aria-label="Excluir" onClick={() => void remove(row)}><Trash2 size={14} /></button></div></td></tr>)}
        {!loading && visible.length === 0 && <tr><td colSpan={definition.columns.length + 1} className="resource-empty"><Icon size={22} /><strong>{rows.length ? 'Nenhum resultado' : `Nenhum ${definition.singular} cadastrado`}</strong><span>{rows.length ? 'Tente outra busca.' : 'Adicione o primeiro registro para começar.'}</span></td></tr>}
      </tbody></table></div><div className="resource-table-footer">Exibindo <strong>{visible.length}</strong> de <strong>{rows.length}</strong> registros</div>
    </div>
    {modal && <div className="business-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModal(false) }}><form className="business-modal" onSubmit={submit}><div className="business-modal-header"><div className="workspace-stat-icon"><Icon size={18} /></div><div><span>{definition.eyebrow}</span><h2>{editing ? `Editar ${definition.singular}` : `Novo ${definition.singular}`}</h2></div><button type="button" className="resource-close" onClick={() => setModal(false)} aria-label="Fechar"><X size={18} /></button></div><div className="business-form-grid">{definition.fields.map(field => <label key={field.key} className={field.wide ? 'business-field full-span' : 'business-field'}><span>{field.label}</span>{field.kind === 'textarea' ? <textarea required={field.required} value={form[field.key] ?? ''} onChange={event => setForm({ ...form, [field.key]: event.target.value })} rows={3} /> : <FieldInput field={field} value={form[field.key] ?? ''} vehicles={vehicles} onChange={value => setForm({ ...form, [field.key]: value })} />}</label>)}{definition.resource === 'manutencoes' && <div className="service-parts-field"><div><strong>Peças utilizadas</strong><span>O estoque baixa ao salvar; a cobrança soma peças e mão de obra.</span></div>{itemRows.map((item,index)=><div className="service-part-row" key={index}><select value={item.pecaId} onChange={event=>setItemRows(itemRows.map((row,i)=>i===index?{...row,pecaId:event.target.value}:row))}><option value="">Selecione uma peça...</option>{parts.map(part=><option key={String(part.id)} value={String(part.id)}>{String(part.sku)} · {String(part.nome)} · saldo {String(part.quantidade)} · {money(part.custoUnitario)}</option>)}</select><input aria-label="Quantidade" type="number" min="1" value={item.quantidade} onChange={event=>setItemRows(itemRows.map((row,i)=>i===index?{...row,quantidade:event.target.value}:row))}/><button type="button" onClick={()=>setItemRows(itemRows.filter((_,i)=>i!==index))} aria-label="Remover peça"><X size={14}/></button></div>)}<button className="add-part-button" type="button" onClick={()=>setItemRows([...itemRows,{pecaId:'',quantidade:'1'}])}><Plus size={13}/> Adicionar outra peça</button><div className="service-estimate"><span>Estimativa desta ordem</span><strong>{money(Number(form.maoDeObra||0)+itemRows.reduce((sum,item)=>sum+(Number(parts.find(part=>String(part.id)===item.pecaId)?.custoUnitario||0)*Number(item.quantidade||0)),0))}</strong></div></div>}</div><div className="business-modal-actions"><button type="button" className="button button-secondary" onClick={() => setModal(false)}>Cancelar</button><button className="button button-primary" disabled={loading}>{loading ? <><RefreshCw size={14} className="spin" /> Salvando</> : <><Check size={15} /> Salvar registro</>}</button></div></form></div>}
  </section>
}

function FieldInput({ field, value, vehicles, onChange }: { field: Field; value: string; vehicles: Vehicle[]; onChange: (value: string) => void }) {
  if (field.kind === 'select') {
    const options = field.key === 'veiculoId' ? vehicles.map(vehicle => ({ value: String(vehicle.id), label: `${vehicle.placa} · ${vehicle.marca} ${vehicle.modelo}` })) : (field.options ?? []).map(option => ({ value: option, label: humanize(option) }))
    return <select required={field.required} value={value} onChange={event => onChange(event.target.value)}><option value="">Selecione...</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
  }
  return <input required={field.required} type={field.kind === 'money' ? 'number' : field.kind ?? 'text'} step={field.kind === 'money' ? '0.01' : undefined} min={field.min} value={value} onChange={event => onChange(event.target.value)} placeholder={field.kind === 'money' ? '0,00' : undefined} />
}

function ReportsWorkspace({ onToast }: { onToast: (message: string) => void }) {
  const dispatch = useAppDispatch()
  const report = useAppSelector(state => state.management.reports)
  const loading = useAppSelector(state => state.management.loading)
  const error = useAppSelector(state => state.management.error)
  const today = new Date().toISOString().slice(0, 10)
  const [from, setFrom] = useState(`${today.slice(0, 7)}-01`)
  const [to, setTo] = useState(today)
  useEffect(() => { void dispatch(fetchReports({ from, to })) }, [dispatch])
  const refresh = () => { if (from && to && from > to) { onToast('A data inicial deve ser anterior à data final.'); return }; void dispatch(fetchReports({ from, to })) }
  const exportReport = () => {
    if (!report) return
    const rows = [['Métrica','Valor'],['Período',`${report.periodo.de} até ${report.periodo.ate}`],['Veículos',report.totalVeiculos],['Proprietários',report.totalProprietarios],['Funcionários ativos',report.funcionariosAtivos],['Peças abaixo do mínimo',report.estoqueBaixo],['Ordens abertas',report.ordensAbertas],['Vendas no período',report.vendasNoPeriodo],['Vendas fechadas',report.vendasFechadas],['Receita de vendas fechadas',report.receitaNoPeriodo],...Object.entries(report.veiculosPorCombustivel).map(([key,value])=>[`Veículos · ${humanize(key)}`,value]),...Object.entries(report.vendasPorStatus).map(([key,value])=>[`Vendas · ${humanize(key)}`,value])]
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g,'""')}"`).join(';')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'})); const link=document.createElement('a'); link.href=url; link.download=`relatorio-frota-${from}-${to}.csv`; link.click(); URL.revokeObjectURL(url); onToast('Relatório CSV exportado.')
  }
  return <section className="workspace-page"><header className="workspace-page-heading"><div><div className="workspace-eyebrow"><span /> INTELIGÊNCIA GERENCIAL</div><h1>Relatórios<span>.</span></h1><p>Frota, pessoas, oficina, estoque e vendas em um único período.</p></div><button className="button button-secondary" onClick={exportReport} disabled={!report}><Download size={15} /> Exportar CSV</button></header>
    <div className="report-filter-bar"><label><CalendarDays size={15} /><span>De</span><input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label><label><span>Até</span><input type="date" value={to} onChange={event => setTo(event.target.value)} /></label><button className="button button-primary" onClick={refresh}><Activity size={14} /> Atualizar relatório</button></div>
    {error && <div className="workspace-error"><CircleAlert size={16} />{error}<button onClick={refresh}>Tentar novamente</button></div>}
    {loading && !report ? <div className="report-loading"><RefreshCw size={20} className="spin" /> Consolidando indicadores...</div> : report && <><div className="report-kpi-grid"><ReportKpi label="FROTA TOTAL" value={report.totalVeiculos} note="veículos cadastrados" /><ReportKpi label="PESSOAS ATIVAS" value={report.funcionariosAtivos} note="colaboradores" /><ReportKpi label="ORDENS ABERTAS" value={report.ordensAbertas} note="na oficina" alert={report.ordensAbertas > 0} /><ReportKpi label="ESTOQUE CRÍTICO" value={report.estoqueBaixo} note="itens para repor" alert={report.estoqueBaixo > 0} /><ReportKpi label="VENDAS FECHADAS" value={report.vendasFechadas} note={`de ${report.vendasNoPeriodo} oportunidades`} /><ReportKpi label="RECEITA FECHADA" value={money(report.receitaNoPeriodo)} note={`de ${report.periodo.de} até ${report.periodo.ate}`} /></div><div className="report-panels"><ReportBreakdown title="Combustível da frota" data={report.veiculosPorCombustivel} /><ReportBreakdown title="Funil de vendas" data={report.vendasPorStatus} /><ReportBreakdown title="Status das ordens" data={report.ordensPorStatus} /></div><section className="resource-table-card report-sales"><div className="resource-toolbar"><div><h2>Vendas no período</h2><p>Oportunidades e resultados comerciais do intervalo selecionado.</p></div><ArrowDownToLine size={17} /></div><div className="resource-table-wrap"><table className="resource-table"><thead><tr><th>CLIENTE</th><th>VEÍCULO</th><th>VENDEDOR</th><th>STATUS</th><th>VALOR</th><th>DATA</th></tr></thead><tbody>{report.vendas.map(sale=><tr key={sale.id}><td>{humanize(sale.cliente)}</td><td>{humanize(sale.veiculo)}</td><td>{humanize(sale.vendedor)}</td><td><span className={`resource-badge badge-${String(sale.status).toLowerCase()}`}>{humanize(sale.status)}</span></td><td>{money(sale.valor)}</td><td>{humanize(sale.data)}</td></tr>)}{report.vendas.length===0&&<tr><td colSpan={6} className="resource-empty">Nenhuma venda neste período.</td></tr>}</tbody></table></div></section></>}
  </section>
}

function ReportKpi({ label, value, note, alert }: { label: string; value: string | number; note: string; alert?: boolean }) { return <article className={`report-kpi ${alert?'report-kpi-alert':''}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></article> }
function ReportBreakdown({ title, data }: { title: string; data: Record<string, number> }) { const max=Math.max(1,...Object.values(data)); return <article className="report-breakdown"><h3>{title}</h3>{Object.entries(data).length===0?<p className="report-no-data">Sem dados para exibir.</p>:Object.entries(data).map(([key,value])=><div className="breakdown-row" key={key}><span>{humanize(key)}</span><div><i style={{width:`${value/max*100}%`}} /></div><strong>{value}</strong></div>)}</article> }
function fieldLabel(definition: ModuleDefinition, key: string) { return key==='totalPagar'?'TOTAL A PAGAR':definition.fields.find(field=>field.key===key)?.label.toUpperCase() ?? key.toUpperCase() }
