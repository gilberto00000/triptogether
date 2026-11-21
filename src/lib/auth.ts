import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect, dbErrorMessage } from "@/lib/db";
import { User } from "@/models/User";
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [CredentialsProvider({ name: "Credenciais", credentials: { email: { label: "Email", type: "email" }, password: { label: "Senha", type: "password" } }, async authorize(credentials) {
    if (!credentials?.email || !credentials.password) return null;
    try {
      await dbConnect();
      const user = await User.findOne({ email: credentials.email.trim().toLowerCase() }).select("+passwordHash");
      if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) return null;
      return { id: String(user._id), name: user.name, email: user.email };
    } catch (e) {
      // Falha de banco não é "senha errada": devolve a causa real para a tela de login mostrar.
      const msg = dbErrorMessage(e);
      if (msg) { console.error(e); throw new Error(msg); }
      throw e;
    }
  } })],
  callbacks: {
    async jwt({ token, user }) { if (user) token.id = user.id; return token; },
    async session({ session, token }) { if (session.user) session.user.id = String(token.id); return session; }
  },
  secret: process.env.NEXTAUTH_SECRET
};
