import { verifyToken } from "@/lib/auth";
import { JwtPayload } from "jsonwebtoken";

export function authenticateToken(req: Request, role: string[]) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return { error: "noToken", status: 401 };
  }

  try {
    const decoded = verifyToken(token);
    const userRole = (decoded as JwtPayload).role;

    if (!role.includes(userRole)) {
      return { error: "noPermission", status: 403 };
    }

    return { user: decoded, status: 200 };
  } catch (error) {
    console.log(error);
    return { error: "invalidToken", status: 401 };
  }
}