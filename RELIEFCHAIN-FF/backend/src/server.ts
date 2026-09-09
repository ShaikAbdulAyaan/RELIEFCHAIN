import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`RELIEFCHAIN Backend running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("SERVER ERROR:", error);
});

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});