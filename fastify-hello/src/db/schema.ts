import { mysqlTable, int, varchar, text, date, time, datetime, decimal } from "drizzle-orm/mysql-core";

// 1. USUARIOS
export const usuarios = mysqlTable("usuarios", {
  id_usuario: int("id_usuario").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  telefone: varchar("telefone", { length: 20 }),
  senha: varchar("senha", { length: 255 }).notNull(),
  perfil_acesso: varchar("perfil_acesso", { length: 30 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default('ativo'),
});

// 2. CONDOMINIOS
export const condominios = mysqlTable("condominios", {
  id_condominio: int("id_condominio").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 120 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }).unique(),
  endereco: varchar("endereco", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 150 }),
  data_cadastro: date("data_cadastro").notNull(),
});

// 3. AREAS COMUNS
export const areasComuns = mysqlTable("areas_comuns", {
  id_area: int("id_area").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao"),
  capacidade: int("capacidade"),
  horario_funcionamento: varchar("horario_funcionamento", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default('ativa'),
});

// 4. UNIDADES
export const unidades = mysqlTable("unidades", {
  id_unidade: int("id_unidade").autoincrement().primaryKey(),
  numero: varchar("numero", { length: 20 }).notNull(),
  bloco: varchar("bloco", { length: 20 }),
  andar: int("andar"),
  tipo: varchar("tipo", { length: 30 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default('ativa'),
  id_condominio: int("id_condominio").notNull(),
});

// 5. MORADORES
export const moradores = mysqlTable("moradores", {
  id_morador: int("id_morador").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  email: varchar("email", { length: 150 }),
  telefone: varchar("telefone", { length: 20 }),
  tipo_morador: varchar("tipo_morador", { length: 30 }).notNull(),
  id_unidade: int("id_unidade").notNull(),
});

// 6. VISITANTES
export const visitantes = mysqlTable("visitantes", {
  id_visitante: int("id_visitante").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  telefone: varchar("telefone", { length: 20 }),
  data_visita: date("data_visita").notNull(),
  horario_previsto: time("horario_previsto"),
  id_morador_responsavel: int("id_morador_responsavel").notNull(),
  status_autorizacao: varchar("status_autorizacao", { length: 30 }).notNull().default('pendente'),
});

// 7. VEICULOS
export const veiculos = mysqlTable("veiculos", {
  id_veiculo: int("id_veiculo").autoincrement().primaryKey(),
  placa: varchar("placa", { length: 10 }).notNull().unique(),
  modelo: varchar("modelo", { length: 60 }).notNull(),
  marca: varchar("marca", { length: 60 }),
  cor: varchar("cor", { length: 30 }),
  tipo: varchar("tipo", { length: 30 }),
  id_morador: int("id_morador").notNull(),
});

// 8. ACESSOS
export const acessos = mysqlTable("acessos", {
  id_acesso: int("id_acesso").autoincrement().primaryKey(),
  tipo_acesso: varchar("tipo_acesso", { length: 30 }).notNull(),
  data_acesso: date("data_acesso").notNull(),
  horario_entrada: time("horario_entrada").notNull(),
  horario_saida: time("horario_saida"),
  id_morador: int("id_morador"),
  id_visitante: int("id_visitante"),
  id_veiculo: int("id_veiculo"),
  id_responsavel_registro: int("id_responsavel_registro").notNull(),
});

// 9. RESERVAS
export const reservas = mysqlTable("reservas", {
  id_reserva: int("id_reserva").autoincrement().primaryKey(),
  data_reserva: date("data_reserva").notNull(),
  horario_inicial: time("horario_inicial").notNull(),
  horario_final: time("horario_final").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('pendente'),
  id_area: int("id_area").notNull(),
  id_morador: int("id_morador").notNull(),
});

// 10. OCORRENCIAS
export const ocorrencias = mysqlTable("ocorrencias", {
  id_ocorrencia: int("id_ocorrencia").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 150 }).notNull(),
  descricao: text("descricao").notNull(),
  data_ocorrencia: datetime("data_ocorrencia").notNull(),
  categoria: varchar("categoria", { length: 50 }).notNull(),
  status: varchar("status", { length: 30 }).notNull().default('aberta'),
  prioridade: varchar("prioridade", { length: 20 }).notNull().default('media'),
  id_usuario_responsavel: int("id_usuario_responsavel").notNull(),
});

// 11. AVISOS
export const avisos = mysqlTable("avisos", {
  id_aviso: int("id_aviso").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 150 }).notNull(),
  conteudo: text("conteudo").notNull(),
  data_publicacao: datetime("data_publicacao").notNull(),
  data_validade: date("data_validade"),
  id_autor: int("id_autor").notNull(),
  publico_alvo: varchar("publico_alvo", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default('ativo'),
});

// 12. PRESTADORES DE SERVICO
export const prestadoresServico = mysqlTable("prestadores_servico", {
  id_prestador: int("id_prestador").autoincrement().primaryKey(),
  nome_razao_social: varchar("nome_razao_social", { length: 150 }).notNull(),
  cpf_cnpj: varchar("cpf_cnpj", { length: 18 }).notNull().unique(),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 150 }),
  tipo_servico: varchar("tipo_servico", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default('ativo'),
});

// 13. PAGAMENTOS
export const pagamentos = mysqlTable("pagamentos", {
  id_pagamento: int("id_pagamento").autoincrement().primaryKey(),
  descricao: varchar("descricao", { length: 200 }).notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  data_vencimento: date("data_vencimento").notNull(),
  data_pagamento: date("data_pagamento"),
  status: varchar("status", { length: 30 }).notNull().default('pendente'),
  forma_pagamento: varchar("forma_pagamento", { length: 30 }),
  id_unidade: int("id_unidade").notNull(),
});