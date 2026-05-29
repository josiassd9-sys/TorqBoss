# Guia de Monetização, Firebase e Publicação - torqboss

Este guia detalha os passos necessários para transformar o torqboss em uma plataforma geradora de receita, saindo do ambiente de desenvolvimento para a produção real (Google Play Store).

---

## 1. Configuração do Firebase (Produção)
Para o app funcionar no celular dos usuários, você precisará de um projeto Firebase próprio:
1. **Console Firebase**: Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com).
2. **Registro do App**: Registre um app Android usando o ID do pacote (ex: `com.torqboss.app`).
3. **Download do `google-services.json`**: Coloque este arquivo na pasta `android/app/` do seu projeto no VS Code.
4. **Habilitar Recursos**:
   - **Authentication**: Ative o login por E-mail ou Google.
   - **Firestore**: Ative em modo produção e aplique as regras que estão no arquivo `firestore.rules`.
   - **Google Cloud Console**: Vincule o faturamento (Billing) no GCP para permitir chamadas externas (como a do Gemini).

---

## 2. Estratégia de Pagamento e Recebimento
Para o dinheiro cair na sua conta via CNPJ, você tem duas rotas principais:

### A. Google Play Billing (Recomendado para APK Nativo)
*Como funciona*: O usuário paga via Google Play e o Google repassa para sua conta (taxa de 15%).
1. **Google Play Console**: Crie uma conta de desenvolvedor ($25 taxa única).
2. **Perfil para Pagamentos**: No console, configure seu **Perfil para Pagamentos** informando seu **CNPJ** e **Dados Bancários**.
3. **Produtos In-App**: Crie produtos como "Créditos IA" ou "Assinatura PRO".
4. **Integração**: Use a biblioteca `react-native-billing` ou `capacitor-billing` no VS Code para processar as compras.

### B. Stripe (Recomendado para Web/PWA ou SaaS Direto)
*Como funciona*: Taxas menores (aprox. 4%), mas exige integração manual.
1. **Conta Stripe**: Crie uma conta em [stripe.com/br](https://stripe.com/br).
2. **Identidade**: Cadastre seu **CNPJ** e vincule sua **Conta Corrente** (Pessoa Jurídica preferencialmente para os 15-50k mensais).
3. **Webhooks**: Configure no servidor para o Stripe avisar ao torqboss quando o pagamento foi aprovado, liberando os créditos no Firebase automaticamente.

---

## 3. Checklist para Faturamento de R$ 50k+
Para escalar a esse nível, a infraestrutura deve ser profissional:
- **Segurança de Regras**: Garanta que as regras do Firestore impeçam usuários de "ganhar" créditos sem pagar (validando o recibo da Google Play no servidor).
- **Suporte ao Cliente**: Tenha um canal de e-mail profissional (ex: `suporte@torqboss.com.br`).
- **Análise de Dados**: Use o Google Analytics for Firebase para ver em que etapa o usuário desiste da compra.
- **Marketing**: Use o manual do app como ferramenta de venda, mostrando que o torqboss valoriza o carro em 5-10% na hora da revenda.

---

## 4. Passos para Publicação (Android Studio)
1. **Build no VS Code**: `npm run build` e depois `npx cap sync`.
2. **Android Studio**:
   - Abra a pasta `android` do projeto.
   - Gere o **Signed Bundle / APK** (Chave de Assinatura .jks).
   - **Importante**: Guarde essa chave em local seguro; sem ela, você nunca mais poderá atualizar o app.
3. **Play Store**: Suba o `.aab` para teste fechado, valide os bugs, e depois libere para produção.

---
*torqboss Financial Strategy - Preparado para Josias SD9.*
