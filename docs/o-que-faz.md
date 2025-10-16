# O que faz o OpenContracts?

![OpenContracts](assets/images/logos/OS_Legal_Logo.png)

## Resumo Executivo

O **OpenContracts** é uma plataforma **gratuita e de código aberto** para análise e gestão de documentos empresariais, especialmente projetada para colocar os proprietários do conhecimento e especialistas no assunto no controle de suas informações. A plataforma armazena documentos em um formato acessível e exportável, e os torna compatíveis com fluxos de trabalho emergentes e técnicas baseadas em agentes de IA.

## Funcionalidades Principais

### 1. 📄 Gestão de Documentos
- **Organização por Coleções**: Organize documentos em coleções chamadas `Corpus` com permissões detalhadas
- **Suporte Multi-formato**: Atualmente suporta PDF e formatos baseados em texto (como txt, markdown)
- **Arquitetura Plugável**: Sistema modular para adicionar novos formatos de documento facilmente

### 2. 🏗️ Esquemas de Metadados Personalizados
- **Campos Estruturados**: Defina campos de metadados com validação para coleta consistente de dados
- **12 Tipos de Dados Suportados**: STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATE, DATETIME, URL, EMAIL, CHOICE, MULTI_CHOICE, JSON
- **Validação Automática**: Sistema de validação robusto com regras personalizáveis
- **Interface Amigável**: Interface intuitiva para entrada e gestão de metadados

### 3. 🔍 Análise Automática de Layout
- **Parser Moderno**: Extrai automaticamente características de layout de PDFs usando pipelines de análise modernos
- **Integração Docling**: Suporte completo para processamento de documentos via Docling
- **Coordenadas Precisas**: Mapeia texto para coordenadas x-y precisas nos documentos

### 4. 🧠 Embeddings Vetoriais Automáticos
- **Busca Semântica**: Geração automática de embeddings vetoriais para documentos carregados
- **pgvector**: Powered by pgvector para armazenamento eficiente de embeddings
- **Busca Inteligente**: Combina metadados estruturados com busca semântica avançada

### 5. 🤖 Arquitetura de Analisadores Plugáveis
- **Microserviços Personalizados**: Implante microserviços customizados para analisar documentos
- **Anotação Automática**: Analisadores podem anotar documentos automaticamente
- **Framework Moderno**: Baseado em tarefas Celery para processamento assíncrono
- **Fácil Extensão**: Interface clara para criar novos analisadores

### 6. 🖊️ Interface de Anotação Humana
- **Anotação Manual**: Interface intuitiva para anotar documentos manualmente
- **Anotações Multi-página**: Suporte para anotações que se estendem por várias páginas
- **Recursos Colaborativos**: Múltiplos usuários podem trabalhar no mesmo documento
- **Visualização Rica**: Sobreposição visual de anotações sobre documentos originais

### 7. 🚀 Framework LLM Personalizado
- **Baseado em PydanticAI**: Framework robusto para integração com modelos de linguagem
- **Gestão de Conversas**: Sistema completo de gestão de conversas e contexto
- **Respostas Estruturadas**: Respostas formatadas e validadas automaticamente
- **Streaming em Tempo Real**: Respostas em tempo real com streaming de eventos

### 8. 📊 Extração de Dados em Massa
- **Consultas Inteligentes**: Faça múltiplas perguntas em centenas de documentos
- **Sistema de Agentes**: Sistema de consulta powered por agentes de IA
- **Processamento Paralelo**: Processamento eficiente de grandes volumes de documentos
- **Resultados Estruturados**: Dados extraídos organizados em grids e tabelas

### 9. 🔧 Pipelines de Extração Personalizados
- **Fluxos Customizados**: Crie fluxos de extração de dados específicos para suas necessidades
- **Display Frontend**: Resultados exibidos diretamente na interface do usuário
- **Integração Completa**: Pipelines integrados com o sistema de permissões e metadados

## Como Funciona?

### Arquitetura de Dados Padronizada

O OpenContracts utiliza um padrão de dados aberto e padronizado que torna os dados extremamente portáteis. O sistema descreve blocos de texto e layout em uma página PDF usando coordenadas precisas:

```
Documento → Parsing → Extração de Layout → Coordenadas X,Y → Anotações Visuais
```

### Pipeline de Processamento Modular

A plataforma possui um sistema de pipeline poderoso e modular para processar documentos:

1. **Parsers**: Extraem texto e estrutura dos documentos
2. **Embedders**: Geram embeddings vetoriais para busca semântica  
3. **Thumbnailers**: Criam previsualizações visuais dos documentos

### Fluxo de Trabalho Típico

1. **Upload**: Carregue documentos (PDF, TXT, etc.) para a plataforma
2. **Processamento**: O sistema automaticamente processa e analisa os documentos
3. **Organização**: Organize documentos em coleções (Corpus) com metadados
4. **Análise**: Execute analisadores automáticos ou faça anotações manuais
5. **Extração**: Use consultas inteligentes para extrair dados específicos
6. **Exportação**: Exporte dados em formatos estruturados (CSV, JSON, etc.)

## Casos de Uso

### 📋 Análise de Contratos
- Analise grandes volumes de contratos legais
- Extraia cláusulas específicas automaticamente
- Identifique padrões e anomalias em documentos contratuais

### 🏢 Due Diligence Empresarial
- Organize documentos de due diligence por categorias
- Extraia informações financeiras e legais automaticamente
- Gere relatórios estruturados para tomada de decisões

### 🔍 Pesquisa Documental
- Busque informações específicas em grandes arquivos
- Use consultas em linguagem natural para encontrar dados
- Combine busca semântica com filtros estruturados

### 📊 Compliance e Auditoria
- Monitore conformidade em documentos regulatórios
- Identifique documentos que requerem atualizações
- Automatize relatórios de compliance

## Vantagens Técnicas

### 🔓 Código Aberto e Portabilidade
- **Licença GPL-3.0**: Software completamente livre e aberto
- **Dados Portáveis**: Formate de dados padronizado e exportável
- **Sem Vendor Lock-in**: Controle total sobre seus dados e instalação

### ⚡ Performance e Escalabilidade
- **Processamento Assíncrono**: Baseado em Celery para alta performance
- **Armazenamento Vetorial**: PostgreSQL com pgvector para busca eficiente
- **Arquitetura Microserviços**: Componentes independentes e escaláveis

### 🛡️ Segurança e Permissões
- **Permissões Granulares**: Controle de acesso detalhado por documento e coleção
- **Isolamento de Dados**: Dados organizados por usuário e organização
- **Auditoria Completa**: Log de todas as ações e modificações

### 🔌 Extensibilidade
- **API GraphQL**: Interface de programação moderna e flexível
- **Webhooks e Callbacks**: Integração com sistemas externos
- **Plugin Architecture**: Fácil adição de novos recursos e integrações

## Limitações Atuais

- **Formatos Suportados**: Atualmente limitado a PDF e formatos baseados em texto
- **Visualizadores**: Falta de visualizadores open source para formatos Office (docx, xlsx)
- **Em Desenvolvimento**: Algumas funcionalidades ainda estão em desenvolvimento ativo

## Roadmap Futuro

- **Suporte a Mais Formatos**: Expansão para formatos Office (docx, xlsx, pptx)
- **Visualizador Markdown**: Editor e visualizador markdown integrado
- **OCR Avançado**: Reconhecimento óptico de caracteres para documentos escaneados
- **Integração Cloud**: Conectores para serviços de armazenamento cloud

## Tecnologias Utilizadas

### Backend
- **Django**: Framework web robusto
- **PostgreSQL**: Banco de dados com suporte a pgvector
- **Celery**: Processamento assíncrono de tarefas
- **GraphQL**: API moderna e flexível

### Frontend
- **React**: Interface de usuário moderna
- **TypeScript**: Desenvolvimento type-safe
- **Semantic UI**: Componentes de interface elegantes

### IA e ML
- **PydanticAI**: Framework para integração com LLMs
- **Embeddings Vetoriais**: Para busca semântica avançada
- **Processamento de Linguagem Natural**: Para extração inteligente de dados

---

## Começando

Para começar a usar o OpenContracts, consulte nosso [Guia de Início Rápido](quick_start.md) que fornece instruções passo-a-passo para configuração local usando Docker.

### Links Úteis

- 🌐 [Demo Online](https://contracts.opensource.legal)
- 📚 [Documentação Completa](https://jsv4.github.io/OpenContracts/)
- 💻 [Repositório no GitHub](https://github.com/JSv4/OpenContracts)
- 🤝 [Como Contribuir](https://github.com/sponsors/JSv4)

---

*O OpenContracts foi desenvolvido para democratizar o acesso a ferramentas avançadas de análise de documentos, colocando o poder da IA e análise de dados nas mãos de especialistas e organizações de todos os tamanhos.*