# 1. Usa uma imagem oficial do Node.js estável
FROM node:20-alpine

# 2. Define o diretório de trabalho dentro do container
WORKDIR /app

# 3. Copia os arquivos de configuração de pacotes
COPY package*.json tsconfig.json ./

# 4. Instala todas as dependências (inclusive as de desenvolvimento para compilar o TypeScript)
RUN npm install

# 5. Copia o restante do código do projeto para o container
COPY . .

# 6. Compila o frontend do Vite e prepara o build de produção
RUN npm run build

# 7. Expõe a porta que descobrimos no seu código
EXPOSE 3000

# 8. Comando para iniciar o servidor
CMD ["npx", "ts-node", "server.ts"]