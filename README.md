# Configurando chaves AWS
É necessário conseguir as chaves do AWS CLI para preencher o seu .env. Para isso inicie uma sessão na AWS, clique em AWS Details e depois clique em Show do lado de AWS CLI.

# Para rodar a aplicação

```bash
docker compose up -d
docker exec -it soft_nuvem_trabalho_web-1 npx sequelize-cli db:create
docker exec -it soft_nuvem_trabalho_web-1 npx sequelize-cli db:migrate
```

# Para adicionar alguns livros para teste rapidamente
(este comando não deve ser executado no container):
```bash
node api_seeder.js
```