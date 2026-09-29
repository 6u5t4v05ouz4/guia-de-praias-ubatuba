# Guia de Praias & Serviços Ubatuba — Especificação de Produto (SPEC)

## 1. Visão Geral do Produto
O **Guia de Praias & Serviços Ubatuba** é uma Progressive Web App (PWA) de alto desempenho, mobile-first e offline-first, criada para turistas e moradores de Ubatuba-SP. O aplicativo centraliza informações confiáveis sobre mais de 100 praias da cidade, rotas de acesso, balneabilidade da CETESB, utilidades públicas e um ecossistema comercial com parceiros locais.

---

## 2. Personas e Casos de Uso
1. **Turista em Trânsito:** Busca saber qual praia ir com base no perfil (ex: família com crianças, mar calmo, ou boas ondas para surf) e como chegar sem depender de sinal 4G/5G.
2. **Turista na Areia:** Quer saber onde comer, alugar caiaque/prancha ou reservar um passeio de barco na praia em que está, entrando em contato direto via WhatsApp.
3. **Comerciante Local (Anunciante):** Quiosques, pousadas, escolas de surf e marinheiros que buscam visibilidade e leads qualificados pelo WhatsApp.
4. **Administrador do Guia:** Modera fotos enviadas pelo público, atualiza a balneabilidade da CETESB e gerencia os contratos de anunciantes.

---

## 3. Arquitetura de Navegação (4 Abas Principais)

### 3.1. Aba 1: 🏖️ Praias (Explorar)
- **Barra de Busca e Filtros Rápidos:**
  - Busca por nome da praia ou região.
  - Filtro por Região: Todas, Norte, Centro, Sul.
  - Filtros por Perfil / Experiência:
    - 👨‍👩‍👧 *Família / Mar Calmo*
    - 🏄 *Boas Ondas / Surf*
    - 🍹 *Com Quiosques & Estrutura*
    - 🥾 *Trilha / Selvagem*
    - 🚗 *Acesso Fácil de Carro*
    - 🐾 *Pet Friendly*
- **Listagem de Cards:**
  - Foto de capa em alta definição.
  - Nome da praia e Região + KM da rodovia Rio-Santos (BR-101).
  - Pílulas com ícones de características.
  - Indicador CETESB (Bandeira Verde = Própria / Vermelha = Imprópria).
  - Botão de favoritar (coraçãozinho) com salvamento offline instantâneo.

### 3.2. Aba 2: 🛎️ Serviços & Onde Ir
- **Categorias Comerciais:**
  - 🍽️ *Restaurantes & Quiosques de Praia*
  - 🏨 *Pousadas & Hospedagens*
  - ⛵ *Passeios de Barco & Escuna (Ilhas Couves e Anchieta)*
  - 🏄 *Escolas de Surf & Aluguel de Pranchas*
  - 🚣 *Caiaque, Stand Up Paddle & Mergulho*
  - 🛍️ *Comércio Local & Conveniência*
- **Filtro por Região:** Norte, Centro e Sul.
- **Card do Parceiro:**
  - Logo/Foto do estabelecimento.
  - Selo de "Parceiro Oficial Verificado".
  - Praia/Bairro de atuação.
  - Descrição curta e diferenciais (ex: "10% de desconto para usuários do Guia").
  - Botão de Ação Primária: **"Chamar no WhatsApp"** (com mensagem personalizada de lead).

### 3.3. Aba 3: ⭐ Meus Salvos (100% Offline)
- Lista de praias e serviços favoritados pelo usuário.
- Carregamento 100% instantâneo mesmo sem sinal de internet na praia.
- Aviso de status de conectividade: *"Você está offline. Todas as informações salvas estão disponíveis."*

### 3.4. Aba 4: ℹ️ Guia Ubatuba (Utilidades)
- **Taxa de Preservação Ambiental (TPA Ubatuba):** Como funciona, valores diários por veículo, isenções e link direto para regularização.
- **Horários e Linhas VerdeBus:** Ônibus municipais ligando o centro aos bairros do Norte e Sul.
- **Telefones Úteis e Emergência:** Bombeiros (193), SAMU (192), Polícia Militar (190), Hospital Municipal, Defesa Civil (199).
- **Tábua de Marés & Alertas Meteorológicos:** Consulta de maré alta/baixa para travessia de trilhas e segurança dos banhistas.

---

## 4. Anatomia da Página Detalhada da Praia
1. **Carrossel de Fotos:**
   - Imagens em alta resolução.
   - Crédito ao autor da foto: `📸 Foto por @usuario_instagram`.
2. **Barra de Ações Rápidas:**
   - Botão Salvar (Favorito Offline).
   - Botão "Abrir Rota" (integração direta com Google Maps e Waze).
   - Botão "Enviar Foto desta Praia".
3. **Pílulas de Características & Balneabilidade:**
   - Tipo de mar (calmo, tombo, repuxo).
   - Selo CETESB com data da última aferição.
   - Condição do tempo atual.
4. **Instruções de Acesso & Dicas:**
   - **Como Chegar:** Descrição passo a passo, tipo de estrada (asfalto, terra, balsa, trilha), estacionamento (vagas, Zona Azul).
   - **Dicas de Ouro:** Presença de borrachudos, incidência de sol/sombra, necessidade de levar água/comida.
5. **Seção "Parceiros Recomendados nesta Praia":**
   - Lista contextual dos comércios e prestadores que atuam naquela praia específica.
   - Botão direto para contato via WhatsApp.
6. **Galeria Colaborativa:**
   - Fotos adicionais aprovadas da comunidade com os respectivos @Instagram dos fotógrafos.

---

## 5. Módulo Colaborativo (UGC) & Moderação
- Turistas e fotógrafos locais podem enviar fotos de qualquer praia sem necessidade de cadastro.
- Campos do formulário:
  - Seleção da Praia (pré-selecionada se acionada a partir da página da praia).
  - Arquivo de Imagem (compressão automática no cliente antes do envio).
  - Nome do Autor.
  - Perfil do Instagram (`@usuario`).
- A foto entra com status `pendente` e não é exibida publicamente até aprovação no `/admin`.

---

## 6. Painel Administrativo (`/admin`)
- Autenticação segura por senha de administrador.
- **Módulo 1 - Moderação de Fotos:** Visualização em grade das fotos pendentes, com ações:
  - `Aprovar como Foto da Galeria`
  - `Definir como Foto de Capa Oficial` (gamificação da semana)
  - `Rejeitar`
- **Módulo 2 - Gerenciamento de Praias:** Cadastro completo (criar, editar, remover do app), com slug de URL automático, região, KM, coordenadas, tags de perfil, instruções de acesso, dicas, infraestrutura e trilha. A imagem de capa é **opcional**: sem foto, o app usa a arte procedural gerada para a praia; com foto enviada, ela substitui a arte automaticamente. Galeria própria também pode ser enviada, com crédito do autor.
- **Módulo 3 - Gerenciamento de Parceiros:** Cadastrar, editar e pausar anunciantes, com link de WhatsApp e definição de destaque.
- **Módulo 4 - Banners de Destaque:** Upload de banners promocionais rotativos (Home e topo das listas).
- **Módulo 5 - Boletim CETESB:** Interruptor rápido para alternar praias entre Própria e Imprópria a cada semana.
