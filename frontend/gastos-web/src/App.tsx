import { useEffect, useState } from 'react';
import * as apiService from './services/api';
import type { ResumoFinanceiro, ResumoPessoa, Transacao } from './services/api';

export default function App() {
  // Estados para armazenamento dos dados vindos da API
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  
  // Estados para os formulários de cadastro
  const [nomePessoa, setNomePessoa] = useState('');
  const [idadePessoa, setIdadePessoa] = useState<number | ''>('');
  const [apelidoPessoa, setApelidoPessoa] = useState('');
  const [observacaoPessoa, setObservacaoPessoa] = useState('');
  
  const [descricaoTransacao, setDescricaoTransacao] = useState('');
  const [valorTransacao, setValorTransacao] = useState<number | ''>('');
  const [tipoTransacao, setTipoTransacao] = useState<'Receita' | 'Despesa'>('Despesa');
  const [pessoaIdSelecionada, setPessoaIdSelecionada] = useState('');

  // Mensagens de validação de interface
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);
  const [sucessoFormulario, setSucessoFormulario] = useState<string | null>(null);

  const getMensagemErro = (err: any) => {
    if (typeof err?.response?.data === 'string') return err.response.data;
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.message) return err.message;
    return 'Não foi possível carregar os dados. Verifique se a API está rodando.';
  };

  // Carrega o resumo financeiro e o histórico de transações do backend ao montar o componente.
  // Isso mantém a interface sincronizada com os dados persistidos no SQLite do backend.
  const carregarDados = async () => {
    try {
      const dadosResumo = await apiService.totaisService.obterResumo();
      const dadosTransacoes = await apiService.transacoesService.listar();
      setResumo(dadosResumo);
      setTransacoes(dadosTransacoes);
      setErroFormulario(null);
    } catch (err) {
      console.error("Erro ao conectar com a API .NET:", err);
      setErroFormulario(getMensagemErro(err));
      setSucessoFormulario(null);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Cadastro de uma nova pessoa. Após criar, a lista é recarregada para refletir a persistência.
  const handleCriarPessoa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomePessoa || idadePessoa === '') return;

    try {
      await apiService.pessoasService.criar({ nome: nomePessoa, idade: Number(idadePessoa) });
      setErroFormulario(null);
      setSucessoFormulario('Pessoa cadastrada com sucesso!');
      setNomePessoa('');
      setIdadePessoa('');
      setApelidoPessoa('');
      setObservacaoPessoa('');
      await carregarDados();
    } catch (err: any) {
      setErroFormulario(getMensagemErro(err) || "Erro ao cadastrar pessoa.");
      setSucessoFormulario(null);
    }
  };

  // Cadastro de uma nova transação com validação das regras de negócio:
  // - a pessoa informada precisa existir;
  // - menores de 18 anos só podem registrar despesas.
  const handleCriarTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricaoTransacao || !valorTransacao || !pessoaIdSelecionada) return;

    // Encontra a pessoa correspondente para validar a regra de idade localmente
    const pessoa = resumo?.pessoas.find((p: ResumoPessoa) => p.id === pessoaIdSelecionada);
    
    // REGRA DE NEGÓCIO DO DESAFIO: Menores de 18 anos só podem registrar despesas
    if (pessoa && pessoa.idade < 18 && tipoTransacao === 'Receita') {
      setErroFormulario("Regra de Negócio: Menores de 18 anos só podem registrar transações do tipo Despesa.");
      return;
    }

    try {
      await apiService.transacoesService.criar({
        descricao: descricaoTransacao,
        valor: Number(valorTransacao),
        tipo: tipoTransacao,
        pessoaId: pessoaIdSelecionada
      });

      setErroFormulario(null);
      setSucessoFormulario('Transação cadastrada com sucesso!');
      setDescricaoTransacao('');
      setValorTransacao('');
      setPessoaIdSelecionada('');
      setTipoTransacao('Despesa');
      await carregarDados();
    } catch (err: any) {
      setErroFormulario(getMensagemErro(err) || "Erro ao lançar transação.");
      setSucessoFormulario(null);
    }
  };

  // Remoção de pessoa (com deleção em cascata automatizada no banco)
  const handleDeletarPessoa = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta pessoa? Todas as suas transações vinculadas serão apagadas.")) return;
    try {
      await apiService.pessoasService.deletar(id);
      carregarDados();
    } catch (err: any) {
      setErroFormulario(getMensagemErro(err) || "Erro ao deletar pessoa.");
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* Cabeçalho Corporativo */}
      <header style={{ borderBottom: '2px solid var(--color-primary-blue)', paddingBottom: '12px', marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--color-primary-blue)', fontSize: '1.8rem' }}>Controle de Gastos Residenciais</h1>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>Painel Integrado de Gestão e Custos</p>
      </header>

      {/* Alerta de Erros ou Validação das Regras */}
      {erroFormulario && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, minWidth: '320px', maxWidth: '420px', background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Aviso do Sistema</div>
            <div style={{ fontSize: '0.95rem' }}>{erroFormulario}</div>
          </div>
          <button onClick={() => setErroFormulario(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 'bold', fontSize: '1rem' }}>×</button>
        </div>
      )}

      {sucessoFormulario && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, minWidth: '320px', maxWidth: '420px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', color: '#166534', border: '1px solid #86efac', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Sucesso</div>
            <div style={{ fontSize: '0.95rem' }}>{sucessoFormulario}</div>
          </div>
          <button onClick={() => setSucessoFormulario(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontWeight: 'bold', fontSize: '1rem' }}>×</button>
        </div>
      )}

      {/* BLOCO 1: Indicadores Financeiros Consolidados (Totais) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', borderLeft: '6px solid var(--color-primary-blue)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase' }}>Saldo Líquido Geral</span>
          <h2 style={{ fontSize: '1.8rem', marginTop: '8px', color: (resumo?.saldoLiquidoGeral ?? 0) >= 0 ? 'var(--color-semantic-green)' : 'var(--color-semantic-red)' }}>
            R$ {resumo?.saldoLiquidoGeral?.toFixed(2) ?? '0.00'}
          </h2>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', borderLeft: '6px solid var(--color-semantic-green)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase' }}>Total Geral Receitas</span>
          <h2 style={{ fontSize: '1.8rem', marginTop: '8px', color: 'var(--color-semantic-green)' }}>
            R$ {resumo?.totalGeralReceitas?.toFixed(2) ?? '0.00'}
          </h2>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', borderLeft: '6px solid var(--color-semantic-red)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase' }}>Total Geral Despesas</span>
          <h2 style={{ fontSize: '1.8rem', marginTop: '8px', color: 'var(--color-semantic-red)' }}>
            R$ {resumo?.totalGeralDespesas?.toFixed(2) ?? '0.00'}
          </h2>
        </div>
      </section>

      {/* BLOCO 2: Formulários e Lançamentos Operacionais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Formulário: Cadastro de Pessoas */}
        {/* Adicionado display flex e altura total direcionada para evitar o espaço branco final */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--color-primary-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Cadastrar Componente Familiar</h3>
          <form onSubmit={handleCriarPessoa} style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1, marginTop: '6px' }}>
              <div style={{ marginTop: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Nome Completo</label>
                <input type="text" value={nomePessoa} onChange={e => setNomePessoa(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
              </div>
              
              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Idade</label>
                <input type="number" value={idadePessoa} onChange={e => setIdadePessoa(e.target.value !== '' ? Number(e.target.value) : '')} required min="0" style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
              </div>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Apelido (opcional)</label>
                  <input type="text" value={apelidoPessoa} onChange={e => setApelidoPessoa(e.target.value)} placeholder="Ex.: Bibi" style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Observação (opcional)</label>
                  <input type="text" value={observacaoPessoa} onChange={e => setObservacaoPessoa(e.target.value)} placeholder="Ex.: Estuda fora" style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
            
            <button type="submit" className="btn-primary" style={{ marginTop: '6px', width: '100%' }}>Salvar Registro</button>
          </form>
        </div>

        {/* Formulário: Lançamento de Movimentação Financeira */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--color-primary-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Lançar Movimentação Financeira</h3>
          <form onSubmit={handleCriarTransacao} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Responsável pelo Lançamento</label>
            <select value={pessoaIdSelecionada} onChange={e => setPessoaIdSelecionada(e.target.value)} required style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff' }}>
              <option value="">Selecione um membro...</option>
              {resumo?.pessoas.map((p: ResumoPessoa) => (
                <option key={p.id} value={p.id}>{p.nome} ({p.idade} anos)</option>
              ))}
            </select>

            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Descrição do Gasto/Ganho</label>
            <input type="text" value={descricaoTransacao} onChange={e => setDescricaoTransacao(e.target.value)} required style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />

            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Valor (R$)</label>
            <input type="number" step="0.01" value={valorTransacao} onChange={e => setValorTransacao(e.target.value !== '' ? Number(e.target.value) : '')} required style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />

            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Classificação da Transação</label>
            <select value={tipoTransacao} onChange={e => setTipoTransacao(e.target.value as 'Receita' | 'Despesa')} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff' }}>
              <option value="Despesa">Despesa (Débito)</option>
              <option value="Receita">Receita (Crédito)</option>
            </select>

            <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Confirmar Lançamento</button>
          </form>
        </div>
      </div>

      {/* BLOCO 3: Tabelas Operacionais e Resumos por Integrante */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Tabela de Membros Cadastrados e Totais Individuais */}
        <div>
          <h3 style={{ marginBottom: '12px', color: 'var(--color-primary-blue)' }}>Quadro de Integrantes e Saldos Individuais</h3>
          <table className="erp-table">
            <thead>
              <tr>
                <th>Membro</th>
                <th>Idade</th>
                <th>Total Receitas</th>
                <th>Total Despesas</th>
                <th>Saldo Líquido</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {resumo?.pessoas.map((p: ResumoFinanceiro['pessoas'][number]) => (
                <tr key={p.id}>
                  <td><strong>{p.nome}</strong></td>
                  <td>{p.idade} anos</td>
                  <td style={{ color: 'var(--color-semantic-green)' }}>R$ {p.totalReceitas.toFixed(2)}</td>
                  <td style={{ color: 'var(--color-semantic-red)' }}>R$ {p.totalDespesas.toFixed(2)}</td>
                  <td style={{ fontWeight: 'bold', color: p.saldo >= 0 ? 'var(--color-semantic-green)' : 'var(--color-semantic-red)' }}>
                    R$ {p.saldo.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleDeletarPessoa(p.id)} style={{ background: 'none', border: 'none', color: 'var(--color-semantic-red)', cursor: 'pointer', fontWeight: 600 }}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {resumo?.pessoas.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Nenhum membro familiar registrado no sistema.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tabela Geral de Transações Lançadas */}
        <div>
          <h3 style={{ marginBottom: '12px', color: 'var(--color-primary-blue)' }}>Extrato Geral Histórico de Movimentações</h3>
          <table className="erp-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Membro Vinculado</th>
                <th>Valor Mapeado</th>
                <th>Classificação</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.map((t: Transacao) => (
                <tr key={t.id}>
                  <td>{t.descricao}</td>
                  <td>{t.pessoa?.nome ?? 'Desconhecido'}</td>
                  <td style={{ fontWeight: 500 }}>R$ {t.valor.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${t.tipo === 'Receita' ? 'badge-receita' : 'badge-despesa'}`}>
                      {t.tipo}
                    </span>
                  </td>
                </tr>
              ))}
              {transacoes.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Nenhuma movimentação financeira processada até o momento.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}