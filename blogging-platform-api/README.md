# Blogging Platform API

## Run application

```javascript
SET DEBUG=blogging-platform-api:* & pnpm start
```

## Generate Migrations

```shell
npx typeorm migration:generate .\src\migrations\$NAME -d .\src\configs\data-source.js -o --esm
```
