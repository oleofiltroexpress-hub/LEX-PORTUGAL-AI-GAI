/**
 * LEX PORTUGAL AI — Motor de Migrações Versionadas TursoDB / SQLite
 */

import { Client } from '@libsql/client';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface MigrationResult {
  success: boolean;
  applied: { version: number; name: string }[];
  alreadyApplied: { version: number; name: string }[];
  error?: string;
}

/**
 * Divide ficheiro SQL em declarações individuais ignorando comentários e linhas vazias
 */
export function parseSqlStatements(sqlContent: string): string[] {
  // Remove comentários de linha inteira
  const semComentarios = sqlContent
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  return semComentarios
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Executa todas as migrações pendentes num cliente de base de dados
 */
export async function runMigrations(
  client: Client,
  migrationsDir?: string
): Promise<MigrationResult> {
  const dir = migrationsDir || path.resolve(process.cwd(), 'src/server/db/migrations');

  if (!fs.existsSync(dir)) {
    return {
      success: false,
      applied: [],
      alreadyApplied: [],
      error: `Diretório de migrações não encontrado: ${dir}`,
    };
  }

  // 1. Garantir que a tabela schema_migrations existe
  await client.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      checksum TEXT NOT NULL
    );
  `);

  // 2. Consultar versões já aplicadas
  const appliedRows = await client.execute('SELECT version, name FROM schema_migrations ORDER BY version ASC');
  const appliedMap = new Map<number, string>();
  for (const row of appliedRows.rows) {
    appliedMap.set(Number(row.version), String(row.name));
  }

  // 3. Ler ficheiros de migração ordenados
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const appliedList: { version: number; name: string }[] = [];
  const alreadyAppliedList: { version: number; name: string }[] = [];

  for (const file of files) {
    const match = file.match(/^(\d+)_(.+)\.sql$/);
    if (!match) continue;

    const version = parseInt(match[1], 10);
    const name = match[2];

    if (appliedMap.has(version)) {
      alreadyAppliedList.push({ version, name });
      continue;
    }

    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const checksum = crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);

    const statements = parseSqlStatements(content);

    try {
      // Executar declarações da migração em lote
      for (const stmt of statements) {
        await client.execute(stmt);
      }

      // Registar a versão na tabela de controlo
      await client.execute({
        sql: 'INSERT INTO schema_migrations (version, name, checksum) VALUES (?, ?, ?)',
        args: [version, name, checksum],
      });

      appliedList.push({ version, name });
    } catch (err: any) {
      return {
        success: false,
        applied: appliedList,
        alreadyApplied: alreadyAppliedList,
        error: `Erro ao aplicar migração ${file}: ${err.message}`,
      };
    }
  }

  return {
    success: true,
    applied: appliedList,
    alreadyApplied: alreadyAppliedList,
  };
}
