import pg from 'pg';

const passwordsToTry = ['Rafael@180', 'Rafael180', 'postgres'];
const ref = 'tteamknintqgqozapxoo';

async function testConnection() {
  console.log('Testando conexão PostgreSQL direta com Supabase...');

  const hosts = [
    `aws-0-sa-east-1.pooler.supabase.com`,
    `aws-0-us-east-1.pooler.supabase.com`,
    `aws-0-us-west-1.pooler.supabase.com`,
    `db.${ref}.supabase.co`,
  ];

  for (const host of hosts) {
    for (const pw of passwordsToTry) {
      const isPooler = host.includes('pooler');
      const user = isPooler ? `postgres.${ref}` : 'postgres';
      const port = isPooler ? 65432 : 5432;
      const connStr = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(pw)}@${host}:${port}/postgres?sslmode=require`;

      try {
        const client = new pg.Client({ connectionString: connStr, connectionTimeoutMillis: 4000 });
        await client.connect();
        console.log(`✅ CONECTADO COM SUCESSO!`);
        console.log(`  Host: ${host}`);
        console.log(`  Connection String válida: ${connStr}`);
        await client.end();
        return;
      } catch (err: any) {
        // console.log(`Falha em ${host} com ${pw}: ${err.message}`);
      }
    }
  }

  console.log('❌ Nenhuma combinação padrão conectou diretamente ao PostgreSQL do Supabase.');
}

testConnection();
