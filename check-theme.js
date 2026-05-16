const Database = require('better-sqlite3');
const db = new Database('rankify.db');

console.log('=== PÁGINAS E SEUS TEMAS ===');
const paginas = db.prepare('SELECT id, nome, slug, tema FROM paginas LIMIT 10').all();
paginas.forEach(p => {
  console.log(`ID: ${p.id}, Nome: ${p.nome}, Slug: ${p.slug}, Tema: "${p.tema}"`);
});

db.close();
