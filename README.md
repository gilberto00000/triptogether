# TripTogether — WEB II

Projeto fullstack em Next.js (App Router) com backend REST em Route Handlers, MongoDB Atlas/Mongoose (singleton), NextAuth Credentials/JWT, bcrypt, Yup, React Query e Zustand.

## Iniciar

1. `npm install`
2. Copie `.env.example` para `.env.local` e preencha `MONGODB_URI`, `NEXTAUTH_URL` e `NEXTAUTH_SECRET` (`openssl rand -base64 32`).
3. `npm run dev` e abra http://localhost:3000
4. Crie um usuário via `POST /api/auth/register`, depois entre pela tela `/login`.

## Rotas REST (todas privadas, exceto registro e login)

| Método | Rota | Função |
|---|---|---|
| POST | /api/auth/register | Cadastro |
| GET, POST | /api/trips | Listar/criar viagens |
| GET, PATCH, DELETE | /api/trips/:id | Detalhar/editar/excluir viagem (edição e exclusão: organizador) |
| GET, POST | /api/trips/:id/participants | Listar/adicionar participante (adição: organizador) |
| GET, POST | /api/trips/:id/activities | Listar/criar passeios |
| PATCH, DELETE | /api/trips/:id/activities/:activityId | Editar/excluir passeio |
| GET, POST | /api/trips/:id/expenses | Listar/criar despesas |
| PATCH, DELETE | /api/trips/:id/expenses/:expenseId | Editar/excluir despesa |
| GET, POST | /api/trips/:id/checklist | Listar/criar itens |
| PATCH, DELETE | /api/trips/:id/checklist/:itemId | Editar/excluir item |
| GET | /api/trips/:id/balance | Total, pago, devido e saldo por participante |

### Exemplos de JSON

`POST /api/auth/register`: `{ "name":"Ana", "email":"ana@example.com", "password":"senha12345" }`

`POST /api/trips`: `{ "title":"Férias", "destination":"Recife", "startDate":"2026-12-10", "endDate":"2026-12-15" }`

`POST /api/trips/:id/participants`: `{ "email":"amigo@example.com" }` (o amigo já precisa ter conta).

`POST /api/trips/:id/activities`: `{ "title":"Praia", "location":"Boa Viagem", "startsAt":"2026-12-11T10:00:00.000Z" }`

`POST /api/trips/:id/expenses`: `{ "title":"Hospedagem", "amountCents":30000, "paidBy":"ID_USUARIO", "splitAmong":["ID_USUARIO","ID_AMIGO"] }`

`POST /api/trips/:id/checklist`: `{ "title":"Protetor solar", "checked":false }`

### Regras financeiras

Valores são inteiros em centavos para evitar erro de ponto flutuante. O rateio é igual entre os IDs de `splitAmong`; centavos restantes são atribuídos pela ordem crescente de IDs. `balanceCents = paidCents - owedCents`. Saldo positivo = crédito; negativo = dívida. Não há liquidação/transferência de pagamentos nesta versão.

### Segurança

API exige sessão JWT e verifica vínculo com a viagem. Só o organizador altera/exclui viagens ou adiciona participantes. Os participantes podem gerir passeios, despesas e checklist. O backend ignora campos não autorizados dos JSONs. Senhas armazenadas como bcrypt hash. Em produção use HTTPS e variáveis secretas apenas na Vercel.

### Para a equipe de frontend

Usar `useQuery` para GET, `useMutation` e `invalidateQueries` após POST/PATCH/DELETE. O Zustand deve controlar apenas estado visual. A página de login é um exemplo mínimo; falta tela de cadastro, componentes ShadCN e interfaces finais responsivas.

### Limitações e melhorias

Esta é uma base funcional, não uma aplicação concluída. Ainda faltam testes automatizados, convite com aceite, remoção de participantes com política financeira, registro de pagamentos entre pessoas, limitação de requisições e transação robusta na exclusão em cascata. Evite remover participantes com despesas já registradas. Configure Atlas e Vercel para validar o deploy.
