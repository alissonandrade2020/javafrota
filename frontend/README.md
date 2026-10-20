# FrotaFlow Web — React + Vite + TypeScript

## Executar localmente

1. Inicie o backend Java em `http://localhost:8080`.
2. Nesta pasta (`frontend`), execute:

```bash
npm install
npm run dev
```

3. Acesse `http://localhost:4200`. O proxy do Vite encaminha `/api` para o backend.

## Build de produção

```bash
npm install
npm run build
npm run preview
```

O build final fica em `dist/`. No Docker, o Nginx serve os arquivos estáticos e faz proxy de `/api` para o serviço `backend`.
