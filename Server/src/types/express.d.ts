// src/types/express.d.ts (or src/express.d.ts)
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
