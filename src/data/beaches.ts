import type { Beach } from '@/types';

/**
 * Catálogo semente das praias de Ubatuba.
 *
 * Este arquivo é a fonte da verdade local: ele é embutido no bundle inicial,
 * garantindo que o app abra e funcione 100% offline mesmo sem backend configurado
 * (ver docs/ARCHITECTURE.md, seção 4 — Repository Pattern).
 *
 * `coverImage` e `gallery[].url` ficam vazios de propósito: as artes são geradas
 * proceduralmente por `src/assets/beachArt.ts`, o que evita depender de rede ou de
 * arquivos pesados no repositório. Ao cadastrar uma imagem real (via /admin ou
 * migração do Supabase), basta preencher os campos que a arte cede o lugar à foto.
 *
 * Aviso: os dados de balneabilidade (`cetesbStatus`) refletem a última atualização
 * conhecida no momento do deploy. Em produção eles devem ser sincronizados com o
 * boletim semanal da CETESB pelo módulo 4 do painel administrativo.
 */

type BeachSeed = Omit<Beach, 'coverImage' | 'gallery'> &
  Partial<Pick<Beach, 'coverAuthor' | 'coverAuthorInstagram'>>;

const raw: BeachSeed[] = [
  /* ------------------------------- CENTRO ------------------------------- */
  {
    id: 'praia-do-cruzeiro',
    name: 'Praia do Cruzeiro',
    region: 'centro',
    km: 0.5,
    distanceFromCenterKm: 1.5,
    description:
      'A porta de entrada do litoral de Ubatuba. O mar do Cruzeiro é considerado um dos mais calmos da cidade graças à proteção da Serra do Mar — perfeito para a primeira parada da viagem, com crianças nadando e o centro a poucos minutos a pé.',
    howToGet:
      'Siga pela Avenida Olavo Fontoura no sentido sul até a rotatória do Cruzeiro. A praia fica entre a foz do Rio do Cruzeiro e o quebra-mar, com estacionamento público na própria rotatória e acesso por calçada até a areia.',
    tips: [
      'O rio deságua no mar aqui: não nade entre o quebra-mar e a foz — a correnteza é traiçoeira.',
      'Na maré baixa aparece um banco de areia enorme e raso, ótimo para crianças.',
      'Não existe quiosque por lá: compre a marmita antes de descer.',
    ],
    tags: ['familia', 'carro', 'pet_friendly'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5401, lng: -45.1946 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: false, hasBoatTours: false },
  },
  {
    id: 'praia-do-centro',
    name: 'Praia do Centro (Droveria)',
    region: 'centro',
    km: 0.2,
    distanceFromCenterKm: 1.2,
    description:
      'A praia urbana de Ubatuba, emoldurada pela orla da Rua Droveria. Tem restaurants, comércio a uma quadra, trânsito fácil e o pôr do sol mais movimentado da Costa Verde. Boa para quem não quer dirigir 20 km.',
    howToGet:
      'Fique na Avenida Getúlio Vargas / Rua Droveria. O acesso principal é pela praça do Cruzeiro; a orla tem estacionamento rotativo (Zona Azul) e pontos de ônibus VerdeBus na própria avenida.',
    tips: [
      'Calçada cheia nos fins de semana de verão — chegue antes das 9h.',
      'O trânsito na Droveria é intenso; estacione longe e caminhe.',
      'Ótimo para o pôr do sol, mas não para nadar de manhã em dia de onda grande.',
    ],
    tags: ['familia', 'carro', 'quiosque', 'pet_friendly'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5419, lng: -45.1969 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: true, hasBoatTours: true },
  },
  {
    id: 'praia-grande',
    name: 'Praia Grande',
    region: 'centro',
    km: 1.4,
    distanceFromCenterKm: 2.6,
    description:
      'A maior e mais movimentada praia urbana do município. Tem estrutura completa, salva-vidas, quiosques e uma faixa de areia generosa — a escolha padrão para quem quer estrutura sem sair do centro.',
    howToGet:
      'BR-101 (Rio-Santos) km 1 da Ubatuba, sentido sul. Entrada por cima, com rampa até a areia. Estacionamento municipal com cobrança rotativa e calçada paralelamente à via.',
    tips: [
      'Lotação alta entre Natal e janeiro — evite o pico entre 11h e 16h.',
      'Há salva-vidas todos os dias no verão.',
      'Sol forte na faixa de areia nua: leve protetor e guarda-chuva.',
    ],
    tags: ['familia', 'carro', 'quiosque', 'pet_friendly'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5459, lng: -45.1999 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: true, hasBoatTours: true },
  },
  {
    id: 'praia-do-itagua',
    name: 'Praia do Itagua',
    region: 'centro',
    km: 2.2,
    distanceFromCenterKm: 3.4,
    description:
      'Praia de bairro, com sombra de árvores na faixa de areia e uma vista da Serra do Mar que vale a parada. Tranquila o dia inteiro, com quiosques simples à beira-mar.',
    howToGet:
      'BR-101 km 2,5. Entre pela Rua do Itagua, que desce do centro até a praia. O estacionamento é informal na rua de cima; o acesso final é por uma trilha curta com degraus.',
    tips: [
      'Mar tranquilo, ideal para famílias com crianças pequenas.',
      'A sombra vem das árvores da margem, não de quiosque — leve proteção solar.',
      'A trilha de acesso tem degraus íngremes se você vier com carrinho de bebê.',
    ],
    tags: ['familia', 'quiosque', 'carro'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5495, lng: -45.2029 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: true, hasBoatTours: false },
  },
  {
    id: 'praia-do-chopas',
    name: 'Praia do Chopas',
    region: 'centro',
    km: 2.8,
    distanceFromCenterKm: 4.0,
    description:
      'Pequena enseada de mar muito calmo, encostada no costão rochoso. Procurada por quem quer uma praia "de bairro" a poucos minutos do hotel, com calmaria quase garantida.',
    howToGet:
      'BR-101 km 2,8, na descida para o bairro do Chopas. Estacione na esquina e siga a pé por cerca de 150 m até a areia.',
    tips: [
      'Mar muito calmo — pouco indicado para surf.',
      'Uma das poucas do centro com pets liberados na faixa de areia.',
      'Chuva alaga o caminho de acesso: prefira ir em dia seco.',
    ],
    tags: ['familia', 'pet_friendly', 'carro'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5522, lng: -45.2053 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: false, hasBoatTours: false },
  },
  {
    id: 'praia-da-vila',
    name: 'Praia da Vila',
    region: 'centro',
    km: 3.6,
    distanceFromCenterKm: 4.8,
    description:
      'A última praia urbana antes do Rio Perequê-Açu. Curta, arborizada e com piscina de água doce do bairro — um clássico de fim de tarde.',
    howToGet:
      'BR-101 km 3,6, sentido norte. Entrada pela Rua da Vila, com estacionamento na área interna do bairro.',
    tips: [
      'A faixa de areia é curta, mas a água é rasa e segura.',
      'No fim da tarde costuma ventar: leve uma blusa.',
      'O cheiro de maresia com a Mata Atlântica ao fundo é a assinatura do lugar.',
    ],
    tags: ['familia', 'pet_friendly', 'carro', 'quiosque'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5565, lng: -45.2088 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: true, hasBoatTours: false },
  },
  {
    id: 'praia-do-pereque-acu',
    name: 'Praia do Perequê-Açu',
    region: 'centro',
    km: 4.8,
    distanceFromCenterKm: 6.0,
    description:
      'A joia escondida do centro: praia de água doce e arejada, cercada por Mata Atlântica, onde banana boat e aulas de SUP fazem ponto. O rio deságua ao lado, criando uma área de banho perfeita para iniciantes.',
    howToGet:
      'BR-101 km 4,8. Depois da ponte sobre o Rio Perequê-Açu, vire na Rua Vereador Faustiano de Faria. O estacionamento da praia fica a 300 m; o acesso é por caminho de terra com uma passarela de madeira.',
    tips: [
      'A parte de cima (rio) é a mais tranquila; a barra de areia em frente ao mar é mais agitada.',
      'O estacionamento lota rápido nos fins de semana.',
      'Leve repelente: há muita área verde e sombra.',
    ],
    tags: ['familia', 'pet_friendly', 'quiosque', 'carro'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5601, lng: -45.2112 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: true, hasBoatTours: false },
  },

  /* -------------------------------- NORTE -------------------------------- */
  {
    id: 'praia-da-lagoinha-do-resto',
    name: 'Praia da Lagoinha do Resto',
    region: 'norte',
    km: 5.8,
    distanceFromCenterKm: 7.0,
    description:
      'Enseada estreita e sombreada entre morros, com mar macio e clima de enseada protegida. Um pequeno quiosque com sombra de palmeiras atende a praia e é ótimo para um almoço tranquilo.',
    howToGet:
      'BR-101 km 5,8, sentido norte. Vire na entrada da Lagoinha e desça a rampa até o estacionamento de terra. A praia fica a cerca de 100 m.',
    tips: [
      'Mar muito tranquilo — o ideal para famílias com crianças.',
      'O quiosque é pequeno e lota: chegue antes do meio-dia.',
      'A descida do estacionamento é íngreme; cuidado ao abrir a porta do carro.',
    ],
    tags: ['familia', 'quiosque', 'carro'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5637, lng: -45.2141 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: true, hasBoatTours: false },
  },
  {
    id: 'praia-da-enseada-do-rio',
    name: 'Praia da Enseada do Rio',
    region: 'norte',
    km: 6.6,
    distanceFromCenterKm: 7.8,
    description:
      'Enseada ampla em forma de meia-lua, com mar aberto e boa ondulação. Boa para Families, e o pôr do sol visto do costão norte é um dos mais disputados da cidade.',
    howToGet:
      'BR-101 km 6,6. Entrada à esquerda, depois da ponte do Rio Enseada. Estacionamento de terra em frente ao quiosque.',
    tips: [
      'O vento sudeste cria um mar excelente para surf no fim da tarde.',
      'No fim da tarde o sol se põe atrás do costão — uma das melhores fotos da região.',
      'Respeite a sinalização nas encostas acima da praia.',
    ],
    tags: ['surf', 'quiosque', 'carro', 'mergulho'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5668, lng: -45.2165 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: true, hasBoatTours: true },
  },
  {
    id: 'praia-do-sabucu',
    name: 'Praia do Sabuçu',
    region: 'norte',
    km: 7.6,
    distanceFromCenterKm: 8.8,
    description:
      'Praia pequena, de mar agitado e clima de praia "de verdade", com barracas simples de peixe frito. Vale a parada para quem curte a experiência local em vez da estrutura.',
    howToGet:
      'BR-101 km 7,6. Entrada pequena à direita, com estacionamento de terra. A trilha até a areia é curta.',
    tips: [
      'Tradição de peixe frito e tapioca nas barracas — almoço local clássico.',
      'O mar pega onda: não é praia para crianças pequenas.',
      'Estacionamento precário: chegue cedo no verão.',
    ],
    tags: ['surf', 'quiosque', 'carro'],
    cetesbStatus: 'impropria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5694, lng: -45.2188 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: true, hasBoatTours: false },
  },
  {
    id: 'praia-do-sununu',
    name: 'Praia do Sununu',
    region: 'norte',
    km: 8.1,
    distanceFromCenterKm: 9.3,
    description:
      'A segunda enseada de rio do norte, logo após o Sabuçu. Água doce calma, sombra abundante e um dos melhores pontos do município para famílias e pets.',
    howToGet:
      'BR-101 km 8,1. Vire na entrada do bairro do Sununu e siga até o rio. O estacionamento é na beira da estrada, a 200 m da praia.',
    tips: [
      'Área de rio com correnteza suave: não deixe as crianças desacompanhadas.',
      'Muita sombra de mata — o contraste de temperatura sob o sol forte é grande.',
      'Combina com a Lagoa do Sununu para um roteiro de meio-dia.',
    ],
    tags: ['familia', 'pet_friendly', 'selvagem', 'carro'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5712, lng: -45.2203 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: false, hasBoatTours: false },
  },
  {
    id: 'praia-do-descanso',
    name: 'Praia do Descanso',
    region: 'norte',
    km: 8.8,
    distanceFromCenterKm: 10.0,
    description:
      'Praia aberta de areia larga, com uma das vistas mais bonitas da Costa Verde: o costão da Serra do Mar cai direto na água. Tem bom espaço para piquenique e é ótima para as pranchas de fim de tarde.',
    howToGet:
      'BR-101 km 8,8, sentido norte. Entrada à direita depois da curva do Descanso, com estacionamento de terra sombreado.',
    tips: [
      'Ótima para piquenique e churrasco — o beach BBQ é liberado nas áreas de Uso Público.',
      'Mar moderado; atenção às ondas em dias de swell.',
      'Pouco comércio: leve água, gelo e lanche.',
    ],
    tags: ['familia', 'carro', 'pet_friendly', 'surf'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5735, lng: -45.2224 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: false, hasBoatTours: false },
  },
  {
    id: 'praia-da-boca-do-largo',
    name: 'Praia da Boca do Largo',
    region: 'norte',
    km: 9.4,
    distanceFromCenterKm: 10.6,
    description:
      'Onde o Rio Grande deságua no mar. A correnteza é forte e a água é clara, o que cria uma das poucas áreas de banho de rio com sensação de praia de verdade na região.',
    howToGet:
      'BR-101 km 9,4. Vire na entrada do bairro do Rio Grande (Boca do Largo). O estacionamento fica na entrada do bairro; a praia é 400 m a pé.',
    tips: [
      'A correnteza na foz é forte — nada sempre acompanhado e mantenha as crianças por perto.',
      'No fim da tarde a água ganha um tom alaranjado com o pôr do sol.',
      'Pouca estrutura: leve seu próprio almoço.',
    ],
    tags: ['familia', 'carro', 'selvagem', 'pet_friendly'],
    cetesbStatus: 'impropria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5761, lng: -45.2249 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: false, hasBoatTours: false },
  },
  {
    id: 'praia-do-coral',
    name: 'Praia do Coral',
    region: 'norte',
    km: 10.0,
    distanceFromCenterKm: 11.2,
    description:
      'Trecho de praia intocada, com mata até a areia e mar de cores cambiantes. A favorita de quem quer o que a Costa Verde tem de mais bruto — sem barraca, sem grade.',
    howToGet:
      'BR-101 km 10. Entrada de terra à esquerda, trilha curta de 300 m até a areia. Estacionamento para cerca de 10 carros.',
    tips: [
      'A trilha de acesso é em parte arenosa: não vá de carro fino.',
      'Totalmente autossuficiente — leve água, comida, protetor e uma sacola para o lixo.',
      'As pegadas na areia são o único registro da sua visita: saia de lá como encontrou.',
    ],
    tags: ['selvagem', 'trilha', 'carro', 'mergulho'],
    cetesbStatus: 'impropria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5788, lng: -45.2273 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: false, hasBoatTours: false },
  },
  {
    id: 'praia-do-lam-beach',
    name: 'Praia do Lam Beach',
    region: 'norte',
    km: 10.8,
    distanceFromCenterKm: 12.0,
    description:
      'Enseada pequena e sombreada, escondida atrás de um costão, com um único quiosque que virou ponto de encontro dos banhadores do norte. Mar muito calmo e sombra trazida pela mata.',
    howToGet:
      'BR-101 km 10,8. Entrada estreita e fácil de passar — fique atento às placas. Desça a trilha de 200 m.',
    tips: [
      'A trilha é íngreme e estreita: não leve carrinho de bebê nem cadeira de rodas.',
      'O quiosque é o ponto de referência — se não vir, você passou do ponto.',
      'Mar dos mais calmos do norte; ideal para famílias.',
    ],
    tags: ['familia', 'quiosque', 'trilha', 'selvagem'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5814, lng: -45.2298 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: true, hasBoatTours: false },
  },
  {
    id: 'praia-de-sao-francisco',
    name: 'Praia de São Francisco',
    region: 'norte',
    km: 12.0,
    distanceFromCenterKm: 13.2,
    description:
      'Uma das mais bonitas do norte: enseada em arco entre dois costões, com mar azul profundo e um quiosque boêmio. Foi a praia-símbolo do movimento de surf paulistano e ainda carrega essa energia.',
    howToGet:
      'BR-101 km 12. Vire na entrada do bairro São Francisco e desça a ladeira até o estacionamento do quiosque.',
    tips: [
      'Tradição histórica de surf: a onda é melhor no fim da tarde.',
      'A faixa de areia alarga muito na maré baixa.',
      'Estacionamento limitado; se lotar, estacione na estrada principal e caminhe.',
    ],
    tags: ['surf', 'quiosque', 'carro', 'mergulho'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5856, lng: -45.2334 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: true, hasBoatTours: true },
  },
  {
    id: 'praia-da-ponte',
    name: 'Praia da Ponte',
    region: 'norte',
    km: 12.6,
    distanceFromCenterKm: 13.8,
    description:
      'A praia-trampolim do norte: a antiga ponte de madeira sobre o Rio Perequê-Açu dá acesso a uma enseada de água doce cercada por Mata Atlântica. Caminho de 20 minutos a partir do estacionamento.',
    howToGet:
      'BR-101 km 12,6. Estacione no acostamento, do lado direito da via, antes da entrada do bairro. Siga a trilha que começa na antiga ponte de madeira.',
    tips: [
      'Trilha de ida e volta de cerca de 15 min em cada sentido, com uma ladeira final íngreme.',
      'Muito frequentada no fim de semana; chegue antes das 10h.',
      'A água do rio é morna e doce — uma das poucas Properly do norte.',
    ],
    tags: ['trilha', 'selvagem', 'familia', 'quiosque', 'pet_friendly'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5878, lng: -45.2352 },
    features: {
      hasLifeguard: false,
      hasParking: true,
      hasKiosks: true,
      hasBoatTours: false,
      trailDifficulty: 'moderada',
      trailDurationMinutes: 20,
    },
  },
  {
    id: 'praia-de-itamambuca',
    name: 'Praia de Itamambuca',
    region: 'norte',
    km: 13.4,
    distanceFromCenterKm: 14.6,
    description:
      'A praia de surf mais famosa do Vale: ondulação consistente, arena de constantes e uma vila de escolas de surf no entorno. É onde a maioria dos visitantes aprende a surfar em Ubatuba.',
    howToGet:
      'BR-101 km 13,4, sentido norte. Entrada principal na rotatória, com estacionamento de terra e uma ladeira até a praia. As escolas ficam concentradas entre os km 12 e 14.',
    tips: [
      'As aulas de surf acontecem na maré baixa da manhã — é quando a onda pega forma.',
      'Traga a rifa: a escolha de aulas e instrutores acontece na própria praia.',
      'Aluguel de prancha e aula particular com as escolas parceiras do Guia.',
    ],
    tags: ['surf', 'quiosque', 'carro'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5903, lng: -45.2378 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: true, hasBoatTours: true },
  },
  {
    id: 'praia-do-braco',
    name: 'Praia do Braço',
    region: 'norte',
    km: 14.3,
    distanceFromCenterKm: 15.5,
    description:
      'Continuação natural de Itamambuca, com a mesma qualidade de onda e um clima mais silencioso. A trilha de acesso pela mata é curta e a praia divide o público entre surf e famílias.',
    howToGet:
      'Logo após Itamambuca na BR-101. A entrada é por uma trilha à direita, sinalizada; 200 m a pé.',
    tips: [
      'Trilha curta, mas com um degrau de pedra no final — atenção com o buggy.',
      'Ondas consistentes: excelente para quem já surfa.',
      'Menos estrutura que Itamambuca — leve água e lanche.',
    ],
    tags: ['surf', 'trilha', 'carro'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5931, lng: -45.2402 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: false, hasBoatTours: false },
  },
  {
    id: 'praia-de-ipanema',
    name: 'Praia de Ipanema',
    region: 'norte',
    km: 15.0,
    distanceFromCenterKm: 16.2,
    description:
      'Longa faixa de areia entre Itamambuca e Itatinga, onde o depósito de lixo da maré aparece esporadicamente. O lado bom: é o trecho mais contínuo para uma caminhada ao entardecer.',
    howToGet:
      'BR-101 km 15. Entrada à esquerda depois da saída de Itamambuca. Estacionamento informal.',
    tips: [
      'A maré costuma trazer resíduos do Rio Grande — não nada em dias de alerta.',
      'Ótimo para uma caminhada à beira-mar ao entardecer.',
      'Sem salva-vidas em praticamente nenhum ponto: natação por conta própria.',
    ],
    tags: ['surf', 'carro', 'pet_friendly'],
    cetesbStatus: 'impropria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5957, lng: -45.2424 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: false, hasBoatTours: false },
  },
  {
    id: 'praia-de-itatinga',
    name: 'Praia de Itatinga',
    region: 'norte',
    km: 16.0,
    distanceFromCenterKm: 17.2,
    description:
      'Praia de enseada com grande concentração de Mata Atlântica que chega quase até a areia. É onde os beach bars e os beach clubs de Ubatuba se instalaram — vibe mais gastronômica que o resto da costa.',
    howToGet:
      'BR-101 km 16. Vire na entrada de Itatinga e desça a rua principal até o estacionamento dos beach bars.',
    tips: [
      'A descida é longa e íngreme — use o freio de mão.',
      'Hospedagem e restaurantes com vista para o mar: reserve com antecedência no verão.',
      'Mar moderado; bom para famílias de dia e para o pôr do sol à noite.',
    ],
    tags: ['quiosque', 'carro', 'familia', 'pet_friendly'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.5982, lng: -45.2449 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: true, hasBoatTours: false },
  },
  {
    id: 'praia-de-tremembe',
    name: 'Praia de Tremembé',
    region: 'norte',
    km: 17.0,
    distanceFromCenterKm: 18.2,
    description:
      'Longa, arejada e preditaemnamente vazia — Tremembé é a praia do norte que ainda respira em muitos dias de verão. Um trecho da antiga ferrovia de Ubatuba passa na falésia acima dela, o que dá um ar de lugar secreto.',
    howToGet:
      'BR-101 km 17, sentido norte. Entrada à esquerda com placa; o estacionamento de terra comporta umas 30 vagas.',
    tips: [
      'O mar é limpo, mas a correnteza de rebentação é a mais forte do norte.',
      'A trilha da ferrovia acima da praia é o melhor passeio de 30 min da região.',
      'Sem infraestrutura: leve tudo o que precisa.',
    ],
    tags: ['selvagem', 'carro', 'trilha', 'surf'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.6015, lng: -45.2482 },
    features: {
      hasLifeguard: false,
      hasParking: true,
      hasKiosks: false,
      hasBoatTours: false,
      trailDifficulty: 'facil',
      trailDurationMinutes: 30,
    },
  },
  {
    id: 'praia-da-prainha',
    name: 'Praia da Prainha',
    region: 'norte',
    km: 17.8,
    distanceFromCenterKm: 19.0,
    description:
      'Clássica entre surf e famílias: onda de boa qualidade dentro de uma enseada protegida e área plana de areia para as crianças. Tem um quiosque simples e o campground do Gargau como vizinho.',
    howToGet:
      'BR-101 km 17,8. Entrada à direita antes do Gargau, com estacionamento de terra.',
    tips: [
      'A onda pega melhor no fim da tarde com swell de sudeste.',
      'Clima de praia simples, sem estrutura de resort.',
      'O campamento do Gargau fica logo acima: um clássico dos surfistas.',
    ],
    tags: ['surf', 'familia', 'quiosque', 'carro'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.6043, lng: -45.2509 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: true, hasBoatTours: false },
  },
  {
    id: 'praia-do-gargau',
    name: 'Praia do Gargau',
    region: 'norte',
    km: 18.6,
    distanceFromCenterKm: 19.8,
    description:
      'Enseada de surf clássica do Rio de Janeiro, estreita e protegida por uma grande pedra que quebra a ondulação. Uma das áreas de surf mais antigas da Costa Verde, com campground e chalés na mata.',
    howToGet:
      'BR-101 km 18,6. Entrada do bairro do Gargau; desça a rua até o campground. O estacionamento fica no topo.',
    tips: [
      'A onda do Gargau é curta e poderosa — para surfistas experientes.',
      'O campground e os chalés ficam acima da praia: excelente para quem quer pernoitar.',
      'A trilha de acesso até a areia cruza o campground; peça a chave na recepção.',
    ],
    tags: ['surf', 'trilha', 'carro', 'selvagem'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.6071, lng: -45.2535 },
    features: {
      hasLifeguard: false,
      hasParking: true,
      hasKiosks: true,
      hasBoatTours: false,
      trailDifficulty: 'moderada',
      trailDurationMinutes: 15,
    },
  },
  {
    id: 'praia-de-ubatumirim',
    name: 'Praia de Ubatumirim',
    region: 'norte',
    km: 20.0,
    distanceFromCenterKm: 21.2,
    description:
      'Mar aberto, ondas longas e uma das enseadas mais selvagens do município. É o extremo norte de Ubatuba — a estrada termina aqui, e o mar deixa de ser enseada para virar oceânico de verdade.',
    howToGet:
      'BR-101 km 20, extremo norte da rodovia. Último trevo antes da Estrada do Mar. Estacionamento na entrada do bairro.',
    tips: [
      'Correnteza de retorno forte e constante — só para surfistas com experiência.',
      'A trilha costeira que liga Ubatumirim ao Ercegário dura cerca de 1h30 e é espetacular.',
      'Pouca oferta de comida: leve lanche oucombine com o pessoal do bairro.',
    ],
    tags: ['surf', 'trilha', 'selvagem', 'carro', 'mergulho'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.6104, lng: -45.2567 },
    features: {
      hasLifeguard: false,
      hasParking: true,
      hasKiosks: false,
      hasBoatTours: false,
      trailDifficulty: 'dificil',
      trailDurationMinutes: 90,
    },
  },
  {
    id: 'praia-do-ercegario',
    name: 'Praia do Ercegário',
    region: 'norte',
    km: 22.0,
    distanceFromCenterKm: 23.2,
    description:
      'A praia do fim da linha: depois dela só a Serra do Mar e a Rodovia dos Tamoios. Enseada de água escura e calma, quase intocada, com camping e algumas palafitas de pescadores.',
    howToGet:
      'BR-101 km 22, última praia antes da ponte sobre o Rio Pardo. Entrada à direita, estrada de terra de 1,5 km.',
    tips: [
      'A estrada final é de terra e alaga na chuva — não vá em dia de temporal.',
      'É o melhor ponto para assistir ao pôr do sol sem multidão.',
      'Leve tudo: não há comércio, sombra nem estrutura.',
    ],
    tags: ['selvagem', 'trilha', 'carro', 'familia'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.6153, lng: -45.2608 },
    features: {
      hasLifeguard: false,
      hasParking: true,
      hasKiosks: false,
      hasBoatTours: false,
      trailDifficulty: 'moderada',
      trailDurationMinutes: 20,
    },
  },

  /* --------------------------------- SUL --------------------------------- */
  {
    id: 'praia-da-enseada-da-passagem',
    name: 'Praia da Enseada da Passagem',
    region: 'sul',
    km: 34.0,
    distanceFromCenterKm: 35.2,
    description:
      'A primeira grande praia depois do Rio Pardo, e uma das mais subestimadas da cidade: enseada larga, mar limpo e a Mata Atlântica fechando o fundo. Muita família, pouco movimento e sombra de mata.',
    howToGet:
      'BR-101 km 34, sentido sul, logo após a ponte do Rio Pardo. Entrada à direita, com estacionamento de terra e uma ladeira suave.',
    tips: [
      'Sol de manhã, sombra de tarde: o lado oeste da enseada é a melhor hora.',
      'Tradição de quiosques com peixaria e camarão — almoço regional clássico.',
      'Mar tranquilo; excelente para famílias e pets.',
    ],
    tags: ['familia', 'quiosque', 'carro', 'pet_friendly'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.6622, lng: -45.3106 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: true, hasBoatTours: false },
  },
  {
    id: 'praia-de-barebeu',
    name: 'Praia de Barebeu',
    region: 'sul',
    km: 35.5,
    distanceFromCenterKm: 36.7,
    description:
      'Enseada pequena e tranquila, com uma laje de pedra que cria uma piscina natural rasa na maré baixa. Menos concorrida que a Passagem, com clima de praia "de bairro do sul".',
    howToGet:
      'BR-101 km 35,5, logo após a Enseada da Passagem. Entrada pequena à esquerda; a praia fica a 150 m.',
    tips: [
      'A laje de pedra só é acessível na maré baixa — confira a tábua antes de ir.',
      'Estacionamento muito pequeno, oito vagas. Na dúvida, estacione na estrada principal.',
      'Um dos melhores pores do sol do sul, visto da laje.',
    ],
    tags: ['familia', 'selvagem', 'carro', 'pet_friendly'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.6671, lng: -45.3162 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: false, hasBoatTours: false },
  },
  {
    id: 'praia-da-fortaleza',
    name: 'Praia da Fortaleza',
    region: 'sul',
    km: 39.0,
    distanceFromCenterKm: 40.2,
    description:
      'A praia-fortaleza histórica de Ubatuba, onde o Visconde de Toeiro ergueu sua residência para defender a costa dos corsários. Hoje é um santuário de surfe: onda potente, costão de pedra e uma comunidade que vive em torno do mar.',
    howToGet:
      'BR-101 km 39, sentido sul. Entrada à direita logo após a curva da Fortaleza; a estrada desce 1 km até o estacionamento de terra.',
    tips: [
      'Surf de potência: a onda é forte e quebra em banco de areia. Não é praia para iniciantes.',
      'Vizinhança histórica com a casa de detenção e a torre — visite com respeito.',
      'A chuva alaga a via de acesso: prefira ir em dia seco.',
    ],
    tags: ['surf', 'selvagem', 'carro', 'mergulho'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.6793, lng: -45.3316 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: false, hasBoatTours: false },
  },
  {
    id: 'praia-do-bonete',
    name: 'Praia do Bonete',
    region: 'sul',
    km: 41.0,
    distanceFromCenterKm: 42.2,
    description:
      'A praia vizinha da Fortaleza, mais aberta e com um costão baixo onde as crianças brincam nas poças de maré. Tradição de praia de família do sul, com infraestrutura básica e peixaria na beira da areia.',
    howToGet:
      'BR-101 km 41, sentido sul, logo depois da Fortaleza. Entrada à esquerda com estacionamento de terra.',
    tips: [
      'Mar aberto com ondas moderadas — bom para famílias e para iniciantes no surf.',
      'As poças de maré baixa são ótimas para as crianças; cuidado com a ressaca.',
      'Peixaria na praia é a tradição local: não vá embora sem o peixe frito.',
    ],
    tags: ['familia', 'quiosque', 'carro', 'surf', 'pet_friendly'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.6851, lng: -45.3389 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: true, hasBoatTours: false },
  },
  {
    id: 'praia-da-ponta-da-barra',
    name: 'Praia da Ponta da Barra',
    region: 'sul',
    km: 42.0,
    distanceFromCenterKm: 43.2,
    description:
      'O ponto onde o Rio do Sul deságua no oceano. A barra de areia e o rio formam uma enseada com um contraste interessante: à esquerda o mar aberto, à direita a água doce do rio. Tradição histórica de praia de verão.',
    howToGet:
      'BR-101 km 42, sentido sul. Entrada à esquerda, antes da ponte sobre o Rio do Sul.',
    tips: [
      'A correnteza na foz é perigosa — não atravesse o rio para ir ao lado direito.',
      'O lado esquerdo (mar aberto) é o melhor para famílias; o direito, para quem quer rio.',
      'Sexta e sábado à noite costuma ter barraca de peixe com música ao vivo.',
    ],
    tags: ['familia', 'quiosque', 'carro', 'surf', 'pet_friendly'],
    cetesbStatus: 'impropria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.6894, lng: -45.3447 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: true, hasBoatTours: false },
  },
  {
    id: 'praia-da-gruta',
    name: 'Praia da Gruta',
    region: 'sul',
    km: 43.5,
    distanceFromCenterKm: 44.7,
    description:
      'Enseada de paredes rochosas com uma pequena gruta de acesso fácil e água cristalina. É um recanto de snorkel: as formações rochosas criam poças naturais cheias de peixe.',
    howToGet:
      'BR-101 km 43,5, sentido sul. Entrada estreita à direita, com trilha de 100 m descendo entre as rochas.',
    tips: [
      'O melhor ponto de snorkel do sul — observe a fauna na maré baixa.',
      'A trilha tem degraus naturais: tênis de solado ajuda.',
      'A enseada enche rápido na preamar: não se atrase para sair.',
    ],
    tags: ['mergulho', 'selvagem', 'trilha', 'carro'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.6927, lng: -45.3489 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: false, hasBoatTours: true },
  },
  {
    id: 'praia-da-aroeira',
    name: 'Praia da Aroeira',
    region: 'sul',
    km: 44.0,
    distanceFromCenterKm: 45.2,
    description:
      'A continuação imediata da Gruta, com a mesma água clara e o mesmo paredão rochoso. Menos conhecida, e por isso mais difícil: a trilha de acesso é curta, mas exige um scramble final.',
    howToGet:
      'Logo após a Praia da Gruta, ainda no km 44. A trilha começa escondida entre as rochas à direita da estrada.',
    tips: [
      'O último trecho da trilha é escalonagem natural — não é acessível para carrinho ou cadeira de rodas.',
      'Combine com a Gruta no mesmo roteiro: duas enseadas em uma manhã.',
      'Sem infraestrutura: leve água e lanche.',
    ],
    tags: ['mergulho', 'selvagem', 'trilha', 'carro'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.6951, lng: -45.3518 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: false, hasBoatTours: false },
  },
  {
    id: 'praia-do-sertaozinho',
    name: 'Praia do Sertãozinho',
    region: 'sul',
    km: 46.0,
    distanceFromCenterKm: 47.2,
    description:
      'Enseada de água doce e alaranjada por causa do Rio do Sertão, com sombra de mangueiras e clima de praia de bairro. Tradição de praia de família com estrutura de quiosque simples.',
    howToGet:
      'BR-101 km 46, sentido sul. Entrada à direita, com estacionamento de terra em frente ao quiosque.',
    tips: [
      'A cor alaranjada da água é natural (sedimento dos rios) — não é contaminação.',
      'Mar seguro e raso: uma das melhores opções para bebês.',
      'Pouca ondulação; a praia é mais de rio que de oceano.',
    ],
    tags: ['familia', 'quiosque', 'carro', 'pet_friendly'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.7012, lng: -45.3594 },
    features: { hasLifeguard: false, hasParking: true, hasKiosks: true, hasBoatTours: false },
  },
  {
    id: 'praia-da-burguesa',
    name: 'Praia da Burguesa',
    region: 'sul',
    km: 52.5,
    distanceFromCenterKm: 53.7,
    description:
      'A praia-ícone do surfe sul brasileiro e uma das mais fotografadas do país. Onda de qualidade mundial, costão de pedra com mirante e uma colônia de surf que vive na enseada o ano todo.',
    howToGet:
      'BR-101 km 52,5, sentido sul. Entrada principal com estacionamento rotativo e estrutura. Desça a ladeira até a praia ou siga até o costão para o mirante.',
    tips: [
      'O mirante no costão, na entrada do bairro, é o ponto de foto clássico — melhor na luz do fim da tarde.',
      'A onda é técnica e exige nível intermediário ou avançado.',
      'Aluguel de prancha e aula de surf disponíveis no local, via parceiros do Guia.',
    ],
    tags: ['surf', 'carro', 'quiosque'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.7272, lng: -45.3892 },
    features: { hasLifeguard: true, hasParking: true, hasKiosks: true, hasBoatTours: false },
  },
  {
    id: 'praia-de-paranambuco',
    name: 'Praia de Paranambuco',
    region: 'sul',
    km: 70.0,
    distanceFromCenterKm: 71.2,
    description:
      'O fim da BR-101 e o começo do esconde: praia de acesso difícil (12 km de estrada de terra ou trilha), de mar bruto e selvagem. É o destino de quem quer Ubatuba de verdade, sem estrutura e sem multidão.',
    howToGet:
      'Depois da Praia da Burguesa, siga pela BR-101 até a bifurcação da Estrada do Mar. A partir daí, cerca de 12 km de estrada de terra até Paranambuco. Alternativa: trilha a partir do km 56, de aproximadamente 4 horas.',
    tips: [
      'A trilha desde o km 56 exige experiência, bússola e bom condicionamento físico.',
      'A balsa semanal com saída de Ubatuba é a forma mais segura de chegar.',
      'Acampamento é a única opção de hospedagem — leve provisões e recolha seu lixo.',
      'Sinal de celular é praticamente inexistente. Baixe o mapa offline antes de sair.',
    ],
    tags: ['trilha', 'selvagem', 'surf', 'mergulho'],
    cetesbStatus: 'propria',
    cetesbLastUpdate: '2026-09-14',
    coordinates: { lat: -23.7852, lng: -45.4256 },
    features: {
      hasLifeguard: false,
      hasParking: true,
      hasKiosks: false,
      hasBoatTours: true,
      trailDifficulty: 'dificil',
      trailDurationMinutes: 240,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Hidratação                                                                 */
/* -------------------------------------------------------------------------- */

export const beaches: Beach[] = raw
  .map((seed) => ({
    ...seed,
    coverImage: '',
    // Galeria de exemplo: as imagens são geradas proceduralmente (ver beachArt.ts).
    gallery: [
      {
        url: '',
        author: 'Equipe do Guia',
        instagram: '@guiadepraiasubatuba',
      },
      ...(seed.features.hasKiosks
        ? [{ url: '', author: 'Comunidade Ubatuba', instagram: undefined as string | undefined }]
        : []),
    ],
  }))
  .sort((a, b) => a.km - b.km);

export const beachesById: Record<string, Beach> = Object.fromEntries(
  beaches.map((b) => [b.id, b])
);

export function getBeach(id: string): Beach | undefined {
  return beachesById[id];
}

export const beachesByRegion = {
  norte: beaches.filter((b) => b.region === 'norte'),
  centro: beaches.filter((b) => b.region === 'centro'),
  sul: beaches.filter((b) => b.region === 'sul'),
};
