import Fastify from 'fastify'
import { db } from './db'
import * as schema from './db/schema' // Importa todas as tabelas de uma vez

const app = Fastify({ logger: true })

app.get('/', async () => {
  return { status: 'API de Gestão de Condomínios Online' }
})

// 1. Usuários
app.get('/usuarios', async () => {
  return { dados: await db.select().from(schema.usuarios) }
})

// 2. Condomínios
app.get('/condominios', async () => {
  return { dados: await db.select().from(schema.condominios) }
})

// 3. Áreas Comuns
app.get('/areas-comuns', async () => {
  return { dados: await db.select().from(schema.areasComuns) }
})

// 4. Unidades
app.get('/unidades', async () => {
  return { dados: await db.select().from(schema.unidades) }
})

// 5. Moradores
app.get('/moradores', async () => {
  return { dados: await db.select().from(schema.moradores) }
})

// 6. Visitantes
app.get('/visitantes', async () => {
  return { dados: await db.select().from(schema.visitantes) }
})

// 7. Veículos
app.get('/veiculos', async () => {
  return { dados: await db.select().from(schema.veiculos) }
})

// 8. Acessos
app.get('/acessos', async () => {
  return { dados: await db.select().from(schema.acessos) }
})

// 9. Reservas
app.get('/reservas', async () => {
  return { dados: await db.select().from(schema.reservas) }
})

// 10. Ocorrências
app.get('/ocorrencias', async () => {
  return { dados: await db.select().from(schema.ocorrencias) }
})

// 11. Avisos
app.get('/avisos', async () => {
  return { dados: await db.select().from(schema.avisos) }
})

// 12. Prestadores de Serviço
app.get('/prestadores-servico', async () => {
  return { dados: await db.select().from(schema.prestadoresServico) }
})

// 13. Pagamentos
app.get('/pagamentos', async () => {
  return { dados: await db.select().from(schema.pagamentos) }
})

const start = async () => {
  try {
    await app.listen({ port: 3000, host: 'localhost' })
    console.log('Servidor rodando em http://localhost:3000');
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()