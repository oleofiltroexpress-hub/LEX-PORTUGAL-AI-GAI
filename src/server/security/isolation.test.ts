import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { temPermissao, validarAcessoProcesso, UserSession } from './auth';
import { runMigrations } from '../db/migrate';
import fs from 'node:fs';
import path from 'node:path';

test('temPermissao aplica regras de RBAC estritas para cada perfil', () => {
  // Admin tem tudo
  assert.equal(temPermissao('admin', 'manage_organization'), true);
  assert.equal(temPermissao('admin', 'delete_case'), true);

  // Advogado pode editar e apagar casos, mas não alterar a organização
  assert.equal(temPermissao('advogado', 'write_case'), true);
  assert.equal(temPermissao('advogado', 'delete_case'), true);
  assert.equal(temPermissao('advogado', 'manage_organization'), false);

  // Estagiário pode consultar e redigir minutas, mas NUNCA apagar nem alterar processos judiciais
  assert.equal(temPermissao('estagiario', 'read_case'), true);
  assert.equal(temPermissao('estagiario', 'draft_pleadings'), true);
  assert.equal(temPermissao('estagiario', 'write_case'), false);
  assert.equal(temPermissao('estagiario', 'delete_case'), false);
  assert.equal(temPermissao('estagiario', 'manage_clients'), false);
});

test('validarAcessoProcesso impede acesso cruzado entre organizações (Cross-Process Isolation)', async () => {
  const testDbPath = path.resolve(process.cwd(), 'data/test_isolation.db');
  fs.mkdirSync(path.dirname(testDbPath), { recursive: true });
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  const client = createClient({ url: `file:${testDbPath}` });

  try {
    // 1. Aplicar migrações na base de dados de teste
    await runMigrations(client);

    // 2. Criar duas organizações distintas
    await client.execute({
      sql: 'INSERT INTO organizacoes (id, nome, nif) VALUES (?, ?, ?)',
      args: ['org-porto', 'Sociedade do Porto, RL', '501000001'],
    });
    await client.execute({
      sql: 'INSERT INTO organizacoes (id, nome, nif) VALUES (?, ?, ?)',
      args: ['org-lisboa', 'Sociedade de Lisboa, RL', '502000002'],
    });

    // 3. Criar clientes em cada organização
    await client.execute({
      sql: 'INSERT INTO clientes (id, organizacao_id, nome, tipo, nif) VALUES (?, ?, ?, ?, ?)',
      args: ['cli-1', 'org-porto', 'Cliente do Norte', 'coletivo', '509000001'],
    });
    await client.execute({
      sql: 'INSERT INTO clientes (id, organizacao_id, nome, tipo, nif) VALUES (?, ?, ?, ?, ?)',
      args: ['cli-2', 'org-lisboa', 'Cliente do Sul', 'coletivo', '509000002'],
    });

    // 4. Criar processo confidencial da Organização Porto
    await client.execute({
      sql: `INSERT INTO processos (id, organizacao_id, numero_processual, tribunal, especie, ramo, cliente_id, cliente_nome, estado, fase_processual)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'proc-porto-confidencial',
        'org-porto',
        '100/26.0T8PRT',
        'Comarca do Porto',
        'Comum',
        'Direito Civil',
        'cli-1',
        'Cliente do Norte',
        'ativo',
        'Articulados',
      ],
    });

    // Sessão do Advogado do Porto (Legítimo)
    const advogadoPorto: UserSession = {
      id: 'adv-porto-1',
      organizacaoId: 'org-porto',
      nome: 'Dr. Fernando Silva',
      email: 'porto@adv.pt',
      role: 'advogado',
    };

    // Sessão do Advogado de Lisboa (Tentativa de acesso indevido de outra firma)
    const advogadoLisboa: UserSession = {
      id: 'adv-lisboa-1',
      organizacaoId: 'org-lisboa',
      nome: 'Dra. Ana Santos',
      email: 'lisboa@adv.pt',
      role: 'advogado',
    };

    // Sessão de Estagiário do Porto
    const estagiarioPorto: UserSession = {
      id: 'estag-porto-1',
      organizacaoId: 'org-porto',
      nome: 'João Estagiário',
      email: 'estag@adv.pt',
      role: 'estagiario',
    };

    // TESTE A: Advogado da organização Porto acede com sucesso
    const acessoLegitimo = await validarAcessoProcesso(client, advogadoPorto, 'proc-porto-confidencial', 'leitura');
    assert.equal(acessoLegitimo.permitido, true);

    // TESTE B: Tentativa de acesso cruzado de advogado de Lisboa deve ser BLOQUEADA
    const acessoIndevido = await validarAcessoProcesso(client, advogadoLisboa, 'proc-porto-confidencial', 'leitura');
    assert.equal(acessoIndevido.permitido, false);
    assert.match(acessoIndevido.motivo || '', /isolamento/i);

    // TESTE C: Estagiário tenta apagar o processo -> deve ser BLOQUEADO pelo perfil de permissões
    const estagiarioApaga = await validarAcessoProcesso(client, estagiarioPorto, 'proc-porto-confidencial', 'eliminacao');
    assert.equal(estagiarioApaga.permitido, false);
    assert.match(estagiarioApaga.motivo || '', /permissão/i);
  } finally {
    client.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  }
});
