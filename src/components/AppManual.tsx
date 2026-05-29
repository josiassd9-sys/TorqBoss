
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Car, 
  Cpu, 
  Fuel, 
  Settings, 
  Bell, 
  GalleryHorizontal, 
  BarChart3, 
  ShieldCheck, 
  Search,
  Sparkles,
  Wrench,
  Package,
  HeartPulse,
  CalendarClock,
  TrendingUp,
  ClipboardList,
  Share2,
  UserCog,
  Save,
  FileText,
  Activity,
  History,
  Globe,
  Link2,
  Key
} from 'lucide-react';

interface ManualItemProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const ManualItem: React.FC<ManualItemProps> = ({ title, icon, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 sm:p-6 transition-all hover:bg-gray-50/50 ${isOpen ? 'bg-gray-50/80 shadow-inner' : ''}`}
      >
        <div className="flex items-center gap-3 sm:gap-4 text-left">
          <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl shrink-0 ${isOpen ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
            {icon}
          </div>
          <span className={`text-[11px] sm:text-sm font-black uppercase tracking-tighter ${isOpen ? 'text-brand-primary' : 'text-gray-500'}`}>
            {title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={isOpen ? 'text-brand-primary' : 'text-gray-300'}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-5 sm:p-8 pt-0 text-[13px] sm:text-sm text-gray-600 leading-relaxed font-medium space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AppManual: React.FC = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
      <ManualItem
        title="Configurações Regionais: Adaptabilidade Internacional"
        icon={<Globe size={20} />}
        isOpen={openIndex === 0}
        onToggle={() => toggleIndex(0)}
      >
        <div className="space-y-4">
          <p>O torqboss foi projetado para ser um cidadão do mundo. Na aba <strong>Regional</strong> das configurações, você define como o aplicativo deve se comportar visualmente e tecnicamente de acordo com o seu país:</p>
          
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 space-y-3">
            <div>
              <h4 className="font-black text-blue-900 uppercase text-[10px] mb-1 tracking-widest">Rótulo do Identificador (Terminologia Local)</h4>
              <p className="text-[11px] text-blue-800/80">Este campo define como o app se refere à identificação principal do veículo. No <strong>Brasil</strong>, usamos "Placa", mas em <strong>Portugal</strong> ou <strong>Espanha</strong>, o termo correto é "Matrícula". Ao alterar este rótulo, todos os formulários e relatórios do sistema serão atualizados automaticamente.</p>
            </div>
            
            <div className="pt-2 border-t border-blue-200/50">
              <h4 className="font-black text-blue-900 uppercase text-[10px] mb-1 tracking-widest">Placeholder (Máscara de Visualização)</h4>
              <p className="text-[11px] text-blue-800/80">O "Placeholder" é o texto de fundo que aparece nos campos de entrada (efeito fantasma) para orientar o usuário. No Brasil, onde as placas têm 7 dígitos (padrão Mercosul ou antigo), usamos "AAA-0000" como guia. Em países com formatos diferentes, você pode definir um exemplo que faça sentido para sua região (ex: "ABC 12345" ou "12-AA-34").</p>
            </div>
          </div>

          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Idiomas Suportados:</strong> O torqboss agora fala 9 idiomas: Português, Inglês, Espanhol, Francês, Italiano, Alemão, Russo, Chinês e Coreano.</li>
            <li><strong>Símbolo Monetário e Regional:</strong> Customize a moeda (R$, €, $, etc.), o nome da sua agência/empresa e até a Referência de Mercado (Ex: Tabela FIPE ou KBB).</li>
            <li><strong>Subtítulo da Marca:</strong> Personalize o texto que aparece logo abaixo do logo principal. Por padrão é "Meu Carro Top", mas você pode mudar para algo que identifique melhor sua frota ou empresa.</li>
          </ul>
          
          <p className="text-[11px] italic font-bold text-gray-400">Essa flexibilidade permite que gestores de frota em qualquer continente utilizem o torqboss com a mesma precisão técnica e cultural.</p>
        </div>
      </ManualItem>

      <ManualItem
        title="Identidade Visual e Estilo Profissional"
        icon={<Settings size={20} />}
        isOpen={openIndex === 1}
        onToggle={() => toggleIndex(1)}
      >
        <div className="space-y-4">
          <p>O torqboss permite que você adeque a ferramenta à sua marca ou preferência pessoal com alto nível de sofisticação:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>20+ Paletas de Cores:</strong> Escolha entre temas como "Slate Professional", "Bordeaux Luxury", "Nordic Minimalism" ou "Graphite Tech". São tons selecionados para passar autoridade e clareza.</li>
            <li><strong>Nova Identidade Visual:</strong> O ícone oficial (Vetor de Pickup Tech) agora estampa o cabeçalho e relatórios, garantindo um visual moderno de "Fleet Management" de última geração.</li>
            <li><strong>Personalização de Cores e Sub-cards:</strong> Agora você pode alterar a cor de fundo do card principal do veículo e também definir cores customizadas para os **sub-cards** internos (como as métricas de Odômetro IA, Consumo Global, Valorização FIPE e as abas secundárias).</li>
          </ul>
        </div>
      </ManualItem>

      <ManualItem
        title="Guia de Início Rápido (Step-by-Step)"
        icon={<Sparkles size={20} />}
        isOpen={openIndex === 2}
        onToggle={() => toggleIndex(2)}
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-black text-brand-primary uppercase text-[10px] mb-2 tracking-widest">1. Cadastrando o Primeiro Veículo</h4>
            <p className="text-[11px] mb-2">Abra o app, clique no botão <strong>"+"</strong>. Digite a placa. O robô torqboss buscará os dados. Confirme marca e modelo. Salve. Pronto, seu veículo agora tem uma identidade digital.</p>
          </div>
          <div>
            <h4 className="font-black text-brand-primary uppercase text-[10px] mb-2 tracking-widest">2. O Primeiro Envio ao Mecânico</h4>
            <p className="text-[11px] mb-2">No cabeçalho do veículo, clique no ícone de <strong>Compartilhar (Share)</strong>. Selecione "Gerar Cartão do Veículo". Envie o arquivo ou link via WhatsApp para seu mecânico.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 italic text-[11px]">
            <strong>Cenário Real:</strong> Imaginemos que você está na recepção da oficina. Em vez de falar tudo de cor, você envia o cartão digital. O mecânico abre no torqboss dele e já sabe que sua última troca de correia foi há 20 mil km.
          </div>
        </div>
      </ManualItem>

      <ManualItem
        title="Protocolo do Mecânico: Do Recebimento à Entrega"
        icon={<UserCog size={20} />}
        isOpen={openIndex === 3}
        onToggle={() => toggleIndex(3)}
      >
        <p>Este é o fluxo de trabalho ideal para profissionais que buscam transparência:</p>
        <div className="space-y-4">
          <div className="border-l-2 border-brand-primary pl-4">
            <h5 className="font-black text-[10px] uppercase text-gray-800">A. Recebimento e Orçamento</h5>
            <p className="text-[11px]">O mecânico recebe o veículo no sistema. Ele clica em <strong>"Novo Orçamento"</strong>, cataloga as peças necessárias e envia o PDF/Arquivo de orçamento para aprovação do dono.</p>
          </div>
          <div className="border-l-2 border-brand-primary pl-4">
            <h5 className="font-black text-[10px] uppercase text-gray-800">B. Ordem de Serviço (OS)</h5>
            <p className="text-[11px]">Após aprovado, o orçamento vira uma OS. O mecânico anexa fotos das peças velhas e das novas para comprovar a execução.</p>
          </div>
          <div className="border-l-2 border-brand-primary pl-4">
            <h5 className="font-black text-[10px] uppercase text-gray-800">C. Devolução com Inteligência</h5>
            <p className="text-[11px]">Ao finalizar, o mecânico clica em <strong>"Concluir e Enviar"</strong>. O dono recebe o relatório final, clica em "Importar" no seu app e o KM do carro é atualizado automaticamente junto com o acervo de peças.</p>
          </div>
        </div>
      </ManualItem>

      <ManualItem
        title="Auditoria: Integridade do Documento"
        icon={<ShieldCheck size={20} />}
        isOpen={openIndex === 4}
        onToggle={() => toggleIndex(4)}
      >
        <p>Um histórico de manutenção só vale dinheiro se for íntegro. No torqboss, cada registro é "auditado" por tecnologia invisível:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Logs Forenses:</strong> Toda vez que um mecânico salva um serviço, o sistema registra silenciosamente o <strong>ID Único do Aparelho</strong>, a <strong>Data e Hora Exata</strong> e a <strong>Localização Geográfica</strong> (se habilitada).</li>
          <li><strong>Certificado de Origem:</strong> No relatório final, consta uma assinatura digital que prova que aquele documento foi gerado pelo sistema e não editado em um editor de texto comum.</li>
          <li><strong>Bloqueio de Retroatividade:</strong> O sistema impede que serviços sejam inseridos com datas ou quilometragens incoerentes sem deixar um aviso de "Divergência de Auditoria" no laudo final.</li>
        </ul>
      </ManualItem>

      <ManualItem
        title="Benefícios da Relação Dono x Mecânico"
        icon={<TrendingUp size={20} />}
        isOpen={openIndex === 5}
        onToggle={() => toggleIndex(5)}
      >
        <p>Por que usar este ecossistema em vez de papel e caneta?</p>
        <ul className="list-disc ml-6 space-y-3">
          <li><strong>Valorização na Venda:</strong> Um carro com "Laudo torqboss" pode valer até 15% mais no mercado de usados, pois elimina o medo do comprador sobre manutenções negligenciadas.</li>
          <li><strong>Liberdade de Escolha:</strong> Se você viajar e precisar de outra oficina, o novo mecânico lerá o QR Code do seu carro e saberá exatamente o que foi feito pelo mecânico anterior.</li>
          <li><strong>Garantia de Peças:</strong> O sistema te avisa quando uma peça trocada está chegando ao fim da garantia, permitindo que você acione a oficina a tempo.</li>
          <li><strong>Economia Real:</strong> Evite o "empurrometro". Com a Agenda Preditiva, você só troca o que realmente precisa, baseado no desgaste real e não no 'achismo'.</li>
        </ul>
      </ManualItem>

      <ManualItem
        title="Continuidade Técnica: O Legado para Futuros Mecânicos"
        icon={<History size={20} />}
        isOpen={openIndex === 6}
        onToggle={() => toggleIndex(6)}
      >
        <p>O torqboss foi projetado para que o conhecimento sobre o carro nunca se perca, independentemente de quantas vezes você trocar de oficina.</p>
        <ul className="list-disc ml-6 space-y-3">
          <li><strong>Facilitação para Novos Mecânicos:</strong> Quando um novo profissional assume o veículo, ele tem acesso imediato a todo o histórico de serviços, marcas de peças utilizadas e diagnósticos anteriores. Isso evita redundâncias e garante que ele comece o trabalho com clareza total.</li>
          <li><strong>Entendimento de Dificuldades:</strong> Relatórios detalhados permitem que o novo mecânico entenda possíveis dificuldades técnicas já enfrentadas no passado, facilitando a resolução de problemas recorrentes.</li>
          <li><strong>Transparência entre Oficinas:</strong> O histórico auditado serve como uma prova técnica da saúde do veículo, permitindo que diferentes profissionais colaborem indiretamente para a longevidade do automóvel.</li>
        </ul>
      </ManualItem>

      <ManualItem
        title="Agenda Preditiva: A Inteligência do Futuro"
        icon={<CalendarClock size={20} />}
        isOpen={openIndex === 7}
        onToggle={() => toggleIndex(7)}
      >
        <p>Como o torqboss sabe quando você deve ir à oficina?</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Cálculo de KM Médio:</strong> Ao registrar dois abastecimentos ou serviços com KM diferentes, o sistema entende seu padrão de uso.</li>
          <li><strong>Sugestão de Manutenção:</strong> Se o manual diz "trocar óleo a cada 10 mil km ou 1 ano", o torqboss cruza seu KM médio para te avisar 30 dias antes da data provável.</li>
          <li><strong>Estratégia de Custo:</strong> O sistema simula o gasto anual previsto, permitindo que você se planeje financeiramente para revisões pesadas (como correia dentada ou suspensão).</li>
        </ul>
      </ManualItem>

      <ManualItem
        title="Inteligência de Consumo"
        icon={<Fuel size={20} />}
        isOpen={openIndex === 8}
        onToggle={() => toggleIndex(8)}
      >
        <p>Análise profunda de eficiência energética e gastos operacionais.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Gráficos de Desempenho:</strong> Gráficos interativos que mostram a evolução do consumo de combustível (Km/L).</li>
          <li><strong>Custo Operacional:</strong> Cálculo automático de custo por quilômetro rodado, incluindo depreciação e manutenção.</li>
          <li><strong>Comparativo Inteligente:</strong> Saiba se seu modo de condução ou o combustível utilizado está impactando no bolso.</li>
        </ul>
      </ManualItem>

      <ManualItem
        title="Relatório Técnico Consolidado"
        icon={<FileText size={20} />}
        isOpen={openIndex === 9}
        onToggle={() => toggleIndex(9)}
      >
        <p>Transforme dados brutos em documentos profissionais e inteligência imediata.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Relatório para Venda:</strong> Gere um PDF elegante com todo o histórico de manutenção, valorizando o veículo na hora da negociação.</li>
          <li><strong>Auditoria e Alertas:</strong> Relatório consolidado de todas as inconsistências e itens pendentes de atenção.</li>
          <li><strong>Identidade da Sua Agência:</strong> Seus relatórios agora exibem o nome personalizado da sua agência definido nas configurações.</li>
        </ul>
      </ManualItem>

      <ManualItem
        title="Estratégia de Negócio e Gestão de Frota"
        icon={<TrendingUp size={20} />}
        isOpen={openIndex === 10}
        onToggle={() => toggleIndex(10)}
      >
        <p>Para lojistas e colecionadores, o torqboss atua como um ERP automotivo simplificado:</p>
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <h4 className="font-black text-green-700 uppercase text-[10px] mb-2 tracking-widest">Análise de ROI e Valuation</h4>
            <p className="text-[11px]">O sistema cruza o valor de compra, os custos de preparação (estética + mecânica) e o valor de mercado (FIPE) para te dar a margem de lucro real de cada unidade da frota.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h4 className="font-black text-gray-700 uppercase text-[10px] mb-2 tracking-widest">Fluxo de Reentrada (Pós-Oficina)</h4>
            <p className="text-[11px]">Ao receber o veículo do mecânico, o dono deve: <br/>
            1. Abrir o arquivo de importação enviado pelo profissional. <br/>
            2. Conferir se o KM final da OS bate com o painel do carro. <br/>
            3. Confirmar a importação para que os alertas de "Saúde" do veículo sejam resetados automaticamente.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h4 className="font-black text-gray-700 uppercase text-[10px] mb-2 tracking-widest">Relatório de Venda (Showroom)</h4>
            <p className="text-[11px]">Gere um laudo técnico para o novo comprador. Isso remove a barreira da desconfiança, pois ele verá que cada peça foi auditada com logs de data, hora e oficina responsável.</p>
          </div>
        </div>
      </ManualItem>

      <ManualItem
        title="Manual do Veículo IA: Extração Profissional"
        icon={<Sparkles size={20} />}
        isOpen={openIndex === 11}
        onToggle={() => toggleIndex(11)}
      >
        <p>Nossa IA de leitura de manuais foi atualizada para fornecer uma experiência de consultoria técnica completa, organizada e visual:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Estrutura em Acordeão:</strong> As informações são organizadas em abas como "Cronograma de Manutenção", "Notas Técnicas", "Especificações" e "Transcrição Completa".</li>
          <li><strong>Fusíveis e Símbolos do Painel:</strong> Agora a IA identifica e lista automaticamente a caixa de fusíveis e o significado de cada luz espia do painel.</li>
          <li><strong>Sistema de Notas e Legendas:</strong> O torqboss detecta condições repetitivas (Ex: "Somente para veículos turbo*") e organiza essas legendas em uma seção dedicada, evitando poluição visual.</li>
          <li><strong>Especificações de Fluidos:</strong> Identifique rapidamente o tipo exato de óleo, fluido de freio ou líquido de arrefecimento recomendado com precisão cirúrgica.</li>
        </ul>
      </ManualItem>

      <ManualItem
        title="Robô de Busca: Customização de Pesquisa"
        icon={<Link2 size={20} />}
        isOpen={openIndex === 12}
        onToggle={() => toggleIndex(12)}
      >
        <p>O <strong>Robô</strong> é o seu assistente de pesquisa externa. Na aba correspondente, você pode ensinar ao torqboss onde buscar informações sobre seus veículos:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Adicionar Links de Consulta:</strong> Insira URLs de portais de autopeças, sites de consulta de placas ou bancos de imagens.</li>
          <li><strong>Uso de Variáveis:</strong> Ao cadastrar um link, use a tag <code>{'{{VALOR}}'}</code>. O sistema substituirá automaticamente pela Placa/Matrícula do carro ao clicar no botão de busca.</li>
          <li><strong>Exemplo Prático (Peças):</strong> Cadastre o link <code>https://www.mercadolivre.com.br/veiculo/peças/&#123;&#123;VALOR&#125;&#125;</code>. Ao clicar na lupa no carro de placa "ABC1234", o robô abrirá o Mercado Livre já buscando peças para esse veículo.</li>
          <li><strong>Exemplo Prático (Imagens):</strong> Cadastre <code>https://www.google.com/search?q=&#123;&#123;VALOR&#125;&#125;+car+photos&tbm=isch</code> para encontrar fotos reais do modelo do seu carro instantaneamente.</li>
        </ul>
      </ManualItem>

      <ManualItem
        title="Inteligência Artificial: Configuração de Chave"
        icon={<Key size={20} />}
        isOpen={openIndex === 13}
        onToggle={() => toggleIndex(13)}
      >
        <p>O cérebro do torqboss depende de uma conexão com o <strong>Gemini (Google)</strong>. Veja como configurar:</p>
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 italic text-[11px]">
            <strong>Por que preciso de uma chave?</strong> A IA tem um custo operacional elevado. Ao inserir sua própria chave <strong className="text-amber-700">TOTALMENTE GRÁTIS</strong> do Google AI Studio, você garante que as funções de leitura de manuais e diagnósticos funcionam sem filas ou limites compartilhados.
          </div>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Onde conseguir:</strong> Vá em Configurações &gt; Chave API e clique no link do Google AI Studio. É grátis para uso pessoal.</li>
            <li><strong>Vantagem de ser PRO:</strong> Usuários com assinatura PRO podem usar sua própria chave, o que garante que o sistema nunca fique lento ou sem créditos para processamento de manuais.</li>
            <li><strong>Como instalar:</strong> Basta copiar a chave gerada lá e colá-la no campo "Chave API" dentro do app. O sistema validará se a chave é funcional imediatamente.</li>
            <li><strong>Exemplo de uso:</strong> Após salvar a chave, anexe o PDF do manual do seu carro. No card do veículo, surgirá o botão "IA Manual". Ali você pode perguntar qualquer coisa técnica e o robô responderá com precisão cirúrgica.</li>
          </ul>
        </div>
      </ManualItem>

      <ManualItem
        title="Segurança, Backup e Privacidade"
        icon={<ShieldCheck size={20} />}
        isOpen={openIndex === 14}
        onToggle={() => toggleIndex(14)}
      >
        <p>Seus dados são sagrados e estão sob seu total controle.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Dados Locais:</strong> Todas as informações são armazenadas via LocalStorage. Nada é enviado para nuvem externa sem sua ação direta.</li>
          <li><strong>Backup e Restauração:</strong> Gere um arquivo JSON com 100% dos dados da sua frota para migração rápida entre aparelhos.</li>
          <li><strong>Privacidade do Robô:</strong> Configure quais portais de busca o sistema deve utilizar para manter sua navegação eficiente.</li>
        </ul>
      </ManualItem>

      <ManualItem
        title="DNA Estrutural: Engenharia Reversa e Componentes OEM"
        icon={<Cpu size={20} />}
        isOpen={openIndex === 15}
        onToggle={() => toggleIndex(15)}
      >
        <p>A aba de <strong>DNA Estrutural</strong> do veículo disponibiliza dados de nível de engenharia para desmontabilidade e compatibilidade de materiais:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Engenharia Reversa IA:</strong> Acesse guias conceituais ilustrando pontos ideais de fixação técnica, evitando quebrar presilhas plásticas frágeis durante a manutenção de componentes do seu veículo.</li>
          <li><strong>Buscador de DNA Técnico:</strong> Filtre de forma organizada materiais construtivos (como polímeros de para-choques e painéis), torques descritos por normas de montagem e lógicas de sequenciamento lógico desmontável.</li>
          <li><strong>Fluxo de Montagem torqboss:</strong> Acompanhe as principais fases de construção conceitual, desde a estrutura pura (Body-in-White) e pintura de proteção (Paint & Coat) até a montagem final de acabamento.</li>
          <li><strong>Detalhamento Avançado:</strong> Especificações industriais consolidadas como Polímeros Ativos (ASTM D4000), Fixação Técnica (DIN 933) e Aerodinâmica para spoilers e vedações herméticas.</li>
        </ul>
      </ManualItem>

      <ManualItem
        title="Customização Fina de Estilo: Ajuste do Banner da Página Inicial"
        icon={<GalleryHorizontal size={20} />}
        isOpen={openIndex === 16}
        onToggle={() => toggleIndex(16)}
      >
        <p>O cabeçalho visual e o banner da sua página inicial podem ser configurados milimetricamente para um design sob medida. Vá em Configurações &gt; Estilo e utilize os refinamentos do Cabeçalho:</p>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-[11px] text-amber-800 font-bold mb-4">
          ⚠️ **Isolamento de Layout**: As configurações de visualização ajustadas nesta aba aplicam-se **única e exclusivamente ao cabeçalho/cardápio da Página Inicial**. Elas estão completamente isoladas das telas internas de detalhes do carro ou dos cartões individuais de garagem, permitindo flexibilidade estética sem poluir o visual corporativo sóbrio das áreas técnicas.
        </div>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Escala do Logotipo (Pickup):</strong> Controle o tamanho exato da pickup tech centralizada do banner da Home (de 50% a 200%). Esse ajuste de precisão afeta exclusivamente a entrada do aplicativo, mantendo os designs das imagens internas de veículos na Garagem intactos.</li>
          <li><strong>Altura do Banner:</strong> Controle fluido da altura de exibição do cabeçalho principal da página inicial.</li>
          <li><strong>Opacidade e Desfoque (Blur):</strong> Controle preciso da transparência de cor e do efeito desfocado fosco no fundo do banner.</li>
          <li><strong>Cor e Imagem Personalizada:</strong> Defina cores hexadecimais sólidas ou passe a URL direta de uma textura externa (como fibra de carbono ou aço escovado) para servir de plano de fundo do seu torqboss de forma profissional.</li>
        </ul>
      </ManualItem>
    </div>
  );
};
