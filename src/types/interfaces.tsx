export interface project {
    _id: string,
    projectName: string,
    description: string,
    createdAt: Date
}
export interface JwtPayload {
    role: string;
    [key: string]: unknown;
  }