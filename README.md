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