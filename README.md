# dorm-admin-riak
Test riak database

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Запустити Riak у Docker (швидко):
```
docker run -d --name riak -p 8087:8087 -p 8098:8098 basho/riak-kv
```
Порти: 8087 — Protocol Buffers API (для basho client), 8098 — HTTP API.

## Загальна модель даних у Riak
Riak не підтримує joinʼи, тому структури зберігаються так:

📌 Dormitory

Bucket name: dormitories
```
{
  id: string;
  name: string;
  address: string;
  rooms: string[]; // масив ID кімнат
}
```
📌 Room

Bucket name: rooms
```
{
  id: string;
  dormitoryId: string;
  number: string;
  capacity: number;
  residents: string[]; // ID мешканців
}
```
📌 Resident

Bucket name: residents
```
{
  id: string;
  roomId: string;
  fullName: string;
  age: number;
}
```

## Варіант через докер компус
Riak:
- Піднімається офіційний образ basho/riak-kv.
- Порти 8087 (для Node.js client) та 8098 (HTTP API).
- Є healthcheck, щоб NestJS не стартував, поки база не готова.
- Дані зберігаються у volume riak_data.

NestJS (app):
- Будується з локального Dockerfile.
- depends_on з condition: service_healthy гарантує, що сервіс чекає Riak.
- Змінна RIAK_NODES=riak:8087 передається в NestJS через ConfigService.
- Монтується код локально (.:/usr/src/app) для hot reload при dev.

Команда для старту:
```
docker-compose up --build
```