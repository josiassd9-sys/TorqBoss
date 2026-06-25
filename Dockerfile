# 1. Usa uma imagem oficial do Node.js estável
FROM node:20-alpine

# 2. Define o diretório de trabalho dentro do container
WORKDIR /app

# 3. Copia os arquivos de configuração de pacotes
COPY package*.json tsconfig.json ./

# 4. Instala todas as dependências (inclusive as de desenvolvimento para compilar o TypeScript)
# Usa --legacy-peer-deps para resolver conflito entre onnxruntime-web@1.26.0 e @imgly/background-removal que quer @1.21.0
RUN npm install --legacy-peer-deps

# 5. Copia o restante do código do projeto para o container
COPY . .

# 6. Declara o argumento de build (injetado via --build-arg no Cloud Build)
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

# 7. Compila o frontend do Vite (usa VITE_API_BASE) e o bundle do servidor
RUN npm run build

# 8. Expõe a porta que descobrimos no seu código
EXPOSE 3000

# 9. Comando para iniciar o servidor (usa o bundle compilado pelo esbuild)
CMD ["node", "dist/server.cjs"]