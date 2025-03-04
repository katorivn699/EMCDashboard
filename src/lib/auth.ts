// utils/jwt.ts
import jwt from "jsonwebtoken";

// Đảm bảo secret key được định nghĩa, nếu không có thì dùng giá trị mặc định
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET_KEY || "default_secret";

// Định nghĩa interface cho payload (tùy chọn, để có type safety)
interface TokenPayload {
  [key: string]: any; 
  id?: string | number; // Ví dụ: ID người dùng
  username?: string; // Ví dụ: Tên người dùng
}

// 1. Tạo Access Token
export function generateToken(
  payload: TokenPayload,
  expiresIn: string = "1h" // Thời gian hết hạn mặc định là 1 giờ
): string {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Could not generate token");
  }
}

// 2. Xác thực Token
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

// 3. Giải mã Token (không kiểm tra tính hợp lệ, chỉ để xem nội dung)
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload | null;
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

// 4. Kiểm tra token có hết hạn hay không
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại (giây)
  return decoded.exp < currentTime;
}

// 5. Làm mới Token (Refresh Token logic)
export function refreshToken(
  token: string,
  newExpiresIn: string = "1h"
): string | null {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  // Loại bỏ các thuộc tính không cần thiết (iat, exp) trước khi tạo token mới
  const { iat, exp, ...payload } = decoded;
  return generateToken(payload, newExpiresIn);
}

// Export mặc định nếu cần
export default {
  generateToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  refreshToken,
};
