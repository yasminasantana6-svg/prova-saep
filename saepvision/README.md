# SAEPVision

Sistema de compartilhamento de fotografias com autenticação, pesquisa, curtidas e cadastro de publicações.

## Estrutura de pastas

```text
saepvision/
├── public/
│   ├── css/
│   ├── images/
│   ├── js/
│   ├── uploads/
│   └── index.html
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── server.js
├── .env.example
├── database.sql
├── package.json
└── README.md
```

## Configuração do MySQL

1. Crie um banco MySQL local ou em um ambiente configurado.
2. Ajuste as variáveis do arquivo `.env` usando `.env.example` como base.
3. Execute o arquivo `database.sql` para criar as tabelas e dados iniciais.

Exemplo de `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=saepvision
PORT=3000
SESSION_SECRET=trocar-por-uma-chave-segura
```

## Instalação das dependências

```bash
npm install
```

## Iniciar o servidor

```bash
npm start
```

Para desenvolvimento:

```bash
npm run dev
```

## Usuários de demonstração

A aplicação fornece os seguintes usuários de teste após a execução do arquivo SQL:

- Usuário comum:
  - E-mail: usuario@teste.com
  - Senha: Senha@123
- Fotógrafo:
  - E-mail: fotografo1@teste.com
  - Senha: Senha@123

## Funcionalidades principais

- Login com autenticação segura por senha hash (bcrypt)
- Pesquisa por nome ou identificador do fotógrafo
- Galeria dinâmica com curtidas em tempo real
- Cadastro de fotografias para fotógrafos autenticados
- Exclusão de publicações próprias
- Sessão do usuário mantida com express-session

## Observação importante

Como este ambiente não inclui um servidor MySQL em execução, a validação de banco foi feita no código e na estrutura do projeto; para executar o sistema de ponta a ponta, é necessário subir o MySQL local e importar `database.sql` antes de iniciar a aplicação.
