// Uso: npm run check  -> confere o .env.local e testa a conexão com o MongoDB, explicando cada falha.
import fs from "node:fs";
import dns from "node:dns";
import mongoose from "mongoose";

const ok = m => console.log(`  \x1b[32m✔\x1b[0m ${m}`);
const warn = m => console.log(`  \x1b[33m!\x1b[0m ${m}`);
const bad = m => { failed = true; console.log(`  \x1b[31m✘\x1b[0m ${m}`); };
let failed = false;

console.log("\nVerificando o ambiente do TripTogether...\n");
if (!fs.existsSync(".env.local")) { bad("Arquivo .env.local não encontrado. Rode este comando na pasta do package.json e copie o .env.example para .env.local."); process.exit(1); }

const env = {};
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']+|["']+$/g, "").trim();
}

env.NEXTAUTH_SECRET ? ok("NEXTAUTH_SECRET definido.") : bad("NEXTAUTH_SECRET vazio. Gere com: openssl rand -base64 32");
env.NEXTAUTH_URL ? ok(`NEXTAUTH_URL = ${env.NEXTAUTH_URL}`) : bad("NEXTAUTH_URL vazio (use http://localhost:3000 em desenvolvimento).");

const uri = env.MONGODB_URI;
if (!uri) { bad("MONGODB_URI não definida."); process.exit(1); }
if (["usuario:senha", "seu-cluster", "@cluster.mongodb.net", "//cluster.mongodb.net"].some(p => uri.toLowerCase().includes(p))) {
  bad("MONGODB_URI está com o texto de exemplo. Cole a URI real do Atlas (Connect > Drivers).");
  process.exit(1);
}
const m = uri.match(/^mongodb(\+srv)?:\/\/(?:(.*)@)?([^/?]+)\/?([^?]*)/);
if (!m) { bad("MONGODB_URI em formato inválido. Ela deve começar com mongodb+srv://"); process.exit(1); }
const [, srv, userinfo = "", host, dbName] = m;
const password = userinfo.includes(":") ? userinfo.slice(userinfo.indexOf(":") + 1) : "";
ok(`Servidor: ${host}`);
if (!userinfo) bad("A URI não tem usuário e senha (mongodb+srv://USUARIO:SENHA@host).");
else if (/[@/#?[\]]/.test(password)) bad("A senha tem símbolos especiais (@ / # ? [ ]) sem codificar. Troque pelo código: @ = %40, / = %2F, # = %23, ? = %3F.");
else ok("Usuário e senha presentes na URI.");
dbName ? ok(`Banco: ${dbName}`) : warn('A URI não tem nome de banco: os dados irão para o banco "test". Adicione /triptogether antes de "?" ou no fim.');

const servers = (env.MONGODB_DNS_SERVERS ?? "").split(",").map(s => s.trim()).filter(Boolean);
if (servers.length) { dns.setServers(servers); ok(`DNS personalizado: ${servers.join(", ")}`); }

if (srv) {
  try { await dns.promises.resolveSrv(`_mongodb._tcp.${host}`); ok("DNS resolveu o endereço do cluster."); }
  catch (e) {
    bad(`O DNS não resolveu o cluster (${e.code}). Confira o endereço na URI ou a sua internet.`);
    try {
      const r = new dns.promises.Resolver(); r.setServers(["8.8.8.8", "1.1.1.1"]);
      await r.resolveSrv(`_mongodb._tcp.${host}`);
      warn("Com o DNS do Google funcionou. Acrescente esta linha ao .env.local e reinicie:  MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1");
    } catch { /* o endereço está errado ou não há internet */ }
  }
}

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  await mongoose.connection.db.admin().ping();
  ok(`Conectado ao MongoDB (banco "${mongoose.connection.name}").`);
  const users = await mongoose.connection.db.collection("users").countDocuments();
  ok(`${users} usuário(s) já cadastrado(s).`);
} catch (e) {
  const t = `${e.name} ${e.message} ${e.code}`;
  if (/bad auth|authentication failed/i.test(t) || e.code === 18) bad("Usuário ou senha do banco incorretos (Atlas > Database Access).");
  else if (/ServerSelection|whitelist/i.test(t)) bad("O Atlas recusou a conexão. Verifique: (1) Network Access com 0.0.0.0/0 ATIVO; (2) o cluster não está pausado; (3) a rede não bloqueia a porta 27017 (teste com o 4G do celular).");
  else bad(`Falha ao conectar: ${e.message}`);
}
await mongoose.disconnect().catch(() => {});

console.log(failed ? "\n\x1b[31mCorrija os itens marcados com ✘ e rode `npm run check` de novo.\x1b[0m\n" : "\n\x1b[32mTudo certo! Reinicie o `npm run dev` e teste o cadastro.\x1b[0m\n");
process.exit(failed ? 1 : 0);
