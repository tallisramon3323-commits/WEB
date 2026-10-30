import { randomBytes, scrypt, timingSafeEqual, type BinaryLike } from 'node:crypto'

const derivar = (senha: string, salt: BinaryLike) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(senha, salt, 64, (err, chave) => (err ? reject(err) : resolve(chave))),
  )

/** Gera "scrypt$<salt>$<hash>" (cabe em varchar(255)). */
export async function hashSenha(senha: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const hash = (await derivar(senha, salt)).toString('hex')
  return `scrypt$${salt}$${hash}`
}

/** Para uso futuro no login. */
export async function verificarSenha(senha: string, armazenado: string): Promise<boolean> {
  const [algoritmo, salt, hash] = armazenado.split('$')
  if (algoritmo !== 'scrypt' || !salt || !hash) return false
  const esperado = Buffer.from(hash, 'hex')
  const obtido = await derivar(senha, salt)
  return esperado.length === obtido.length && timingSafeEqual(esperado, obtido)
}
