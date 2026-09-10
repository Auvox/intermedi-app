const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
test('alterar email, excluir e reutilizar CPF', async () => {
 const memory = new DatabaseSync(':memory:');
 memory.exec(fs.readFileSync(path.join(__dirname, '../database/intermedi.sql'), 'utf8'));
 class Database {
  constructor(p, cb) { cb(null); }
  serialize(cb) { cb(); }
  run(sql, params = [], cb) {
   if (typeof params === 'function') { cb = params; params = []; }
   try { const r = memory.prepare(sql).run(...params); cb?.call({ changes: Number(r.changes), lastID: Number(r.lastInsertRowid) }, null); }
   catch(e) { e.code = 'SQLITE_CONSTRAINT'; if (cb) cb(e); else throw e; }
  }
  all(sql, params, cb) { try { cb(null, memory.prepare(sql).all(...params)); } catch(e) { cb(e); } }
  get(sql, params, cb) { try { cb(null, memory.prepare(sql).get(...params)); } catch(e) { cb(e); } }
 }
 const data = { exports: {} };
 const quiet = { log() {}, error() {} };
 const root = path.join(__dirname, '../src');
 vm.runInNewContext(fs.readFileSync(path.join(root, 'data/pacientes.js'), 'utf8'), {
  require: n => n === 'sqlite3' ? { verbose: () => ({ Database }) } : n === 'fs' ? { existsSync: () => true } : require(n),
  module: data, __dirname: root, console: quiet
 });
 const routes = {};
 const router = Object.fromEntries(['post','put','delete'].map(method => [method, (url,...handlers) => { routes[method + url] = handlers; }]));
 const multer = Object.assign(() => ({ single: () => () => {} }), { diskStorage: () => ({}) });
 for (const file of ['authRoutes.js', 'patientRoutes.js']) vm.runInNewContext(fs.readFileSync(path.join(root, 'routes',file),'utf8'), {
  require: n => n === 'express' ? { Router: () => router } : n === '../data/pacientes' ? data.exports : n === 'multer' ? multer : n === 'fs' ? { existsSync: () => true } : require(n),
  module: { exports: {} }, __dirname: root, console: quiet
 });
 async function call(key, body, id = 1) {
  const req = { body, params: { id: String(id) } };
  const res = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, end() {} };
  for (const handler of routes[key]) { let next = false; await handler(req,res,() => { next = true; }); if (!next) break; }
  return res;
 }
 try {
  const account = { nomePaciente: 'Teste', emailPaciente: 'old@example.test', cpfPaciente: '12345678901', senhaPaciente: 'secret' };
  assert.equal((await call('post/register', account)).code, 201);
  assert.equal((await call('post/register', account)).code, 409);
  const login = await call('post/login',{ email: account.emailPaciente, senha: 'secret' });
  assert.equal(login.body.user.cpf, account.cpfPaciente);
  assert.equal('senhaPaciente' in login.body.user, false);
  assert.equal((await call('delete/:id',{ senhaAtual: 'wrong' })).code, 401);
  assert.equal((await call('post/:id/perfil',{ senhaAtual: 'secret' })).code, 200);
  assert.equal((await call('put/:id',{ nome: 'Teste', cpf: account.cpfPaciente, telefone: '', email: 'new@example.test', remedioFrequente: '', senha: '', senhaAtual: 'secret' })).code, 200);
  assert.equal((await call('post/login',{ email: account.emailPaciente, senha: 'secret' })).code, 401);
  assert.equal((await call('post/login',{ email: 'new@example.test', senha: 'secret' })).code, 200);
  assert.equal((await call('delete/:id',{ senhaAtual: 'secret' })).code, 204);
  assert.equal((await call('post/login',{ email: 'new@example.test', senha: 'secret' })).code, 401);
  assert.equal((await call('post/register',account)).code, 201);
 } finally { memory.close(); }
});
