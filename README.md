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