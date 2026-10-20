import type { CSSProperties } from 'react'
import { Activity, ArrowUpRight, Boxes, Building2, Gauge, Wrench } from 'lucide-react'
import type { FleetDashboard } from '../features/fleet/fleetTypes'

type ManagementPanelProps = { dashboard: FleetDashboard }

export function ManagementPanel({ dashboard }: ManagementPanelProps) {
  const availability = dashboard.total ? Math.round(dashboard.ativos / dashboard.total * 100) : 0
  const maintenanceShare = dashboard.total ? Math.round(dashboard.manutencao / dashboard.total * 100) : 0
  const inactiveShare = dashboard.total ? Math.round(dashboard.inativos / dashboard.total * 100) : 0

  return <section className="management-panel" aria-label="Painel de gestão da frota">
    <div className="management-heading">
      <div><div className="management-kicker"><span /> INTELIGÊNCIA DE FROTA</div><h2>Painel de gestão</h2><p>Indicadores para decidir em cada nível da operação.</p></div>
      <div className="management-period"><Activity size={14} /> Visão consolidada</div>
    </div>
    <div className="management-grid">
      <article className="management-card executive-card">
        <div className="management-card-title"><div className="management-icon executive-icon"><Building2 size={17} /></div><div><span>DIRETORIA</span><strong>Disponibilidade da frota</strong></div></div>
        <div className="availability-content"><div className="availability-number">{availability}<small>%</small></div><div className="availability-copy"><strong>{dashboard.ativos} de {dashboard.total} ativos</strong><span>Ativos disponíveis para alocação.</span></div></div>
        <div className="availability-bar" aria-label={`Disponibilidade: ${availability} por cento`}><span className="available-segment" style={{ width: `${availability}%` }} /><i style={{ width: `${dashboard.total ? maintenanceShare : 0}%` }} /><b style={{ width: `${dashboard.total ? inactiveShare : 0}%` }} /></div>
        <div className="management-foot"><span><i className="legend-dot legend-green" /> Em operação</span><span><i className="legend-dot legend-amber" /> Manutenção</span><span><i className="legend-dot legend-rose" /> Indisponível</span></div>
      </article>
      <article className="management-card operations-card">
        <div className="management-card-title"><div className="management-icon operations-icon"><Wrench size={17} /></div><div><span>COORDENAÇÃO</span><strong>Foco de manutenção</strong></div></div>
        <div className="maintenance-content"><div><strong>{dashboard.manutencao.toString().padStart(2, '0')}</strong><span>veículos aguardam retorno</span></div><div className="maintenance-ring" style={{ '--ring-progress': `${maintenanceShare * 3.6}deg` } as CSSProperties}><span>{maintenanceShare}<small>%</small></span></div></div>
        <div className="management-callout"><Gauge size={14} /><span>{dashboard.manutencao ? 'Priorize a liberação dos ativos em manutenção.' : 'Nenhum ativo está em manutenção agora.'}</span></div>
      </article>
      <article className="management-card field-card">
        <div className="management-card-title"><div className="management-icon field-icon"><Boxes size={17} /></div><div><span>OPERAÇÃO</span><strong>Visão dos ativos</strong></div></div>
        <div className="fleet-visual" role="img" aria-label="Ilustração tridimensional de caminhões da frota"><div className="fleet-orbit orbit-a" /><div className="fleet-orbit orbit-b" /><div className="fleet-platform platform-back" /><div className="fleet-platform platform-front" /><div className="fleet-truck truck-back"><span /><i /><b /></div><div className="fleet-truck truck-front"><span /><i /><b /></div><div className="fleet-spark spark-a">✦</div><div className="fleet-spark spark-b">✦</div></div>
        <div className="field-summary"><span><strong>{dashboard.inativos}</strong> fora de operação</span><span className="field-share"><ArrowUpRight size={13} /> {inactiveShare}% da frota</span></div>
      </article>
    </div>
  </section>
}
