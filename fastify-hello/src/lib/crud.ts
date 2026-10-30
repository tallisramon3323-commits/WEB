import type { FastifyInstance } from 'fastify'
import { and, eq, getTableColumns, type SQL } from 'drizzle-orm'
import type { AnyMySqlColumn, AnyMySqlTable } from 'drizzle-orm/mysql-core'
import { db } from '../db/index.js'

type Dados = Record<string, any>

export type Entidade = {
  /** Prefixo da rota, ex.: '/moradores' */
  prefix: string
  /** Nome no singular para as mensagens, ex.: 'Morador' */
  nome: string
  /** Gênero para "não encontrado/a" (padrão 'o') */
  artigo?: 'o' | 'a'
  table: AnyMySqlTable
  /** Nome da coluna da chave primária */
  idKey: string
  /** JSON Schema de cada campo aceito no body */
  properties: Record<string, any>
  /** Campos obrigatórios no POST */
  required: string[]
  /** Campos aceitos como filtro no GET / (querystring) */
  filtros?: string[]
  /** Colunas que nunca são devolvidas pela API (ex.: senha) */
  ocultar?: string[]
  /** Normaliza o body antes de gravar (POST e PUT) */
  preparar?: (dados: Dados) => Dados | Promise<Dados>
  /** Regra extra só no POST; devolva a mensagem de erro ou null */
  validarCriacao?: (dados: Dados) => string | null
}

/** Remove 'null' do type para usar o schema como filtro de querystring. */
const semNull = (schema: any) =>
  Array.isArray(schema.type) ? { ...schema, type: schema.type.filter((t: string) => t !== 'null')[0] } : schema

/**
 * Gera as rotas GET /, GET /:id, POST /, PUT /:id e DELETE /:id de uma entidade.
 * Uso: app.register(crudRoutes(entidade), { prefix: entidade.prefix })
 */
export function crudRoutes(e: Entidade) {
  // O Drizzle tipa cada tabela de forma específica; aqui o tipo é genérico,
  // então as chamadas ao banco passam por `any`. A entrada é validada pelos JSON Schemas.
  const dbx = db as any
  const colunas = getTableColumns(e.table) as unknown as Record<string, AnyMySqlColumn>
  const idCol = colunas[e.idKey]!
  const visiveis = Object.fromEntries(Object.entries(colunas).filter(([chave]) => !e.ocultar?.includes(chave)))
  const naoEncontrado = `${e.nome} não encontrad${e.artigo ?? 'o'}`
  const preparar = e.preparar ?? ((d: Dados) => d)

  const params = { type: 'object', required: ['id'], properties: { id: { type: 'integer', minimum: 1 } } } as const
  const query = {
    type: 'object',
    properties: {
      ...Object.fromEntries((e.filtros ?? []).map((campo) => [campo, semNull(e.properties[campo])])),
      limit: { type: 'integer', minimum: 1, maximum: 500, default: 100 },
      offset: { type: 'integer', minimum: 0, default: 0 },
    },
  } as const
  const bodyCriar = { type: 'object', additionalProperties: false, required: e.required, properties: e.properties }
  const bodyAtualizar = { type: 'object', additionalProperties: false, minProperties: 1, properties: e.properties }

  const buscar = async (id: number) => {
    const [row] = await dbx.select(visiveis).from(e.table).where(eq(idCol, id)).limit(1)
    return row as Dados | undefined
  }

  return async function (app: FastifyInstance) {
    app.get<{ Querystring: Dados }>('/', { schema: { querystring: query } }, async (req) => {
      const { limit, offset } = req.query
      const filtros: SQL[] = []
      for (const campo of e.filtros ?? []) {
        if (req.query[campo] !== undefined) filtros.push(eq(colunas[campo]!, req.query[campo]))
      }
      return dbx
        .select(visiveis)
        .from(e.table)
        .where(and(...filtros))
        .orderBy(idCol)
        .limit(limit)
        .offset(offset)
    })

    app.get<{ Params: { id: number } }>('/:id', { schema: { params } }, async (req, reply) => {
      const row = await buscar(req.params.id)
      if (!row) return reply.code(404).send({ message: naoEncontrado })
      return row
    })

    app.post<{ Body: Dados }>('/', { schema: { body: bodyCriar } }, async (req, reply) => {
      const erro = e.validarCriacao?.(req.body)
      if (erro) return reply.code(400).send({ message: erro })
      const [res] = await dbx.insert(e.table).values(await preparar(req.body))
      return reply.code(201).send(await buscar(res.insertId))
    })

    app.put<{ Params: { id: number }; Body: Dados }>(
      '/:id',
      { schema: { params, body: bodyAtualizar } },
      async (req, reply) => {
        // O MySQL só conta linhas realmente alteradas, então a existência é conferida com um SELECT.
        await dbx.update(e.table).set(await preparar(req.body)).where(eq(idCol, req.params.id))
        const row = await buscar(req.params.id)
        if (!row) return reply.code(404).send({ message: naoEncontrado })
        return row
      },
    )

    app.delete<{ Params: { id: number } }>('/:id', { schema: { params } }, async (req, reply) => {
      const [res] = await dbx.delete(e.table).where(eq(idCol, req.params.id))
      if (!res.affectedRows) return reply.code(404).send({ message: naoEncontrado })
      return reply.code(204).send()
    })
  }
}
