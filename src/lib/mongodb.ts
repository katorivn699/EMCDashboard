import mongoose from "mongoose";

// Định nghĩa kiểu cho global để tránh lỗi any
interface Global {
  mongoose?: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

// Khai báo biến global với kiểu cụ thể
const globalWithMongoose = global as unknown as Global;

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("⚠️ Bạn chưa cấu hình biến môi trường MONGODB_URI!");
}

// Sử dụng const thay vì let vì cached không được gán lại
const cached = globalWithMongoose.mongoose || { conn: null, promise: null };

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