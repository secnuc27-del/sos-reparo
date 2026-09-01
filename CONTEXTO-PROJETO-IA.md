# Contexto do projeto — SOS Reparo

Este documento serve como passagem de contexto para qualquer outra IA ou desenvolvedor que continuar este projeto.

## Proprietário e preferência de comunicação

- Proprietário: Lucas.
- Responder em português do Brasil, de forma clara, direta e amigável.
- Lucas costuma pedir alterações de forma informal. Antes de modificar algo importante, entender a intenção e preservar as funcionalidades existentes.
- Quando Lucas pedir para “subir pro Git”, verificar o estado do Git, criar o commit necessário e enviar para o repositório correto. Não executar `git init` novamente.

## Identidade do projeto

- Empresa fictícia: **TechFix Informática — Lucas**.
- Nome do sistema: **SOS Reparo**.
- Área: assistência técnica de computadores, notebooks, celulares, tablets e eletrônicos.
- Objetivo: organizar clientes, equipamentos, ordens de serviço, reparos, comunicação e acompanhamento pelo cliente.

## Repositório e publicação

- Repositório GitHub: `https://github.com/secnuc27-del/sos-reparo.git`
- Branch principal: `main`
- Site publicado: `https://secnuc27-del.github.io/sos-reparo/`
- O projeto usa GitHub Pages através do workflow `.github/workflows/deploy.yml`.
- Em `Settings > Pages`, a fonte precisa ser **GitHub Actions**.
- O projeto usa hash routing, por isso as rotas públicas usam URLs no formato `/#/acompanhar/...`.
- O `vite.config.ts` detecta automaticamente o nome do repositório através de `GITHUB_REPOSITORY`, evitando quebrar o caminho ao trocar o nome do repositório.

### Estado atual do Git

- O commit `b76a65a` já foi enviado ao GitHub e o deploy correspondente passou.
- O commit local mais recente é `c39de84`, que adiciona o logotipo visual do WhatsApp ao botão de contato.
- Depois de continuar alterações, conferir com `git status` e enviar o commit pendente usando:

```powershell
git push origin main
```

## Como executar

Na pasta do projeto:

```powershell
npm install
npm run dev
```

Para testar no celular na mesma rede Wi-Fi:

```powershell
npm run dev -- --host 0.0.0.0
```

Antes de finalizar qualquer mudança importante:

```powershell
npm run build
```

O build atual passa. O aviso sobre tamanho do bundle ou Node.js no GitHub Actions não é, sozinho, um erro de compilação.

## Funcionalidades já existentes

### Área interna do técnico

- Dashboard com faturamento realizado.
- Ticket médio.
- Quantidade de aparelhos na fila.
- Quantidade de OS concluídas.
- Filtro de dashboard por todo o período, dia, semana ou mês.
- Gráficos de status e tipos de equipamentos.
- Cadastro de clientes.
- Cadastro de equipamentos.
- Abertura e gerenciamento de ordens de serviço.
- Registro de defeito, serviço, técnico, valor e datas.
- Controle dos status: aguardando, em análise, aguardando peça, em reparo, concluído, pronto e entregue.
- Aba **Prontos**, mostrando somente aparelhos prontos para retirada.
- Histórico de ordens entregues/concluídas.
- Busca de OS por número, cliente, código ou telefone.
- Fotos antes e depois do reparo.
- QR Code da OS.
- Impressão do QR Code com layout específico para impressão.
- Aprovação ou recusa de orçamento pelo cliente.
- Assinatura digital na entrega.
- Tema claro e escuro.
- Layout responsivo para computador, tablet e celular.
- Menu lateral recolhível no celular.
- Sincronização de dados com Firebase Realtime Database.

### WhatsApp

- Quando a OS está com status **Pronto**, aparece um botão verde com o logotipo do WhatsApp.
- O botão gera um link `https://wa.me/...` com o telefone do cliente e uma mensagem pronta.
- O técnico ainda precisa conferir e enviar a mensagem no WhatsApp; isso não é uma API oficial automática.
- A lógica está em `src/routes/ordens-servico.tsx`.

### Área pública do cliente

O cliente não deve acessar o dashboard interno nem dados de outros clientes.

Pelo QR Code ou link individual da OS, o cliente consegue acompanhar somente a própria ordem, com recursos como:

- Status do reparo.
- Informações básicas do equipamento.
- Previsão de retirada.
- Fotos antes e depois.
- Situação do orçamento.
- Aprovar ou recusar orçamento.

A página pública está em `src/routes/acompanhar.tsx`, e a lógica dos registros públicos fica em `src/lib/osPublica.ts`.

## Arquivos mais importantes

- `src/components/Layout.tsx`: layout principal, menu lateral, cabeçalho, tema e menu mobile.
- `src/components/ThemeProvider.tsx`: tema claro/escuro.
- `src/components/SignatureCanvas.tsx`: assinatura digital.
- `src/components/AuthProvider.tsx`: autenticação e estado de acesso.
- `src/routes/dashboard.tsx`: dashboard e indicadores.
- `src/routes/clientes.tsx`: cadastro e gerenciamento de clientes e abertura de OS.
- `src/routes/equipamentos.tsx`: equipamentos e edição dos dados do reparo.
- `src/routes/ordens-servico.tsx`: fila de OS, aba Prontos, WhatsApp, QR Code e impressão.
- `src/routes/prontos.tsx`: rota da aba de aparelhos prontos.
- `src/routes/consulta.tsx`: consulta interna de OS.
- `src/routes/historico.tsx`: histórico de serviços.
- `src/routes/acompanhar.tsx`: acompanhamento público pelo cliente.
- `src/lib/dados.ts`: dados iniciais/demo.
- `src/lib/firebase.ts`: inicialização do Firebase.
- `src/lib/firebaseSync.ts`: sincronização com Firebase.
- `src/lib/osPublica.ts`: registros públicos, tokens e aprovação de orçamento.
- `src/styles.css`: temas, estilo geral, responsividade e impressão do QR Code.
- `src/routeTree.ts`: rotas do TanStack Router.
- `src/main.tsx`: inicialização do React, router, autenticação e Firebase.
- `vite.config.ts`: configuração do Vite, Tailwind, alias `@` e base do GitHub Pages.
- `package.json`: dependências e scripts.
- `.github/workflows/deploy.yml`: build e publicação no GitHub Pages.

## Firebase

- Projeto Firebase usado atualmente: `sos-reparo-12345`.
- A configuração está em `src/lib/firebase.ts`.
- O projeto utiliza Realtime Database, Authentication e Storage na configuração do aplicativo.
- As regras do Firebase precisam ser revisadas antes de uso real em produção.
- Nunca colocar senhas, tokens administrativos ou chaves privadas no frontend.
- A configuração web do Firebase pode aparecer no frontend, mas os dados precisam ser protegidos pelas regras do Firebase.

## Tecnologias

- React 19.
- TypeScript.
- Vite.
- Tailwind CSS.
- TanStack Router.
- Firebase.
- Recharts.
- Lucide React.
- QRCode React.
- GitHub Actions e GitHub Pages.

## Requisito da atividade escolar

O professor solicitou uma empresa fictícia de Tecnologia da Informação e um sistema desenvolvido com apoio de Inteligência Artificial.

Requisitos solicitados:

- Cadastro de clientes.
- Cadastro de equipamentos.
- Abertura de ordem de serviço.
- Descrição do problema.
- Registro do diagnóstico.
- Controle do status.
- Controle de serviços concluídos.
- Consulta das ordens de serviço.
- Pesquisa sobre o funcionamento de uma assistência técnica.

O SOS Reparo atende esses requisitos e possui recursos extras, como Firebase, dashboard, QR Code, WhatsApp, fotos, aprovação de orçamento, assinatura digital, tema claro/escuro e responsividade mobile.

### Atenção para a apresentação

O professor pediu explicitamente **Registro do diagnóstico**. Conferir se existe um campo com esse nome claramente visível no formulário. Se houver somente “Defeito” e “Serviço a realizar”, adicionar um campo separado chamado **Diagnóstico técnico** antes da apresentação.

## Como explicar o fluxo do sistema

Use este exemplo na apresentação:

1. O atendente cadastra o cliente.
2. Cadastra o equipamento e registra o problema.
3. Abre uma Ordem de Serviço com número único.
4. O técnico analisa o aparelho e registra o diagnóstico.
5. O orçamento é enviado para aprovação.
6. O cliente aprova pelo celular.
7. O técnico atualiza o status durante o reparo.
8. São registradas fotos antes e depois.
9. Quando a OS fica pronta, o técnico avisa o cliente pelo WhatsApp.
10. O cliente acompanha pelo QR Code e assina ao retirar o aparelho.

## Regras para futuras alterações

- Não remover funcionalidades existentes sem autorização do Lucas.
- Antes de editar, consultar `git status` e preservar alterações locais.
- Fazer alterações pequenas e testáveis.
- Sempre executar `npm run build` após mudanças de código.
- Se adicionar uma biblioteca usada no código, adicionar também ao `package.json` e ao `package-lock.json`.
- Se alterar o deploy, conferir `Settings > Pages` e a aba `Actions`.
- Depois de um pedido explícito para subir ao Git, usar o repositório `secnuc27-del/sos-reparo` e a branch `main`.
- Não criar outro repositório, não executar `git init` e não apagar o histórico sem autorização.

## Comandos Git principais

```powershell
git status
git add -A
git commit -m "descreva a alteracao"
git push origin main
```

Se o GitHub Actions falhar, abrir a execução mais recente em `Actions` e verificar a etapa que ficou vermelha. Se aparecer erro de Pages, conferir `Settings > Pages > Source: GitHub Actions`.
