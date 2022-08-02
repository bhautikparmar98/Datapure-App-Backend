declare namespace Express {
  export interface Request {
    user: {
      email: string;
      fullName: string;
      id: number;
      role: string;
    };
    token: string;
  }
}
