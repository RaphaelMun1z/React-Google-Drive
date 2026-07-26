# Google Drive Frontend

Frontend React com TypeScript para o backend Spring Boot de armazenamento e compartilhamento de arquivos.

## Tecnologias

- React
- TypeScript
- Vite
- Context API
- React Router
- Axios
- React Hook Form
- Zod
- Lucide React
- Sonner

## Execução

```bash
cp .env.example .env
npm install
npm run dev
```

A API deve estar disponível em `http://localhost:8080` ou no endereço definido em `VITE_API_URL`.

## Funcionalidades

- Cadastro e login com JWT
- Persistência de sessão
- Criação, navegação, renomeação e exclusão de pastas
- Upload, listagem, download, renomeação e exclusão de arquivos
- Compartilhamento com permissão de leitura ou edição
- Listagem de arquivos compartilhados
- Visualização em grade e lista
- Pesquisa local na pasta atual
- Layout responsivo
