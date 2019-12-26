# drinksql-scripts
Exemplo de comunicação entre Hasura e Firebase

Acesse o diretório `functions` e abra o arquivo `index.js`. Nele haverá duas funções:

- `getCredential`:
  Esta função é chamada pelo Hasura para que o Firebase crie um token válido.
- `processSignUp`:
  Esta função é executada toda vez que um usuário é criado, e cria no Hasura um novo usuário.