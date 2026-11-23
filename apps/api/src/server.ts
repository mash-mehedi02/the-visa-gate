import app from './app';
import { config } from './config';
import { store } from './data/store';
import { prisma } from './prisma';

async function bootstrap() {
  console.log('====================================================');
  console.log('       THE VISA GATE — BACKEND REST API             ');
  console.log('       Your Journey. Our Guidance.                  ');
  console.log('====================================================');

  // Verify PostgreSQL connectivity
  await store.checkPostgres();

  // Bi-directional sync with Firebase Firestore for Offered Countries & Visa Programs
  await store.syncWithFirebase();

  const server = app.listen(config.port, () => {
    console.log(`[API] Server is listening on http://localhost:${config.port}`);
    console.log(`[API] Health check: http://localhost:${config.port}/health`);
    console.log(`[API] Base API: http://localhost:${config.port}${config.apiPrefix}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      try {
        await prisma.$disconnect();
      } catch {}
      console.log('Server terminated cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  console.error('Fatal bootstrapping error:', error);
  process.exit(1);
});
