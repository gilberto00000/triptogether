import dns from "node:dns";
import mongoose from "mongoose";

export class DbConfigError extends Error {
  constructor(message: string) { super(message); this.name = "DbConfigError"; }
}

// Remove espaços, aspas e \r que costumam vir ao colar valores no .env ou no painel da Vercel.
const clean = (v?: string) => (v ?? "").trim().replace(/^["']+|["']+$/g, "").trim();
const PLACEHOLDERS = ["usuario:senha", "seu-cluster", "@cluster.mongodb.net", "//cluster.mongodb.net"];

// Algumas redes/roteadores falham ao resolver o endereço "mongodb+srv". Se der erro "querySrv ECONNREFUSED",
// defina MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1 no .env.local.
const dnsServers = clean(process.env.MONGODB_DNS_SERVERS).split(",").map(s => s.trim()).filter(Boolean);
if (dnsServers.length) dns.setServers(dnsServers);

export function mongoUri() {
  const uri = clean(process.env.MONGODB_URI);
  if (!uri) throw new DbConfigError("MONGODB_URI não configurada. Crie o arquivo .env.local (veja o .env.example) e reinicie o servidor.");
  if (PLACEHOLDERS.some(p => uri.toLowerCase().includes(p))) throw new DbConfigError("A MONGODB_URI ainda está com o texto de exemplo. Cole a URI real do Atlas no .env.local e reinicie o servidor.");
  return uri;
}

/** Traduz erros de conexão em mensagens úteis. Retorna null se o erro não for do banco. */
export function dbErrorMessage(e: unknown): string | null {
  if (e instanceof DbConfigError) return e.message;
  const err = (e ?? {}) as { name?: string; message?: string; code?: string | number };
  const text = `${err.name} ${err.message} ${err.code}`;
  if (/bad auth|authentication failed/i.test(text) || err.code === 18) return "Usuário ou senha do banco incorretos. Confira a MONGODB_URI.";
  if (/ENOTFOUND|querySrv|EAI_AGAIN|ECONNREFUSED|ETIMEOUT/i.test(text)) return "Não foi possível localizar o servidor do banco. Confira a MONGODB_URI e a internet (se persistir, veja MONGODB_DNS_SERVERS no .env.example).";
  if (/ServerSelection|MongoNetwork|whitelist/i.test(text)) return "Não foi possível conectar ao banco. Libere o IP no Atlas (Network Access) e confira se a rede não bloqueia o MongoDB.";
  return null;
}

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalMongo = globalThis as typeof globalThis & { mongooseCache?: Cache };
const cached = globalMongo.mongooseCache ?? (globalMongo.mongooseCache = { conn: null, promise: null });

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = mongoUri();
    cached.promise = mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 10_000 }).catch(err => { cached.promise = null; throw err; });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
