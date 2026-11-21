import mongoose from "mongoose";
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalMongo = globalThis as typeof globalThis & { mongooseCache?: Cache };
const cached = globalMongo.mongooseCache ?? (globalMongo.mongooseCache = { conn: null, promise: null });
export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Configure MONGODB_URI");
    cached.promise = mongoose.connect(uri, { bufferCommands: false }).catch(err => { cached.promise = null; throw err; });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
