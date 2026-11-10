const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Agar connection pehle se hai aur readyState 1 (connected) hai, to wahi use karo
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Agar connection ban raha hai to uska wait karo
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000
      // bufferCommands hata do, default true rehne do
    }).then((m) => {
      console.log('✅ MongoDB Connected');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;