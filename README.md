# Bibliotech (Gerenciador de biblioteca)

Aplicação web de gerenciamento de livros de uma biblioteca

## Para rodar a aplicação

### Requisitos

- **Docker**
- **Docker Compose**
- **Conta AWS Student**

### Execução

**OBS**: essa explicação é voltada principalmente para o contexto específico deste trabalho, que é rodar a aplicação possuindo uma conta AWS Student

1. Vá para o curso *AWS Academy Learner Lab*
2. Clique no módulo de iniciar os laboratórios de aprendizagem e inicie-o
3. Sem ir para a interface da AWS, clique em *AWS Detais*
4. Em *AWS CLI* clique em *Show* e guarde o `aws_access_key_id`, `aws_secret_access_key` e `aws_session_token`
5. Na raiz da aplicação, crie um arquivo `.env` preenchendo as variáveis da seguinte maneira
```
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
DB_PORT=...

AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...
```
6. Ainda na raiz da aplicação, execute `sudo docker compose up` ou `sudo docker-compose up` dependendo do ambiente de execução
7. Após alguns instantes a aplicação estará rodando no endereço *http://localhost:3000*

## Imposições sobre a aplicação

1. A aplicação deve:
    a. Continuar usando o serviço de banco de dados não-relacional da AWS (o **DynamoDB** ou **Amazon DocumentDB**) para armazenar e consultar as informações necessárias para a sua aplicação;
    b. Usar um serviço de **banco de dados relacional** gerenciado por você (Postgres ou MySQL) para persistir os dados antes armazenados no Amazon RDS;
    c. Usar o serviço **MinIO** para armazenar os arquivos antes armazenados no S3;
    d. Usar o **RabbitMQ** ou **Kafka** para substituir o SNS/SQS.
2. Usar **Dockerfile** para criar a imagem do **backend** da aplicação;
3. Usar **Dockerfile** para criar a imagem do **frontend** da aplicação;
4. Usar imagem do **Postgres ou MySQL** para executar o banco de dados relacional;
5. Usar imagem do **MinIO** para executar o serviço de armazenamento de arquivos;
6. Usar a imagem do **RabbitMQ ou Kafka** para executar o serviço de fila de mensagens;
7. Usar **Docker Compose** para configurar a execução e iniciar os serviços de backend, frontend, banco de dados relacional, serviço de fila de mensagens e armazenamento de arquivos.

## Pontuação do trabalho

### Setup de programas

- [ ] Usar o MinIO para escrita e leitura de arquivos (1,5 pontos: 0,5 container executando e 1,0 upload/download de arquivos funcionando na aplicação);
- [ ] Usar o banco de dados relacional gerenciado pela equipe (1,5 pontos: 0,5 para container do Postgres/MySQL executando e 1,0 para a aplicação se conectar e persistir dados);
- [ ] Usar o Rabbit ou Kafka para fila de mensagens (1,5 pontos: 0,5 container executando corretamente e 1,0 produção e consumo de mensagens funcionando);

### AWS

- [ ] Usar o banco de dados NoSQL para armazenamento e consulta (1 ponto);

### Dockerfile e Docker Compose

- [ ] Usar Dockerfile corretamente para criar as imagens do backend, worker e frontend da aplicação (1,5 pontos);
- [ ] Usar Docker Compose corretamente para configurar a execução de todos os serviços (1,5 pontos: 0,75 todos os serviços sobem via um único comando e 0,75 redes e dependências configuradas corretamente);

### Qualidade de entrega

- [ ] Documentação de uso no README do repositório (1,5 pontos: 1,0 instruções claras para executar o docker compose up e 0,5 para prints ou evidências de funcionamento);
- [ ] Atraso na entrega (-1 por dia);
- [ ] Qualidade da apresentação (slides, figuras, diagramas) e clareza na apresentação e resposta às perguntas (0 a -3).

### Pontuação extra (2 pontos)

- [ ] Subir o mesmo serviço no Kubernetes, utilizando Deployment e Services (NodePort e ClusterIP);
- [ ] Configurar variáveis de ambiente e usar credenciais/secrets no K8s de forma segura.