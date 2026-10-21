import { FormEvent, useEffect, useState } from 'react'
import { KeyRound, Pencil, Plus, RefreshCw, Shield, Trash2, UserCog, Users, X } from 'lucide-react'
import { apiRequest } from '../services/apiClient'

type Account = { id: number; nome: string; email: string; perfil: string; ativo: boolean }
type Draft = { nome: string; email: string; senha: string; perfil: string; ativo: boolean }
const empty: Draft = { nome: '', email: '', senha: '', perfil: 'VENDEDOR', ativo: true }
const labels: Record<string, string> = { ADMIN_MASTER: 'Administrador Master', GERENTE: 'Gerente', RH: 'Recursos Humanos', VENDEDOR: 'Vendedor', MECANICO: 'Mecânico', OPERACAO: 'Operações' }

export function UserAccountsWorkspace({ onToast }: { onToast: (message: string) => void }) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [draft, setDraft] = useState<Draft>(empty)
  const [editing, setEditing] = useState<Account | null>(null)
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true); setError('')
    try { setAccounts(await apiRequest<Account[]>('/api/auth/users')) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível carregar os usuários.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  function open(account?: Account) {
    setEditing(account ?? null)
    setDraft(account ? { nome: account.nome, email: account.email, senha: '', perfil: account.perfil, ativo: account.ativo } : empty)
    setModal(true)
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true)
    const payload: Record<string, unknown> = { nome: draft.nome, email: draft.email, perfil: draft.perfil, ativo: draft.ativo }
    if (draft.senha) payload.senha = draft.senha
    try {
      if (editing) await apiRequest(`/api/auth/users/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      else await apiRequest('/api/auth/users', { method: 'POST', body: JSON.stringify(payload) })
      setModal(false); onToast(editing ? 'Conta atualizada.' : 'Conta criada.'); await load()
    } catch (cause) { onToast(cause instanceof Error ? cause.message : 'Não foi possível salvar a conta.') }
    finally { setLoading(false) }
  }

  return <section className="workspace-page"><header className="workspace-page-heading"><div><div className="workspace-eyebrow"><span /> CONTROLE DE ACESSO</div><h1>Usuários<span>.</span></h1><p>Gerencie contas, perfis e permissões de entrada no FrotaFlow.</p></div><button className="button button-primary" onClick={() => open()}><Plus size={16} /> Nova conta</button></header>
    <div className="accounts-security-note"><Shield size={18} /><div><strong>Acesso protegido por perfil</strong><span>As permissões também são validadas pela API. Desativar uma conta impede novos acessos.</span></div><KeyRound size={17} /></div>
    {error && <div className="workspace-error">{error}<button onClick={() => void load()}>Tentar novamente</button></div>}
    <div className="resource-table-card accounts-card"><div className="resource-toolbar"><div><h2>Contas de acesso</h2><p>{accounts.length} usuário(s) cadastrado(s)</p></div><Users size={18} /></div><div className="resource-table-wrap"><table className="resource-table"><thead><tr><th>USUÁRIO</th><th>PERFIL</th><th>SITUAÇÃO</th><th>AÇÕES</th></tr></thead><tbody>{loading && accounts.length === 0 ? <tr><td colSpan={4} className="resource-empty"><RefreshCw className="spin" size={17} /> Carregando contas...</td></tr> : accounts.map(account => <tr key={account.id}><td><div className="account-person"><span><UserCog size={16} /></span><div><strong>{account.nome}</strong><small>{account.email}</small></div></div></td><td><span className="account-role">{labels[account.perfil] ?? account.perfil}</span></td><td><span className={`account-status ${account.ativo ? 'is-active' : ''}`}><i />{account.ativo ? 'Ativo' : 'Desativado'}</span></td><td><div className="resource-actions"><button aria-label={`Editar ${account.nome}`} onClick={() => open(account)}><Pencil size={14} /></button>{account.perfil !== 'ADMIN_MASTER' && <button aria-label={`Desativar ${account.nome}`} onClick={() => open({ ...account, ativo: !account.ativo })}><Trash2 size={14} /></button>}</div></td></tr>)}</tbody></table></div></div>
    {modal && <div className="business-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModal(false) }}><form className="business-modal account-modal" onSubmit={save}><div className="business-modal-header"><div className="workspace-stat-icon"><UserCog size={18} /></div><div><span>CONTROLE DE ACESSO</span><h2>{editing ? 'Editar conta' : 'Nova conta'}</h2></div><button type="button" className="resource-close" onClick={() => setModal(false)} aria-label="Fechar"><X size={18} /></button></div><div className="business-form-grid"><label className="business-field"><span>Nome completo</span><input required maxLength={120} value={draft.nome} onChange={event => setDraft({ ...draft, nome: event.target.value })} /></label><label className="business-field"><span>E-mail de acesso</span><input required type="email" maxLength={140} value={draft.email} onChange={event => setDraft({ ...draft, email: event.target.value })} /></label><label className="business-field"><span>{editing ? 'Nova senha (opcional)' : 'Senha inicial'}</span><input required={!editing} type="password" minLength={8} maxLength={72} value={draft.senha} onChange={event => setDraft({ ...draft, senha: event.target.value })} placeholder={editing ? 'Deixe vazio para manter a senha' : 'Pelo menos 8 caracteres'} /></label><label className="business-field"><span>Perfil</span><select value={draft.perfil} onChange={event => setDraft({ ...draft, perfil: event.target.value })}>{Object.entries(labels).filter(([key]) => key !== 'ADMIN_MASTER').map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>{editing && <label className="account-toggle"><input type="checkbox" checked={draft.ativo} onChange={event => setDraft({ ...draft, ativo: event.target.checked })} /> Conta ativa</label>}</div><div className="business-modal-actions"><button type="button" className="button button-secondary" onClick={() => setModal(false)}>Cancelar</button><button className="button button-primary" disabled={loading}>{loading ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar conta'}</button></div></form></div>}
  </section>
}
