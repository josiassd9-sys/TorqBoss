# Lógica de Negócio e Mapa de Funcionalidades - FleetX

Este documento serve como a "Bússola de Desenvolvimento" para o FleetX, detalhando cada engrenagem do sistema para garantir que a visão original seja preservada em futuras evoluções.

---

## 1. Módulos do Painel Principal (Tabs)

### 🚗 Garagem (Veículos)
- **Função**: Centralizar a frota do usuário.
- **Lógica**: Utiliza o `VehicleContext` para gerenciar um array de objetos `Vehicle`. Cada veículo é único e identificado localmente.
- **Resultado**: Uma lista visual com cards interativos que mostram um resumo rápido (Marca, Modelo, Ano e KM).

### 🔧 Manutenção
- **Função**: Registrar e monitorar a saúde técnica do veículo.
- **Logica de Auditoria**: Cada registro gera um status de "Confiabilidade". Registros com foto da nota fiscal e KM exato recebem selo de "Verificado".
- **Categorias**: Filtros inteligentes que separam gastos por sistema (Motor, Câmbio, Suspensão, etc).

### ⛽ Combustível (Eficiência)
- **Função**: Controlar gastos e consumo energético.
- **Cálculo**: (KM Atual - KM Anterior) / Litros Abastecidos.
- **Resultado**: Gráficos de tendência de consumo e custo por quilômetro.

### 📚 Catálogo Inteligente de Peças
- **Função**: Banco de dados de peças instaladas e compatíveis.
- **Lógica e Preço Médio Regional**: Permite indexar o "Part Number" (Código Original) e os dados de compatibilidade da peça instalada. No futuro, permite que essas informações cruzem referências no mercado regional para estimar o preço médio justo.
- **Diferencial de Negócio**: Evita que o usuário compre peças incorretas ou pague valores inflacionados em emergências mecânicas. Ele serve como o guia definitivo de compras do proprietário.

### 🤖 Manual IA
- **Função**: Tradutor técnico de manuais PDF.
- **Processo**: O manual é enviado para o Gemini com um prompt especializado que estrutura a resposta em abas técnicas.
- **Resultado**: Informação mastigada sobre óleos, fusíveis e luzes de painel sem precisar folhear centenas de páginas.

---

## 2. Configurações Globais (Aba Regional e Estilo)

### 🌎 Localização e Idiomas
- **Multilinguagem**: O app suporta 9 idiomas. A troca de idioma no `SettingsModal` dispara o `i18n.changeLanguage()`.
- **Adaptabilidade de Placa**: A lógica de `vehicleIdentifierLabel` e `vehicleIdentifierPlaceholder` permite que o app mude de "Placa (AAA-0000)" para "Matrícula (00-AA-00)" instantaneamente, atendendo o mercado europeu e americano.

### 🎨 Design System Profissional
- **Paletas de Cores**: Oferecemos 20+ temas sofisticados (Slate, Bordeaux, Nordic, Graphite).
- **Consistência de Marca**: O ícone oficial da pickup tecnológica é injetado no `AppHeader` e nos PDFs de relatório.

---

## 3. Segurança e Fluxo de Dados

### 💾 Backup e Portabilidade
- **Exportação Total**: Agrupa todos os veículos em um único JSON criptografado/estruturado para migração de aparelhos.
- **Exportação Individual**: Gera um arquivo focado em um único carro, ideal para entregar ao novo dono na venda do veículo.

### 💳 Sistema de Créditos e Monetização
- **Fluxo**: Verificação de saldo no Firestore -> Chamada de IA -> Redução de crédito no Firestore.
- **Independência PRO**: Usuários PRO bypassam o sistema de créditos do servidor usando sua própria `GEMINI_API_KEY`, tornando o app uma ferramenta de custo zero para o desenvolvedor.

---

## 4. O Valor para o Usuário

- **Para o Motorista**: Tranquilidade de saber que o carro está revisado e ter provas documentais da manutenção para valorizar a revenda.
- **Para o Mecânico**: Uma ferramenta de transparência para mostrar ao cliente exatamente o que foi feito, com fotos e histórico auditável.

---
*Este guia deve ser consultado antes de qualquer tentativa de refatoração ou adição de novas tecnologias.*
