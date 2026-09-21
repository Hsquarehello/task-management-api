import app from "./app.js";
import { prisma } from "./libs/prisma.js";

const PORT = process.env.PORT;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to the database via Prisma.");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n⚠️ Received ${signal}. Starting graceful shutdown...`);

      await prisma.$disconnect();
      console.log("🔌 Database disconnected.");

      server.close(() => {
        console.log("🛑 Server closed. Exiting process...");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
