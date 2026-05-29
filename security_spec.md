# Especificação de Segurança e Integridade - torqboss

## 1. Arquitetura de Dados e Invariantes
- **Soberania do Usuário**: Fichas de veículos e históricos residem no `localStorage`. A segurança aqui é garantida pelo isolamento do navegador.
- **Sincronização de Perfil**: Documentos em `/users/{userId}` no Firestore são acessíveis apenas pelo próprio `userId`.
- **Integridade de Créditos IA**: O campo `aiCredits` deve ser um número inteiro não-negativo.
- **Status PRO**: O campo `isProMember` é controlado estritamente via lógica de upgrade e validado por regras de servidor.
- **LocalFirst Compliance**: O aplicativo deve recusar qualquer tentativa de envio automático de dados de frota para nuvem, a menos que disparado por uma ação de "Backup Cloud" futura (não implementada).

## 2. Vetores de Ataque e Proteções (The Dirty Dozen)
1. **Injeção de Créditos**: Usuário tenta alterar `aiCredits` diretamente no Firestore sem consumir o gatilho de transação.
2. **Escalação de Privilégios**: Tentativa de marcar `isProMember: true` sem o fluxo de validação.
3. **Roubo de Identidade**: Usuário A tentando ler as chaves de API/Configurações do Usuário B.
4. **Envenenamento de Tipo**: Tentar enviar strings para campos numéricos de créditos.
5. **Acesso Anônimo**: Tentativa de consumir recursos de IA sem estar autenticado no Firebase.
6. **Estouro de Armazenamento Local**: Scripts maliciosos tentando lotar o `localStorage` com dados lixo.
7. **Manipulação de Backup**: Edição manual de arquivos `.torqboss-backup` para injetar scripts XSS que seriam executados ao importar o backup.
8. **Spoofing de Marca**: Alteração de nomes de agência no relatório PDF para simular certificados falsos.
9. **Excesso de Requisições (DDoS Consultivo)**: Milhares de chamadas seguidas à API do Gemini para esgotar créditos.
10. **Inconsistência de Moeda**: Tentar realizar cálculos financeiros misturando moedas diferentes no mesmo veículo.
11. **Apagamento de Auditoria**: Tentativa de remover o hash de integridade de um registro de manutenção.
12. **Injeção de Script em Manuais**: PDFs maliciosos projetados para extrair dados da sessão quando processados pela IA.

## 3. Protocolo de Validação
- **Regras de Firestore**: Devem ser auditadas trimestralmente ou a cada nova feature de nuvem.
- **Sanitização de Importação**: Todo arquivo de backup deve ser validado estruturalmente antes de ser mergeado ao estado local.
- **Isolamento de API Key**: Chaves de usuário PRO nunca são gravadas no Firestore, apenas consumidas em runtime ou armazenadas localmente se necessário.

---
*torqboss Security Protocol - Version 1.1*
