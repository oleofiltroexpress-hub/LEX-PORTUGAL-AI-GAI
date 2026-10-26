/**
 * LEX PORTUGAL AI — Cliente TursoDB / libSQL
 */

import { createClient, Client } from '@libsql/client';
import fs from 'node:fs';
import path from 'node:path';

let defaultClient: Client | null = null;

export interface DbConfig {
  url?: string;
  authToken?: string;
}

/**
 * Cria ou retorna cliente TursoDB/SQLite.
 * Se TURSO_DATABASE_URL e TURSO_AUTH_TOKEN estiverem definidos, conecta-se ao cluster Turso.
 * Caso contrário, utiliza base de dados local SQLite file:data/lex_portugal.db.
 */
export function getDbClient(config?: DbConfig): Client {
  if (config?.url) {
    return createClient({
      url: config.url,
      authToken: config.authToken,
    });
  }

  if (defaultClient) {
    return defaultClient;
  }

  const url = process.env.TURSO_DATABASE_URL || 'file:./data/lex_portugal.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Se for ficheiro local, garantir que a pasta data/ existe
  if (url.startsWith('file:')) {
    const filePath = url.replace('file:', '');
    const dir = path.dirname(path.resolve(process.cwd(), filePath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  defaultClient = createClient({
    url,
    authToken,
  });

  return defaultClient;
}

/**
 * Fecha a ligação do cliente por defeito
 */
export function closeDbClient(): void {
  if (defaultClient) {
    defaultClient.close();
    defaultClient = null;
  }
}
