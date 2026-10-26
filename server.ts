/**
 * LEX PORTUGAL AI — Servidor Full-Stack Express + Vite
 */

import express from 'express';
import path from 'node:path';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/routes/api';
import { getDbClient } from './src/server/db/client';
import { runMigrations } from './src/server/db/migrate';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = express();
  app.use(express.json());

  // 1. Inicializar base de dados TursoDB e executar migrações versionadas
  const dbClient = getDbClient();
  const migResult = await runMigrations(dbClient);
  if (migResult.success) {
    console.log(
      `[TursoDB] Migrações verificadas: ${migResult.applied.length} aplicadas, ${migResult.alreadyApplied.length} pré-existentes.`
    );
    // Garantir existência da organização padrão do escritório
    await dbClient.execute({
      sql: `INSERT OR IGNORE INTO organizacoes (id, nome, nif, morada, email_contacto)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        'org-porto-1',
        'Sociedade de Advogados Silva, Santos & Associados, RL',
        '502011475',
        'Avenida dos Aliados, n.º 100, 4000-064 Porto',
        'geral@silvasantos-advogados.pt',
      ],
    });

    // Semear fontes oficiais no acervo do TursoDB
    const { semearFontesOficiais } = await import('./src/server/rag/corpus');
    await semearFontesOficiais();
  } else {
    console.error(`[TursoDB] Falha nas migrações: ${migResult.error}`);
  }

  // 2. Registar rotas do Backend API
  app.use('/api', apiRouter);

  // 3. Montar Frontend (Vite em desenvolvimento / Estáticos em produção)
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Servidor] Modo de Desenvolvimento com vite.middlewares ativo.');
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Servidor] Modo de Produção com ficheiros estáticos de /dist.');
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[LEX PORTUGAL AI] Servidor operacional em http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[Servidor] Erro fatal no arranque:', err);
  process.exit(1);
});
