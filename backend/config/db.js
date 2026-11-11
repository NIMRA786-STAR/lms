// backend/config/db.js
const mongoose = require('mongoose');

// Serverless connection cache (Vercel cold start safe)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Agar connection zinda hai to wahi return karo
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Agar connection ban raha hai to uska wait karo
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => {
        console.log('✅ MongoDB Connected');
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // Fail hone par clean state — taake agla request retry kar sake
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;