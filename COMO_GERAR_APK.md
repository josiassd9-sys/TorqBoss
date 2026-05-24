# Guia Completo: Transformando o FleetX em App Híbrido (Android APK)

Este guia prático ensina o passo a passo completo para exportar este projeto para a sua máquina, configurá-lo no **VS Code**, sincronizá-lo com o **Capacitor** e compilar o arquivo **APK** nativo utilizando o **Android Studio**.

---

## 🎯 Entendendo a Arquitetura Híbrida do FleetX

O FleetX é um aplicativo **Full-Stack (Vite/React no Frontend + Express/Node no Backend)**.

*   No **Navegador (Web)**: Ambas as partes funcionam juntas debaixo da mesma máquina ou contêiner.
*   No **Celular (Híbrido)**: O React é compilado e encapsulado dentro do aplicativo utilizando um componente nativo chamado **WebView**. Ele roda de forma 100% offline e local no aparelho.
*   **O Desafio**: O servidor Express (`server.ts`) **não roda dentro do celular**. Por isso, todas as requisições que utilizam IA (as rotas que batem em `/api/...` para obter respostas do Gemini, consulta de placas, etc.) precisam se conectar com o seu servidor hospedado na nuvem (como a URL oficial do seu projeto no Cloud Run do AI Studio).

Este guia cobre a solução definitiva para esse fluxo funcionar perfeitamente de forma invisível.

---

## 🛠️ Passo 1: Preparando o seu Computador (Requisitos)

Antes de começar no VS Code, certifique-se de que sua máquina de desenvolvimento tem os seguintes programas instalados:

1.  **Node.js (LTS)**: Recomenda-se a versão 18 ou superior.
2.  **Visual Studio Code (VS Code)**.
3.  **Java JDK 17**: Versão obrigatória para compatibilidade com o Gradle moderno do Android Studio.
4.  **Android Studio**:
    *   No assistente de instalação, certifique-se de baixar o **Android SDK** correspondente (SDK 34 ou superior recomendado).
    *   No menu do SDK Manager do Android Studio, vá em *SDK Tools* e certifique-se de marcar as opções **Android SDK Command-line Tools** e **Android SDK Build-Tools**.

---

## 📥 Passo 2: Exportando o Projeto para o seu Computador

1.  Na barra superior ou lateral direita do **Google AI Studio Build**, clique no menu de **Configurações (Gear Icon)**.
2.  Clique em **Export** e selecione a opção **Export as ZIP**.
3.  Descompacte o arquivo `.zip` em uma pasta de sua preferência no seu computador.
4.  Abra essa pasta descompactada dentro do seu **VS Code**.

---

## 🔀 Passo 3: Ajustando o React para Chamar a API Remota (Crucial!)

Como as APIs do Gemini dependem do backend de forma segura, você precisará instruir o frontend do celular a buscar a API do seu servidor de produção em vez de uma rota interna relativa `/api/`.

### 1. Copie a URL de Produção do Aplicativo
Utilize a URL de desenvolvimento ou homologação da nuvem gerada para o seu aplicativo no AI Studio (exemplo que está no cabeçalho do seu chat):
`https://ais-pre-exgrcbouh4ydginh4gncxc-510605507081.us-west2.run.app`

### 2. Configure a URL Dinâmica
Abra o arquivo `src/services/geminiService.ts` no seu VS Code. Note que os `fetch()` de chamada da IA batem de forma relativa, exemplo:
```ts
const response = await fetch('/api/gemini/call', { ... });
```

Para que o celular saiba onde bater, altere de forma que ele utilize a URL de produção quando rodar nativo no aparelho.

**Uma solução limpa e elegante:**
Crie uma constante com sua URL de produção no início de `src/services/geminiService.ts` ou use variáveis de ambiente.

Exemplo de modificação inteligente:
```typescript
// Detecta se a aplicação está rodando embarcada no Capacitor (celular)
const isNativeApp = window.location.protocol === 'capacitor:';

// Insira aqui a URL pública gerada pelo AI Studio ou sua nuvem executável
const PRODUCAO_API_URL = 'SUA_URL_AQUI_PRODUCAO'; 

const API_BASE = isNativeApp ? PRODUCAO_API_URL : '';

// Agora, no seu fetch, use a constante API_BASE:
const response = await fetch(`${API_BASE}/api/gemini/call`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ method, args })
});
```

*(Faça o mesmo ajuste nas rotas `/api/gemini/settings` e similares do frontend para apontarem de forma consistente).*

---

## 🚀 Passo 4: Inicializando o Capacitor no VS Code

Abra o terminal do VS Code (`Ctrl + "` ou `Cmd + "`) e execute a sequência abaixo de comandos para baixar as dependências e criar o aplicativo físico:

```bash
# 1. Instale todas as dependências do projeto na máquina local
npm install

# 2. Faça o build otimizado de produção do React (Gera a pasta 'dist')
npm run build

# 3. Adicione a plataforma Android nativa do Capacitor ao projeto
npx cap add android
```

Este último comando criará uma pasta nativa chamada `android/` no seu diretório com toda a estrutura nativa de Gradle e Java!

---

## 📱 Passo 5: Sincronizando e Abrindo no Android Studio

Sempre que você alterar seu código em React no VS Code e quiser mandar essa atualização para o celular, você rodará esses comandos:

```bash
# 1. Recompila os arquivos do React para a pasta dist
npm run build

# 2. Copia a pasta 'dist' atualizada para o código-fonte nativo do Android
npx cap sync

# 3. Abre o projeto diretamente dentro do Android Studio
npx cap open android
```

O Android Studio irá abrir automaticamente carregando o seu app de forma imediata!

---

## 🛠️ Passo 6: Gerando o APK no Android Studio

Com o Android Studio aberto na tela principal do projeto carregado:

1.  **Aguarde a sincronização**: No canto inferior direito, o Android Studio fará o carregamento dos pacotes e build gradle (Gradle Sync). Aguarde a barra de progresso terminar (pode levar alguns minutos na primeira vez).
2.  **Verifique a internet**: No menu superior, abra a pasta `app > manifest > AndroidManifest.xml`. Certifique-se de que a permissão de internet está configurada (o Capacitor adiciona isso por padrão em aplicativos de desenvolvimento):
    ```xml
    <uses-permission android:name="android.permission.INTERNET" />
    ```
3.  **Gere o APK simples**:
    *   No menu superior do Android Studio, clique em **Build**.
    *   Vá em **Build Bundle(s) / APK(s)**.
    *   Clique em **Build APK(s)**.
4.  Pronto! Um pop-up surgirá no canto inferior direito dizendo: *“APK(s) generated successfully”*.
5.  Clique no link azul escrito **locate** neste balão. O programa abrirá o explorador de arquivos diretamente na pasta onde está o executável pronto do seu aplicativo:
    `app-debug.apk`

---

## 📥 Passo 7: Instalando no seu Aparelho

*   Pegue o arquivo `app-debug.apk` gerado e envie-o para o seu celular (você pode encaminhar pelo WhatsApp Web para você mesmo, fazer upload no Google Drive, ou conectar o celular no cabo USB e transferir).
*   Abra o gerenciador de arquivos do celular, procure pelo arquivo `.apk` e faça o clique de instalação. *(Se for a primeira vez instalando via gerenciador de arquivos, o Android poderá pedir permissão para "Instalar apps de fontes externas". Basta dar o sim e prosseguir)*.
*   Pronto! O ícone oficial do **Meu Carro Top** aparecerá na gaveta de aplicativos do seu Android, pronto para ser usado direto no hardware real!

---

## 🔌 Dica Turbo: Testar em Tempo Real via Wi-Fi (Sem precisar compilar toda hora)

Instalar o APK final é fantástico, mas se você quiser alterar o código no VS Code e já ver o resultado mudando instantaneamente no aparelho físico, você pode usar o recurso de **Live Reload**:

1.  Conecte seu celular ao computador no cabo USB com a **Depuração USB** habilitada.
2.  No terminal do VS Code, digite:
    ```bash
    npx cap run android -l --external
    ```
3.  O Capacitor detectará seu celular conectado e rodará um servidor local. O aplicativo abrirá imediatamente no celular, e qualquer detalhe visual que você alterar no VS Code será atualizado na tela dele simultaneamente.

---

### 🎉 Parabéns! Seu app está pronto para rodar em celulares em formato APK de altíssimo desempenho corporativo nativo!
