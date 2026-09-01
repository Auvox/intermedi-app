## Para Executar

1 - Instale o git caso não tenha, através do link abaixo.

[![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com)

2 - Instale o Node (ou atualize).

[![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)](https://nodejs.org/pt-br)

4 - Copie o seguinte comando abaixo para clonar o repositório para a sua maquina.

> git clone https://github.com/Auvox/intermedi-app.git

5 - Reinicialize o repositório git dentro da pasta intermedi-app

> cd intermedi-app
> git init

### Para desenvolvedores Full-Stack, Front End e Back end.

Você precisa executar os seguintes comandos, para rodar o Front-end (o app).

> npx expo start

### Possíveis erros podem ocorrer!

**Caso apareça a seguinte mensagem** 

`Need to install the following packages:
expo@57.0.18
Ok to proceed? (y)`

Você irá **precisar** discar a tecla "y" para que execute.

**Caso apareça a seguinte mensagem**

`ConfigError: Cannot determine the project's Expo SDK version because the module expo is not installed. Install it with npm install expo and try again.`

**Execute** o seguinte comando:

>npm install expo.

<p>Logo após você poderá executar o comando:</p>

> npx expo start

## Para desenvolvedores Back-End

6 - Antes de executar o programa, abra **OUTRO** cmd ou seu Terminal (acesse a) seguinte pasta e dê o comando, abaixo:

> cd intermedi-app

> cd backend

6 - Instale ou atualize o módulo SQLite.

> npm install sqlite3

7 - Gere o banco de dados antes de executar:

> npm run generate-bd

8 - Execute o servidor

> npm start
