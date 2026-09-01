# SOS Reparo

Sistema web para gerenciamento de assistência técnica, ordens de serviço e acompanhamento do cliente.

## Funcionalidades

- Dashboard com indicadores e gráficos.
- Cadastro de clientes e equipamentos.
- Criação e gerenciamento de ordens de serviço.
- Aba de aparelhos prontos para retirada.
- Aviso pelo WhatsApp com mensagem pronta.
- Fotos do aparelho antes e depois do reparo.
- Consulta pública da OS pelo QR Code.
- Aprovação de orçamento pelo celular.
- Assinatura do cliente na entrega.
- Tema claro e escuro.
- Layout adaptado para computador e celular.
- Sincronização com Firebase Realtime Database.

## Tecnologias

- React 19 + TypeScript
- Vite
- Tailwind CSS
- TanStack Router
- Firebase Realtime Database, Authentication e Storage
- Lucide React
- QRCode React

## Requisitos

- Node.js 20 ou superior
- npm

## Executar localmente

```bash
npm install
npm run dev
```

O sistema ficará disponível no endereço exibido pelo Vite, normalmente `http://localhost:5173`.

Para testar pelo celular conectado à mesma rede Wi-Fi:

```bash
npm run dev -- --host 0.0.0.0
```

Depois abra no celular `http://IP_DO_COMPUTADOR:5173`.

## Firebase

A configuração do Firebase fica em `src/lib/firebase.ts`. Antes de usar em produção:

1. Configure o Realtime Database, Authentication e Storage no projeto Firebase.
2. Revise as regras de segurança do banco e do Storage.
3. Confira se o arquivo aponta para o projeto Firebase correto.

As chaves web do Firebase identificam o aplicativo, mas a proteção dos dados deve ser feita pelas regras do Firebase.

## Build de produção

```bash
npm run build
npm run preview
```

## Deploy no GitHub Pages

O workflow em `.github/workflows/deploy.yml` faz o build e publica automaticamente quando houver push na branch `main`.

No GitHub, depois de criar o repositório:

1. Acesse `Settings > Pages`.
2. Em `Build and deployment`, escolha `GitHub Actions`.
3. Faça o primeiro push na branch `main`.

O caminho do GitHub Pages é detectado automaticamente pelo nome do novo repositório.
