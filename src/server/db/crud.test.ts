import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { runMigrations } from './migrate';
import fs from 'node:fs';
import path from 'node:path';

test('Operações CRUD no TursoDB/SQLite com integridade referencial e auditoria', async () => {
  const testDbPath = path.resolve(process.cwd(), 'data/test_crud.db');
  fs.mkdirSync(path.dirname(testDbPath), { recursive: true });
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  const client = createClient({ url: `file:${testDbPath}` });

  try {
    // 1. Executar migrações
    const mig = await runMigrations(client);
    assert.equal(mig.success, true);

    // 2. CREATE Organização
    await client.execute({
      sql: 'INSERT INTO organizacoes (id, nome, nif) VALUES (?, ?, ?)',
      args: ['org-1', 'Sociedade de Advogados do Porto, RL', '502011475'],
    });

    // 3. CREATE Cliente
    await client.execute({
      sql: `INSERT INTO clientes (id, organizacao_id, nome, tipo, nif, email, telefone, morada)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ['cli-1', 'org-1', 'Lusitânia Transportes, S.A.', 'coletivo', '509823145', 'geral@lusi.pt', '220000000', 'Porto'],
    });

    // READ Cliente
    const cliRes = await client.execute({
      sql: 'SELECT * FROM clientes WHERE id = ?',
      args: ['cli-1'],
    });
    assert.equal(cliRes.rows.length, 1);
    assert.equal(cliRes.rows[0].nome, 'Lusitânia Transportes, S.A.');
    assert.equal(cliRes.rows[0].nif, '509823145');

    // 4. CREATE Processo Judicial
    await client.execute({
      sql: `INSERT INTO processos (id, organizacao_id, numero_processual, tribunal, especie, ramo, cliente_id, cliente_nome, valor_causa, estado, fase_processual)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'proc-1',
        'org-1',
        '1420/24.8T8PRT',
        'Juízo Central Cível do Porto',
        'Ação Comum',
        'Direito Comercial',
        'cli-1',
        'Lusitânia Transportes, S.A.',
        148500.0,
        'ativo',
        'Articulados',
      ],
    });

    // READ Processo
    const procRes = await client.execute({
      sql: 'SELECT * FROM processos WHERE id = ?',
      args: ['proc-1'],
    });
    assert.equal(procRes.rows.length, 1);
    assert.equal(procRes.rows[0].numero_processual, '1420/24.8T8PRT');
    assert.equal(Number(procRes.rows[0].valor_causa), 148500.0);

    // 5. CREATE Prazo Processual
    await client.execute({
      sql: `INSERT INTO prazos_processo (id, processo_id, titulo, data_limite, tipo, urgente, cumprido, base_legal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ['prz-1', 'proc-1', 'Réplica', '2026-10-30', 'prazo_legal', 1, 0, 'Art. 584.º CPC'],
    });

    // UPDATE Prazo: Marcar como cumprido
    const agora = new Date().toISOString();
    await client.execute({
      sql: 'UPDATE prazos_processo SET cumprido = 1, cumprido_em = ?, cumprido_por = ? WHERE id = ?',
      args: [agora, 'Dr. Fernando Silva', 'prz-1'],
    });

    const prazoAtualizado = await client.execute({
      sql: 'SELECT * FROM prazos_processo WHERE id = ?',
      args: ['prz-1'],
    });
    assert.equal(Number(prazoAtualizado.rows[0].cumprido), 1);
    assert.equal(prazoAtualizado.rows[0].cumprido_por, 'Dr. Fernando Silva');

    // 6. CREATE Registo de Auditoria
    await client.execute({
      sql: `INSERT INTO registos_auditoria (id, organizacao_id, utilizador_nome, acao, entidade, detalhes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'aud-1',
        'org-1',
        'Dr. Fernando Silva',
        'Cumprimento de Prazo',
        'Prazo: Réplica',
        'Prazo 1420/24.8T8PRT cumprido com junção eletrónica no Citius.',
        'confirmado',
      ],
    });

    const audRes = await client.execute({
      sql: 'SELECT * FROM registos_auditoria WHERE organizacao_id = ?',
      args: ['org-1'],
    });
    assert.equal(audRes.rows.length, 1);
    assert.equal(audRes.rows[0].status, 'confirmado');

    // 7. DELETE e Integridade: Tentar eliminar cliente com processo associado (deve falhar por ON DELETE RESTRICT)
    await assert.rejects(
      async () => {
        await client.execute({
          sql: 'DELETE FROM clientes WHERE id = ?',
          args: ['cli-1'],
        });
      },
      /FOREIGN KEY constraint failed/i
    );
  } finally {
    client.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  }
});
