# Executar o app com o backend principal

1. Na pasta irmã `intermedi-back-end`, execute `node server.mjs` (Node.js 24+).
2. Nesta pasta, execute `npm install` e `npm start`.
3. No celular, use a mesma rede do computador do Expo e do backend.

O app usa somente o backend principal. Login verifica e-mail e senha, e o perfil
permite editar dados, enviar foto e excluir a própria conta do cadastro compartilhado.
O endereço e a senha existentes são preservados quando não são enviados na edição.
Senhas não são devolvidas ao aplicativo. Sair limpa a sessão; “lembre de mim” controla
a persistência local. Sessões anteriores a esta integração exigem novo login.

Em desenvolvimento local, a API usa o host do Expo e a porta 3000, evitando editar
IPs no código ao trocar de rede. No navegador usa o host da página. Para backend em
outra máquina, Expo por túnel ou app instalado, copie `.env.example` para `.env` e
configure `EXPO_PUBLIC_API_URL` com um endereço acessível pelo dispositivo. Reinicie
o Expo após mudar `.env`; builds instalados precisam incorporar a configuração.
`0.0.0.0` é o endereço de escuta do servidor, não uma URL de acesso para o celular.

A pasta `backend` é legada. Seu comando de inicialização agora encaminha para
`../intermedi-back-end/server.mjs`. Não execute dois servidores na porta 3000.
Os arquivos antigos foram preservados como referência; o app não usa o banco dessa
pasta. Nenhum registro ou foto antigos foi importado ou apagado automaticamente.

Para validar o código: `npx tsc --noEmit` e `npm run lint`.
Para validar o backend sem dados reais: execute
`node --test tests/app.integration.test.mjs` no repositório principal.
