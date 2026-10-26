import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { runMigrations, parseSqlStatements } from './migrate';
import fs from 'node:fs';
import path from 'node:path';

test('parseSqlStatements extrai declarações ignorando comentários', () => {
  const sql = `
    -- Comentário inicial
    CREATE TABLE foo (id INT);
    -- Outro comentário
    INSERT INTO foo VALUES (1);
  `;
  const stmts = parseSqlStatements(sql);
  assert.equal(stmts.length, 2);
  assert.equal(stmts[0], 'CREATE TABLE foo (id INT)');
  assert.equal(stmts[1], 'INSERT INTO foo VALUES (1)');
});

test('runMigrations aplica migrações com sucesso numa base de dados de teste isolada', async () => {
  const testDbPath = path.resolve(process.cwd(), 'data/test_migration.db');
  fs.mkdirSync(path.dirname(testDbPath), { recursive: true });
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  const client = createClient({ url: `file:${testDbPath}` });

  try {
    // 1. Primeira execução: deve aplicar a migração 001
    const resultado1 = await runMigrations(client);
    assert.equal(resultado1.success, true);
    assert.equal(resultado1.applied.length >= 1, true);
    assert.equal(resultado1.applied[0].version, 1);

    // 2. Verificar que as tabelas essenciais foram criadas
    const tablesRes = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC"
    );
    const tableNames = tablesRes.rows.map((r) => String(r.name));

    assert.equal(tableNames.includes('schema_migrations'), true);
    assert.equal(tableNames.includes('organizacoes'), true);
    assert.equal(tableNames.includes('utilizadores'), true);
    assert.equal(tableNames.includes('clientes'), true);
    assert.equal(tableNames.includes('processos'), true);
    assert.equal(tableNames.includes('prazos_processo'), true);
    assert.equal(tableNames.includes('fontes_juridicas'), true);
    assert.equal(tableNames.includes('minutas'), true);
    assert.equal(tableNames.includes('memorias'), true);
    assert.equal(tableNames.includes('registos_auditoria'), true);

    // 3. Segunda execução: idempotência (não deve reaplicar)
    const resultado2 = await runMigrations(client);
    assert.equal(resultado2.success, true);
    assert.equal(resultado2.applied.length, 0);
    assert.equal(resultado2.alreadyApplied.length >= 1, true);
  } finally {
    client.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  }
});
