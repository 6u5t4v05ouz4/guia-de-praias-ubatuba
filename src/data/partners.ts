import type { Partner } from '@/types';
import { beachesById } from './beaches';

/**
 * Parceiros comerciais semente.
 *
 * Os telefones abaixo são de demonstração (placeholder). O plano comercial descrito
 * em docs/BUSINESS_MODEL.md parte do cadastro real feito pelo painel /admin
 * (Módulo 2 — Gerenciamento de Parceiros), que substitui esta lista.
 *
 * `logoUrl` vazio = arte procedural offline gerada por `src/assets/partnerArt.ts`.
 */

const DEMO_WHATSAPP = '5512000000000';

function leadMessage(partnerName: string, beachName?: string): string {
  const where = beachName ? ` para a ${beachName}` : '';
  return `Olá! Vi o ${partnerName}${where} no Guia de Praias Ubatuba e gostaria de mais informações.`;
}

const seeds: Array<
  Omit<Partner, 'logoUrl' | 'defaultMessage' | 'whatsapp' | 'isActive' | 'beachId'> & {
    beachId?: string;
    whatsapp?: string;
  }
> = [
  /* ------------------------- Restaurantes & quiosques ---------------------- */
  {
    id: 'quiosque-estrela-do-mar',
    name: 'Quiosque Estrela do Mar',
    category: 'restaurante_quiosque',
    beachId: 'praia-de-itamambuca',
    region: 'norte',
    shortDescription: 'Camarão grelhado na brasa e chopp artesanal direto na areia de Itamambuca.',
    isFeatured: true,
    discountInfo: '10% de desconto mencionando o Guia de Praias',
    plan: 'vip',
    rating: 4.8,
    address: 'BR-101 km 13,4 — Itamambuca',
    highlights: ['Rodízio de camarão', 'Chopp artesanal', 'Fim de tarde com música ao vivo'],
  },
  {
    id: 'quiosque-praia-grande',
    name: 'Quiosque do Marcos',
    category: 'restaurante_quiosque',
    beachId: 'praia-grande',
    region: 'centro',
    shortDescription: 'Comida caseira por quilo, com mesas na sombra da orla da Praia Grande.',
    isFeatured: false,
    plan: 'verificado',
    rating: 4.5,
    address: 'Av. Getúlio Vargas, s/n — Centro',
    highlights: ['Comida caseira', 'Sombra na orla', 'Marmita para viagem'],
  },
  {
    id: 'peixaria-enfeite-do-bonete',
    name: 'Peixaria Enfeite do Bonete',
    category: 'restaurante_quiosque',
    beachId: 'praia-do-bonete',
    region: 'sul',
    shortDescription: 'Peixe frito e moqueca, servidos na beach após o almoço.',
    isFeatured: false,
    plan: 'verificado',
    rating: 4.7,
    address: 'BR-101 km 41 — Bonete',
    highlights: ['Peixe frito', 'Moqueca capixaba', 'Sobremesa de caju'],
  },
  {
    id: 'restaurante-enseada-passagem',
    name: 'Restaurante Enseada',
    category: 'restaurante_quiosque',
    beachId: 'praia-da-enseada-da-passagem',
    region: 'sul',
    shortDescription: 'Almoço em família com vista para a enseada e porção generosa de camarão.',
    isFeatured: false,
    plan: 'verificado',
    rating: 4.6,
    address: 'BR-101 km 34 — Enseada da Passagem',
    highlights: ['Vista para o mar', 'Camarão empanado', 'Estacionamento próprio'],
  },

  /* --------------------------- Pousadas & hospedagens ---------------------- */
  {
    id: 'pousada-villa-bahia',
    name: 'Pousada Villa Bahia',
    category: 'pousada_hotel',
    region: 'norte',
    shortDescription: 'Suítes a 300 m da Praia de São Francisco, com varanda para a mata.',
    isFeatured: true,
    discountInfo: 'R$ 30 de desconto na diária mencionando o Guia',
    plan: 'verificado',
    rating: 4.9,
    address: 'BR-101 km 12 — São Francisco',
    highlights: ['A 300 m da praia', 'Café da manhã incluso', 'Estacionamento fechado'],
  },
  {
    id: 'pousada-mata-atlantica',
    name: 'Pousada Mata Atlântica',
    category: 'pousada_hotel',
    region: 'sul',
    shortDescription: 'Pousada rustica em meio à mata, a 10 min de carro da Praia da Burguesa.',
    isFeatured: false,
    plan: 'basico',
    rating: 4.7,
    address: 'Estrada do Mar, km 4 — Ubatumirim',
    highlights: ['Trilha privativa', 'Banheira de imersão', 'Café artesanal'],
  },

  /* ------------------------ Passeios de barco & náutico --------------------- */
  {
    id: 'escuna-ilha-das-couves',
    name: 'Escuna Ilha das Couves',
    category: 'passeio_nautico',
    region: 'sul',
    shortDescription: 'Passeio às 9h com almoço, mergulho e parada para piquenque na ilha.',
    isFeatured: true,
    discountInfo: 'R$ 15 de desconto por pessoa com o código GUIA10',
    plan: 'master',
    rating: 4.9,
    address: 'Embarque no cais do Centro, Ubatuba',
    highlights: [
      'Bilhete a partir de R$ 90',
      'Almoço e Refrigerante inclusos',
      'Equipamento de snorkel incluso',
    ],
  },
  {
    id: 'escuna-ilha-anchieta',
    name: 'Escuna Ilha Anchieta',
    category: 'passeio_nautico',
    region: 'centro',
    shortDescription: 'Roteiro Sul com Ilhabela, paradas para mergulho e praia selvagem.',
    isFeatured: true,
    plan: 'vip',
    rating: 4.8,
    address: 'Cais do Centro, Ubatuba',
    highlights: ['Bilhete a partir de R$ 120', 'Ilhabela', 'Mergulho com equipamento'],
  },
  {
    id: 'marinheiro-bananeira',
    name: 'Marinheiro Banana Ride',
    category: 'passeio_nautico',
    region: 'norte',
    shortDescription: 'Banana boat, jet ski e caiaque na enseada do Perequê-Açu.',
    isFeatured: false,
    discountInfo: '8% de desconto com o Guia',
    plan: 'verificado',
    rating: 4.6,
    address: 'Praia do Perequê-Açu, Ubatuba',
    highlights: ['Banana boat', 'Jet ski', 'Caiaque'],
  },

  /* --------------------------- Escolas de surf ----------------------------- */
  {
    id: 'escola-surf-itamambuca',
    name: 'Escola de Surf Itamambuca',
    category: 'escola_surf',
    beachId: 'praia-de-itamambuca',
    region: 'norte',
    shortDescription: 'Aula para iniciantes todos os dias, das 7h às 10h, com pranchas inclusas.',
    isFeatured: true,
    discountInfo: 'Aula + aluguel de prancha por R$ 79 (promo do Guia)',
    plan: 'vip',
    rating: 4.9,
    address: 'BR-101 km 13,4 — Itamambuca',
    highlights: ['Aula para iniciante', 'Prancha inclusa', 'Turmas pequenas'],
  },
  {
    id: 'escola-surf-vila-vermelha',
    name: 'Escola de Surf Vila Vermelha',
    category: 'escola_surf',
    region: 'norte',
    shortDescription: 'Surf e bodyboarding para todos os níveis na enseada mais aberta do norte.',
    isFeatured: false,
    plan: 'verificado',
    rating: 4.7,
    address: 'BR-101 km 8 — Vila',
    highlights: ['Surf e bodyboard', 'Todos os níveis', 'Aluguel de prancha'],
  },

  /* --------------------- Caiaque, SUP & equipamentos ----------------------- */
  {
    id: 'aluguel-caiaque-gargaú',
    name: 'Ubatumirim Kayak Tours',
    category: 'aluguel_equipamentos',
    region: 'norte',
    shortDescription: 'Passeio de caiak pelo mar aberto ao pôr do sol, com guia e colete.',
    isFeatured: true,
    discountInfo: '15% de desconto com o Guia',
    plan: 'vip',
    rating: 4.8,
    address: 'Praia de Ubatumirim, Ubatuba',
    highlights: ['Pôr do sol', 'Guia incluso', 'Colete incluso'],
  },
  {
    id: 'stand-up-paddle-lagoa',
    name: 'SUP Lagoa do Sununu',
    category: 'aluguel_equipamentos',
    region: 'norte',
    shortDescription: 'Aluguel de SUP e caiaque na lagoa de água doce, ideal para famílias.',
    isFeatured: false,
    plan: 'verificado',
    rating: 4.5,
    address: 'Lagoa do Sununu, Ubatuba',
    highlights: ['Água doce e calma', 'Perfeito para famílias', 'Remo incluso'],
  },
  {
    id: 'mergulho-baleia-azul',
    name: 'Mergulho Baía de Ubatuba',
    category: 'aluguel_equipamentos',
    region: 'sul',
    shortDescription: 'Mergulho em apnea nas enseadas do sul, com instrutor certificado.',
    isFeatured: false,
    plan: 'verificado',
    rating: 4.6,
    address: 'Praia da Gruta, Ubatuba',
    highlights: ['Mergulho em apnea', 'Instrutor certificado', 'Frasco incluso'],
  },

  /* ------------------------ Comércio local & serviços ---------------------- */
  {
    id: 'mercado-ubatuba-centro',
    name: 'Mercado Ubatuba Centro',
    category: 'servicos_locais',
    region: 'centro',
    shortDescription: 'O mercadinho do centro, com produtos locais e praia a 300 m.',
    isFeatured: false,
    plan: 'basico',
    rating: 4.4,
    address: 'Rua Droveria, 1200 — Centro',
    highlights: ['Produtos locais', 'A 300 m da praia', 'Aberto até 22h'],
  },
  {
    id: 'tapioca-da-praia',
    name: 'Tapioca da Praia',
    category: 'servicos_locais',
    region: 'norte',
    shortDescription: 'Tapiocas e açaí na saída do quiosque, com entrega na faixa de areia.',
    isFeatured: false,
    plan: 'verificado',
    rating: 4.8,
    address: 'BR-101 km 13,4 — Itamambuca',
    highlights: ['Açaí e tapioca', 'Entrega na areia', 'Sem gluten'],
  },
  {
    id: 'aluguel-bicicleta-costa-verde',
    name: 'Aluguel de Bicicleta Costa Verde',
    category: 'servicos_locais',
    region: 'centro',
    shortDescription: 'Bicicletas e pranchas de skate para explorar a orla e a calçada do Cruzeiro.',
    isFeatured: false,
    plan: 'basico',
    rating: 4.3,
    address: 'Av. Olavo Fontoura, 500 — Centro',
    highlights: ['Bicicleta urbana', 'Prancha de skate', 'Óculos incluso'],
  },
];

export const partners: Partner[] = seeds.map((seed) => ({
  ...seed,
  logoUrl: '',
  whatsapp: seed.whatsapp ?? DEMO_WHATSAPP,
  defaultMessage: leadMessage(
    seed.name,
    seed.beachId ? (beachesById[seed.beachId]?.name ?? undefined) : undefined
  ),
  isActive: true,
}));

export const partnersById: Record<string, Partner> = Object.fromEntries(
  partners.map((p) => [p.id, p])
);

export function getPartner(id: string): Partner | undefined {
  return partnersById[id];
}
