# FleetX - Sistema de Gestão de Frotas e Manutenção Inteligente

## 📌 Visão Geral
O FleetX é uma aplicação de alta performance para gestão de veículos, focada em usuários avançados e mecânicos que buscam precisão e agilidade. O projeto segue a filosofia **LocalFirst**, garantindo que os dados do usuário nunca saiam do seu dispositivo sem permissão expressa.

---

## 🏗️ Arquitetura e Tecnologias
- **Frontend**: React 18 + Vite + TypeScript.
- **Estilização**: Tailwind CSS (Design System customizado com foco em contraste e elegância).
- **Animações**: Framer Motion (Transições fluidas e interfaces responsivas).
- **Persistência de Dados**: 
  - **Local**: `localStorage` (Dados de veículos, fotos e histórico).
  - **Cloud (Nuvem)**: Firebase Firestore + Auth (Apenas para sincronização de **Créditos IA** e **Status PRO**).
- **Backup**: Sistema proprietário de exportação de arquivos `.fleetx-backup` (JSON estruturado).

---

## 🚀 Funcionalidades Principais
1. **Gestão de Veículos**: Cadastro detalhado com identificação por placa/VIN, fotos e metadados.
2. **Consultoria IA**: Integração com Gemini 2.0 Flash para análise de manuais PDF, identificação de peças e suporte técnico.
3. **Carteira de Créditos**: Sistema sincronizado em tempo real via Firebase para consumo de tokens de IA.
4. **Modo PRO**: Desbloqueio de recursos avançados e uso de Chave API própria do usuário.
5. **Backups Diferenciados**: 
   - **Individual**: Compartilhamento de ficha técnica de um único carro.
   - **Total**: Backup completo de toda a frota e configurações.

---

## 🛠️ Próximos Passos (Roadmap para VS Code)
Para consolidar o projeto em um ambiente de desenvolvimento local (VS Code), recomendo focar em:
1. **Configuração PWA**: Implementar Service Workers para suporte offline completo e "Instalação" no celular.
2. **Otimização de Imagens**: Implementar compressão no client-side antes de salvar fotos no `localStorage` para evitar exceder o limite de 5MB do navegador (ou migrar para IndexedDB).
3. **Segurança Firebase**: Revisar as regras do `firestore.rules` (já implantadas, mas sempre bom auditar ao adicionar novos campos).
4. **Testes Unitários**: Criar suíte de testes para os cálculos de automação de manutenção no diretório `src/utils/calculations.ts`.

---

## ⚠️ DIRETRIZES DE MANUTENÇÃO (LEITURA OBRIGATÓRIA PARA IA)
> **Atenção Agente/Copilot/AI**: Você está proibido de realizar alterações estruturais sem consultar os seguintes princípios básicos deste app:

1. **LocalFirst por Padrão**: Nunca mude a lógica de salvar veículos para o Firebase sem que o usuário peça explicitamente. A privacidade é o diferencial deste app.
2. **Integridade de Créditos**: O consumo de créditos deve sempre passar pelo `consumeCredit()` no `FirebaseContext`. Não simule consumo local.
3. **Formato de Backup**: Nunca altere a estrutura do JSON de exportação sem atualizar a validação no `SettingsModal.tsx`. Arquivos `.fleetx-backup` devem ser incompatíveis com arquivos de veículos individuais para evitar corrupção de dados.
4. **Design System**: Mantenha a estética "FleetX" (fontes Mono, bordas arredondadas `2xl/3xl`, e animações de entrada `motion`).

---
*Documento gerado e validado em 21 de Maio de 2026.*
