import mongoose from "mongoose";

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI|| "";

if (!MONGODB_URI) {
  throw new Error("⚠️ Bạn chưa cấu hình biến môi trường MONGODB_URI!");
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn; 

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "EMCDB", 
        bufferCommands: false,
      })
      .then((mongoose) => {
        console.log("✅ Kết nối MongoDB thành công!");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ Lỗi kết nối MongoDB:", err);
        process.exit(1);
      });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}
