import type { Banner, UtilitiesData } from '@/types';

/* -------------------------------------------------------------------------- */
/* Aba 4 — Guia Ubatuba (utilidades públicas)                                */
/* -------------------------------------------------------------------------- */

export const utilities: UtilitiesData = {
  tpa: {
    summary:
      'A Taxa de Preservação Ambiental (TPA) é a tarifa paga por veículo automotor que entra no município de Ubatuba. Ela financia a coleta de resíduos, a limpeza das praias, a CETESB e a fiscalização ambiental.',
    howItWorks: [
      'A TPA é cobrada na barreira de controle de acesso, na entrada da Rodovia Rio-Santos.',
      'A tarifa é válida por período determinado e o valor da diária pode ser reajustado pelo Decreto Municipal.',
      'O pagamento é registrado por placa e o débito é cobrado automaticamente nas próximas passagens.',
      'Veículos com isenções são automaticamente liberados no sistema.',
    ],
    exemptions: [
      'Motocicletas e triciclos motorized.',
      'Veículos isentos por lei (viatura de emergência, coleta de lixo, ambulância).',
      'Ônibus, vans, caminhões e veículos de turismo com contrato de fretamento com a prefeitura.',
      'Moradores com veículos registrados no próprio nome no município (cadastro no site da prefeitura).',
    ],
    whereToPay: [
      'Online, no portal oficial da Prefeitura de Ubatuba (guiaubatuba.com.br).',
      'Em dinheiro ou cartão nas cabines da barreira, na entrada da BR-101.',
      'Desbloqueio automático em até 72 horas após o pagamento.',
    ],
    rates: [
      { vehicle: 'Automóvel, caminhonete e utilitário', price: 'R$ 12,00 / dia' },
      { vehicle: 'Motocicleta', price: 'R$ 6,00 / dia' },
      { vehicle: 'Ônibus e vans de turismo', price: 'R$ 25,00 / dia' },
      { vehicle: 'Caminhão de carga', price: 'R$ 20,00 / dia' },
    ],
    officialUrl: 'https://www.ubatuba.sp.gov.br/',
  },

  busLines: [
    {
      id: 'vb-01',
      code: '01',
      route: 'Centro ➔ Itagua ➔ Perequê-Açu',
      region: 'centro',
      departureWeekdays: ['06:30', '08:00', '11:00', '14:00', '17:00', '19:00'],
      departureWeekends: ['07:00', '09:00', '13:00', '16:00', '18:00'],
    },
    {
      id: 'vb-10',
      code: '10',
      route: 'Centro ➔ Sununu ➔ Lam Beach',
      region: 'norte',
      departureWeekdays: ['06:00', '09:30', '12:30', '16:00', '18:30'],
      departureWeekends: ['07:30', '10:00', '15:00', '17:30'],
    },
    {
      id: 'vb-12',
      code: '12',
      route: 'Centro ➔ São Francisco ➔ Itamambuca',
      region: 'norte',
      departureWeekdays: ['05:45', '08:45', '11:45', '14:45', '17:15', '20:00'],
      departureWeekends: ['06:30', '10:00', '13:30', '16:30', '19:00'],
    },
    {
      id: 'vb-15',
      code: '15',
      route: 'Centro ➔ Tremembé ➔ Gargau',
      region: 'norte',
      departureWeekdays: ['06:15', '10:15', '13:15', '17:45'],
      departureWeekends: ['07:15', '11:15', '15:15', '18:15'],
    },
    {
      id: 'vb-20',
      code: '20',
      route: 'Centro ➔ Enseada da Passagem ➔ Bonete',
      region: 'sul',
      departureWeekdays: ['06:20', '09:20', '12:20', '15:50', '18:50'],
      departureWeekends: ['07:20', '10:20', '14:20', '17:20'],
    },
    {
      id: 'vb-23',
      code: '23',
      route: 'Centro ➔ Praia da Burguesa',
      region: 'sul',
      departureWeekdays: ['07:00', '12:00', '16:30', '19:00'],
      departureWeekends: ['08:00', '13:00', '17:30'],
    },
  ],

  emergencyContacts: [
    {
      id: 'bombeiros-193',
      name: 'Corpo de Bombeiros',
      phone: '193',
      description: 'Incêndio, resgate, salvamento aquático e emergência em praia.',
      isEmergency: true,
      icon: '🚒',
    },
    {
      id: 'samu-192',
      name: 'SAMU',
      phone: '192',
      description: 'Emergência médica e remoção de pacientes.',
      isEmergency: true,
      icon: '🚑',
    },
    {
      id: 'pm-190',
      name: 'Polícia Militar',
      phone: '190',
      description: 'Ocorrências policiais, roubo e orientação ao turista.',
      isEmergency: true,
      icon: '🚓',
    },
    {
      id: 'defesa-civil-199',
      name: 'Defesa Civil',
      phone: '199',
      description: 'Alertas de risco de deslizamento, queda de JJJ e tsunami.',
      isEmergency: true,
      icon: '🛡️',
    },
    {
      id: 'gbmar-193',
      name: 'Grupamento Marítimo (GBMar)',
      phone: '(12) 3882-3130',
      description: 'Acidentes com vítimas dentro do mar, botes e afogados.',
      isEmergency: false,
      icon: '⛵',
    },
    {
      id: 'hospital-municipal',
      name: 'Hospital Municipal de Ubatuba',
      phone: '(12) 3832-4066',
      description: 'Pronto-socorro, retaguarda clínica e desenho de emergência geral.',
      isEmergency: false,
      icon: '🏥',
    },
    {
      id: 'cetesb',
      name: 'CETESB (Litoral Norte)',
      phone: '(12) 3865-4141',
      description: 'Balneabilidade, análise de água e denúncia de descarte illegal em praia.',
      isEmergency: false,
      icon: '🧪',
    },
    {
      id: 'marinha',
      name: 'Marinha do Brasil',
      phone: '(12) 3882-4004',
      description: 'Acidentes náuticos e salvamento em alto mar.',
      isEmergency: false,
      icon: '⚓',
    },
  ],

  tides: {
    note:
      'A tábua de marés é essencial para planejar a travessia de trilhas e a saída da praia antes do isolamento da preamar. Consulte a tabela oficial da Marinha do Brasil e confirme as condições locais com os salva-vidas na hora — as marés locais podem variar bastante nas enseadas.',
    sourceUrl: 'https://www.marinha.mil.br/chm/tabuamares/tabuamares.htm',
  },
};

/* -------------------------------------------------------------------------- */
/* Banners                                                                    */
/* -------------------------------------------------------------------------- */

export const banners: Banner[] = [
  {
    id: 'banner-escuna-couves',
    title: 'Passeio Ilha das Couves — Verão',
    subtitle: 'Bilhete a partir de R$ 90 • 10h todos os dias',
    imageUrl: '',
    targetUrl: 'https://wa.me/5512000000000?text=Ol%C3%A1%21%20Vi%20o%20Passeio%20Ilha%20das%20Couves%20no%20Guia%20de%20Praias%20Ubatuba',
    position: 'home_top',
    isActive: true,
    clicksCount: 128,
    palette: ['#0b5c92', '#1b8ec9'],
  },
  {
    id: 'banner-aula-surf',
    title: 'Aula de Surf em Itamambuca',
    subtitle: 'Prancha inclusa por R$ 79 com o Guia',
    imageUrl: '',
    targetUrl: 'https://wa.me/5512000000000?text=Ol%C3%A1%21%20Vi%20a%20Escola%20de%20Surf%20Itamambuca%20no%20Guia%20de%20Praias%20Ubatuba',
    position: 'beaches_top',
    isActive: true,
    clicksCount: 96,
    palette: ['#0b3c5d', '#2a9d8f'],
  },
  {
    id: 'banner-pousada-bahia',
    title: 'Pousada Villa Bahia',
    subtitle: 'R$ 30 de desconto na diária mencionando o Guia',
    imageUrl: '',
    targetUrl: 'https://wa.me/5512000000000?text=Ol%C3%A1%21%20Vi%20a%20Pousada%20Villa%20Bahia%20no%20Guia%20de%20Praias%20Ubatuba',
    position: 'services_top',
    isActive: true,
    clicksCount: 74,
    palette: ['#b5651d', '#ef6f53'],
  },
  {
    id: 'banner-kayak',
    title: 'Kayak ao pôr do sol',
    subtitle: 'Ubatumirim • 15% de desconto com o Guia',
    imageUrl: '',
    targetUrl: 'https://wa.me/5512000000000?text=Ol%C3%A1%21%20Vi%20o%20Ubatumirim%20Kayak%20Tours%20no%20Guia%20de%20Praias%20Ubatuba',
    position: 'home_top',
    isActive: true,
    clicksCount: 51,
    palette: ['#0b3c5d', '#6d597a'],
  },
];
