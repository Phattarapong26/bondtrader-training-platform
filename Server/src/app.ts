import express from "express";
import cors from "cors";
import routes from "./routes/index.routes";
import path from "path";
import { setupSwagger } from "./utils/swagger";

export const app = express();
setupSwagger(app);

// Apply middlewares
app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:3000", "http://localhost", "http://localhost:80", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register the combined routes
app.use("/api", routes);
app.use("/uploads",express.static(path.join(__dirname, '../src/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Add middleware to handle errors
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
