import * as schema from '../db/schema.js'
import { hashSenha } from '../lib/senha.js'
import type { Entidade } from '../lib/crud.js'

// ---------- blocos reutilizáveis de JSON Schema ----------
const texto = (max: number) => ({ type: 'string', minLength: 1, maxLength: max })
const textoOpc = (max: number) => ({ type: ['string', 'null'], maxLength: max })
const longo = { type: 'string', minLength: 1, maxLength: 65535 }
const longoOpc = { type: ['string', 'null'], maxLength: 65535 }
const opcoes = (...valores: string[]) => ({ type: 'string', enum: valores })
const fk = { type: 'integer', minimum: 1 }
const fkOpc = { type: ['integer', 'null'], minimum: 1 }
const inteiroOpc = { type: ['integer', 'null'] }
const emailObr = { type: 'string', format: 'email', maxLength: 150 }
const emailOpc = { type: ['string', 'null'], format: 'email', maxLength: 150 }

const CPF = '\\d{11}|\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}'
const CNPJ = '\\d{14}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}'
const DATA = '\\d{4}-\\d{2}-\\d{2}'
const HORA = '([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?'
const cpf = { type: 'string', pattern: `^(${CPF})$`, maxLength: 14 }
const cpfOpc = { type: ['string', 'null'], pattern: `^(${CPF})$`, maxLength: 14 }
const cnpjOpc = { type: ['string', 'null'], pattern: `^(${CNPJ})$`, maxLength: 18 }
const cpfOuCnpj = { type: 'string', pattern: `^(${CPF}|${CNPJ})$`, maxLength: 18 }
const data = { type: 'string', pattern: `^${DATA}$` }
const dataOpc = { type: ['string', 'null'], pattern: `^${DATA}$` }
const hora = { type: 'string', pattern: `^${HORA}$` }
const horaOpc = { type: ['string', 'null'], pattern: `^${HORA}$` }
const dataHora = { type: 'string', pattern: `^${DATA}[ T]${HORA}$` }

const horaCompleta = (h: string) => (h.length === 5 ? `${h}:00` : h)

// ---------- as 13 entidades ----------
export const entidades: Entidade[] = [
  {
    prefix: '/usuarios',
    nome: 'Usuário',
    table: schema.usuarios,
    idKey: 'id_usuario',
    properties: {
      nome: texto(100),
      cpf,
      email: emailObr,
      telefone: textoOpc(20),
      senha: { type: 'string', minLength: 8, maxLength: 72 },
      perfil_acesso: texto(30),
      status: opcoes('ativo', 'inativo'),
    },
    required: ['nome', 'cpf', 'email', 'senha', 'perfil_acesso'],
    filtros: ['status', 'perfil_acesso'],
    ocultar: ['senha'],
    preparar: async (d) => (d.senha === undefined ? d : { ...d, senha: await hashSenha(d.senha) }),
  },
  {
    prefix: '/condominios',
    nome: 'Condomínio',
    table: schema.condominios,
    idKey: 'id_condominio',
    properties: {
      nome: texto(120),
      cnpj: cnpjOpc,
      endereco: texto(255),
      telefone: textoOpc(20),
      email: emailOpc,
      data_cadastro: data,
    },
    required: ['nome', 'endereco', 'data_cadastro'],
  },
  {
    prefix: '/areas-comuns',
    nome: 'Área comum',
    artigo: 'a',
    table: schema.areasComuns,
    idKey: 'id_area',
    properties: {
      nome: texto(100),
      descricao: longoOpc,
      capacidade: { type: ['integer', 'null'], minimum: 1 },
      horario_funcionamento: textoOpc(100),
      status: opcoes('ativa', 'inativa'),
    },
    required: ['nome'],
    filtros: ['status'],
  },
  {
    prefix: '/unidades',
    nome: 'Unidade',
    artigo: 'a',
    table: schema.unidades,
    idKey: 'id_unidade',
    properties: {
      numero: texto(20),
      bloco: textoOpc(20),
      andar: inteiroOpc,
      tipo: texto(30),
      status: opcoes('ativa', 'inativa'),
      id_condominio: fk,
    },
    required: ['numero', 'tipo', 'id_condominio'],
    filtros: ['id_condominio', 'status', 'bloco', 'tipo'],
  },
  {
    prefix: '/moradores',
    nome: 'Morador',
    table: schema.moradores,
    idKey: 'id_morador',
    properties: {
      nome: texto(100),
      cpf,
      email: emailOpc,
      telefone: textoOpc(20),
      tipo_morador: texto(30),
      id_unidade: fk,
    },
    required: ['nome', 'cpf', 'tipo_morador', 'id_unidade'],
    filtros: ['id_unidade', 'tipo_morador'],
  },
  {
    prefix: '/visitantes',
    nome: 'Visitante',
    table: schema.visitantes,
    idKey: 'id_visitante',
    properties: {
      nome: texto(100),
      cpf: cpfOpc,
      telefone: textoOpc(20),
      data_visita: data,
      horario_previsto: horaOpc,
      id_morador_responsavel: fk,
      status_autorizacao: opcoes('pendente', 'autorizado', 'negado'),
    },
    required: ['nome', 'data_visita', 'id_morador_responsavel'],
    filtros: ['id_morador_responsavel', 'status_autorizacao', 'data_visita'],
  },
  {
    prefix: '/veiculos',
    nome: 'Veículo',
    table: schema.veiculos,
    idKey: 'id_veiculo',
    properties: {
      placa: { type: 'string', pattern: '^[A-Za-z]{3}-?\\d[A-Za-z0-9]\\d{2}$', maxLength: 10 },
      modelo: texto(60),
      marca: textoOpc(60),
      cor: textoOpc(30),
      tipo: textoOpc(30),
      id_morador: fk,
    },
    required: ['placa', 'modelo', 'id_morador'],
    filtros: ['id_morador', 'tipo'],
    preparar: (d) => (d.placa === undefined ? d : { ...d, placa: String(d.placa).toUpperCase() }),
  },
  {
    prefix: '/acessos',
    nome: 'Acesso',
    table: schema.acessos,
    idKey: 'id_acesso',
    properties: {
      tipo_acesso: texto(30),
      data_acesso: data,
      horario_entrada: hora,
      horario_saida: horaOpc,
      id_morador: fkOpc,
      id_visitante: fkOpc,
      id_veiculo: fkOpc,
      id_responsavel_registro: fk,
    },
    required: ['tipo_acesso', 'data_acesso', 'horario_entrada', 'id_responsavel_registro'],
    filtros: ['tipo_acesso', 'data_acesso', 'id_morador', 'id_visitante', 'id_veiculo'],
    validarCriacao: (d) =>
      d.id_morador || d.id_visitante || d.id_veiculo
        ? null
        : 'Informe ao menos um de: id_morador, id_visitante, id_veiculo',
  },
  {
    prefix: '/reservas',
    nome: 'Reserva',
    artigo: 'a',
    table: schema.reservas,
    idKey: 'id_reserva',
    properties: {
      data_reserva: data,
      horario_inicial: hora,
      horario_final: hora,
      status: opcoes('pendente', 'confirmada', 'cancelada'),
      id_area: fk,
      id_morador: fk,
    },
    required: ['data_reserva', 'horario_inicial', 'horario_final', 'id_area', 'id_morador'],
    filtros: ['id_area', 'id_morador', 'status', 'data_reserva'],
    validarCriacao: (d) =>
      horaCompleta(d.horario_final) > horaCompleta(d.horario_inicial)
        ? null
        : 'horario_final deve ser maior que horario_inicial',
  },
  {
    prefix: '/ocorrencias',
    nome: 'Ocorrência',
    artigo: 'a',
    table: schema.ocorrencias,
    idKey: 'id_ocorrencia',
    properties: {
      titulo: texto(150),
      descricao: longo,
      data_ocorrencia: dataHora,
      categoria: texto(50),
      status: opcoes('aberta', 'em_andamento', 'resolvida'),
      prioridade: opcoes('baixa', 'media', 'alta'),
      id_usuario_responsavel: fk,
    },
    required: ['titulo', 'descricao', 'data_ocorrencia', 'categoria', 'id_usuario_responsavel'],
    filtros: ['status', 'prioridade', 'categoria', 'id_usuario_responsavel'],
  },
  {
    prefix: '/avisos',
    nome: 'Aviso',
    table: schema.avisos,
    idKey: 'id_aviso',
    properties: {
      titulo: texto(150),
      conteudo: longo,
      data_publicacao: dataHora,
      data_validade: dataOpc,
      id_autor: fk,
      publico_alvo: texto(50),
      status: opcoes('ativo', 'inativo'),
    },
    required: ['titulo', 'conteudo', 'data_publicacao', 'id_autor', 'publico_alvo'],
    filtros: ['status', 'publico_alvo', 'id_autor'],
  },
  {
    prefix: '/prestadores-servico',
    nome: 'Prestador de serviço',
    table: schema.prestadoresServico,
    idKey: 'id_prestador',
    properties: {
      nome_razao_social: texto(150),
      cpf_cnpj: cpfOuCnpj,
      telefone: textoOpc(20),
      email: emailOpc,
      tipo_servico: texto(100),
      status: opcoes('ativo', 'inativo'),
    },
    required: ['nome_razao_social', 'cpf_cnpj', 'tipo_servico'],
    filtros: ['status', 'tipo_servico'],
  },
  {
    prefix: '/pagamentos',
    nome: 'Pagamento',
    table: schema.pagamentos,
    idKey: 'id_pagamento',
    properties: {
      descricao: texto(200),
      valor: { type: 'number', minimum: 0, maximum: 99999999.99 },
      data_vencimento: data,
      data_pagamento: dataOpc,
      status: opcoes('pendente', 'pago', 'atrasado', 'cancelado'),
      forma_pagamento: textoOpc(30),
      id_unidade: fk,
    },
    required: ['descricao', 'valor', 'data_vencimento', 'id_unidade'],
    filtros: ['id_unidade', 'status', 'data_vencimento'],
    // decimal no MySQL é gravado como string com 2 casas
    preparar: (d) => (d.valor === undefined ? d : { ...d, valor: Number(d.valor).toFixed(2) }),
  },
]
