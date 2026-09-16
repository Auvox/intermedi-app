// Backend unificado: não abre nem modifica o banco antigo do aplicativo.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const main = path.resolve(__dirname, '../../../intermedi-back-end/server.mjs');
import(pathToFileURL(main).href).catch((error) => {
  console.error('Inicie o servidor em intermedi-back-end com node server.mjs.', error.message);
  process.exitCode = 1;
});
