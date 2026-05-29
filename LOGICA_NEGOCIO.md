# Lógica de Negócio e Mapa de Funcionalidades - torqboss

Este documento serve como a "Bússola de Desenvolvimento" para o torqboss, detalhando cada engrenagem do sistema para garantir que a visão original seja preservada em futuras evoluções.

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

### 🧬 DNA Estrutural (Visualização OEM e Componentes)
- **Função**: Mapear as especificações de engenharia de chassi, fixações e materiais do veículo para desmontagens seguras e rastreio industrial.
- **Lógica**: Centraliza esquemas de desmontagem OEM com foco em engenharia reversa para prever presilhas e encaixes ocultos por sistema de torque, acabamento (Trim) e pintura.
- **Valor**: Reduz o custo com peças quebradas por técnicos ou proprietários durante procedimentos de desmontagem ou personalização estética.

---

## 2. Configurações Globais (Aba Regional e Estilo)

### 🌎 Localização e Idiomas
- **Multilinguagem**: O app suporta 9 idiomas. A troca de idioma no `SettingsModal` dispara o `i18n.changeLanguage()`.
- **Adaptabilidade de Placa**: A lógica de `vehicleIdentifierLabel` e `vehicleIdentifierPlaceholder` permite que o app mude de "Placa (AAA-0000)" para "Matrícula (00-AA-00)" instantaneamente, atendendo o mercado europeu e americano.
- **Subtítulo Personalizável**: Permite ao dono da agência mudar a frase "Meu Carro Top" para algo como "— Gestão e Performance" ou "— Frota Segura", mantendo a flexibilidade da marca.

### ⚖️ Política de Naming e Marca
- **torqboss**: Registrado como o nome oficial do motor do sistema. Não deve ser renomeado.
- **Identidade Corporativa**: Cabeçalhos técnicos utilizam cinza escuro sólido para manter a seriedade, enquanto o banner da home permite ousadia estética.

### 🎨 Design System Profissional e Customização de Banner
- **Paletas de Cores**: Oferecemos 20+ temas sofisticados (Slate, Bordeaux, Nordic, Graphite).
- **Consistência de Marca**: O ícone oficial da pickup tecnológica é injetado no `AppHeader` (página inicial) e nos PDFs de relatório.
- **Configurações Finas do Banner (Exclusivo da Página Inicial)**: Painel de ajuste cirúrgico que controla a estética do banner superior principal, de forma totalmente independente dos cards e do cabeçalho de detalhes dos veículos (que preservam o visual corporativo original dos detalhes). **Essas propriedades não devem em nenhum momento se misturar ou afetar outros componentes do app para evitar poluição visual e confusão no uso técnico:**
  - *Escala do Logotipo (`iconScale`)*: Permite ajustar o tamanho exato da pickup centralizada do banner da Home (50% a 200%).
  - *Altura do Banner (`bannerHeight`)*: Controle fluido da área de destaque (120px a 240px).
  - *Opacidade (`bgOpacity`)*: Determina o nível de transparência da cor de fundo (0% a 100%).
  - *Efeito Blur (`bgBlur`)*: Adiciona um efeito fosco/desfocado de fundo ao banner principal.
  - *Background Customizado*: Permite definir cores hexadecimais sólidas ou carregar imagens de textura personalizadas.

---

## 3. Segurança e Fluxo de Dados

### 💾 Backup e Portabilidade
- **Exportação Total**: Agrupa todos os veículos em um único JSON criptografado/estruturado para migração de aparelhos.
- **Exportação Individual**: Gera um arquivo focado em um único carro, ideal para entregar ao novo dono na venda do veículo.

### 💳 Sistema de Créditos e Monetização
- **Fluxo**: Verificação de saldo no Firestore -> Chamada de IA -> Redução de crédito no Firestore.
- **Independência PRO**: Usuários PRO bypassam o sistema de créditos do servidor usando sua própria `GEMINI_API_KEY`, tornando o app uma ferramenta de custo zero para o desenvolvedor.
- **Sandbox Developer Override**: Josias (Admin) tem acesso a um toggle nas configurações que permite ativar o status PRO localmente para validar funcionalidades sem realizar pagamentos reais, garantindo a velocidade dos testes.

---

## 4. O Valor para o Usuário
- **Experiência Limpa**: O aplicativo não traz veículos de teste por padrão. Isso evita a sensação de "bloatware" e respeita o espaço do usuário, que começa sua garagem do zero.
- **Para o Motorista**: Tranquilidade de saber que o carro está revisado e ter provas documentais da manutenção para valorizar a revenda.
- **Para o Mecânico**: Uma ferramenta de transparência para mostrar ao cliente exatamente o que foi feito, com fotos e histórico auditável.

---
*Este guia deve ser consultado antes de qualquer tentativa de refatoração ou adição de novas tecnologias.*
