import axios from 'axios';

// Definição da URL base do back-end em .NET. 
// Em desenvolvimento, o Vite usa proxy para redirecionar /api para o backend.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'Erro inesperado na comunicação com a API.';
    return Promise.reject({ ...error, message });
  }
);

// --- INTERFACES TYPESCRIPT (Contratos de Dados) ---

export interface Pessoa {
  id?: string;
  nome: string;
  idade: number;
}

export interface Transacao {
  id?: string;
  descricao: string;
  valor: number;
  tipo: 'Receita' | 'Despesa';
  pessoaId: string;
  pessoa?: Pessoa;
}

export interface ResumoPessoa {
  id: string;
  nome: string;
  idade: number;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

export interface ResumoFinanceiro {
  pessoas: ResumoPessoa[];
  totalGeralReceitas: number;
  totalGeralDespesas: number;
  saldoLiquidoGeral: number;
}

// --- MÉTODOS DE REQUISIÇÃO ---

export const pessoasService = {
  listar: () => api.get<Pessoa[]>('/pessoas').then(res => res.data),
  criar: (pessoa: Pessoa) => api.post<Pessoa>('/pessoas', pessoa).then(res => res.data),
  deletar: (id: string) => api.delete(`/pessoas/${id}`).then(res => res.data),
};

export const transacoesService = {
  listar: () => api.get<Transacao[]>('/transacoes').then(res => res.data),
  criar: (transacao: Transacao) => api.post<Transacao>('/transacoes', transacao).then(res => res.data),
};

export const totaisService = {
  obterResumo: () => api.get<ResumoFinanceiro>('/totais').then(res => res.data),
};