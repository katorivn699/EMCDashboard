import jwt, { SignOptions } from "jsonwebtoken";

// Đảm bảo secret key được định nghĩa, nếu không có thì dùng giá trị mặc định
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET_KEY || "default_secret";

// Định nghĩa interface cho payload với kiểu cụ thể hơn
interface TokenPayload {
  [key: string]: unknown; // Thay any bằng unknown để an toàn hơn
  id?: string | number; // Ví dụ: ID người dùng
  username?: string; // Ví dụ: Tên người dùng
  iat?: number; // Thêm iat để tránh lỗi khi decode
  exp?: number; // Thêm exp để tránh lỗi khi decode
}

export function generateToken(
  payload: TokenPayload,
  expiresIn: string | number = "7d"
): string {
  try {
    const options: SignOptions = { expiresIn: expiresIn as unknown as number }; // Ép kiểu rõ ràng
    return jwt.sign(payload, JWT_SECRET, options);
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
  const { iat: _iat, exp: _exp, ...payload } = decoded; // Sử dụng _ để bỏ qua iat, exp
  return generateToken(payload, newExpiresIn);
}

// Gán object vào biến trước khi export
const authUtils = {
  generateToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  refreshToken,
};

export default authUtils;