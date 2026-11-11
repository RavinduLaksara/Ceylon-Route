import type {
  PricingSettings,
  Review,
  TourPackage,
  VehicleRate,
  VehicleType,
} from '@/types/tour';

/**
 * Unsplash source helper — keeps image URLs tidy and consistent in size.
 * All hostnames are allow-listed in next.config.ts.
 */
const unsplash = (id: string, w = 1600, h = 1000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

// ---------------------------------------------------------------------------
// Pricing / settings
// ---------------------------------------------------------------------------

export const pricingSettings: PricingSettings = {
  rates: {
    'Wagon R': 0.4,
    Aqua: 0.45,
    Sedan: 0.5,
    KDH: 0.7,
  },
  driverDailyBatta: 15.0,
  // Demo number — replace with the real business line when going live.
  whatsappNumber: '+94771234567',
};

export const vehicleOrder: VehicleType[] = ['Wagon R', 'Aqua', 'Sedan', 'KDH'];

export const fleet: VehicleRate[] = [
  {
    type: 'Wagon R',
    modelName: 'Suzuki Wagon R',
    capacity: 'Up to 3 passengers · 2 bags',
    perKmRate: pricingSettings.rates['Wagon R'],
    image: unsplash('1549924231-f129b911e442', 1200, 800),
  },
  {
    type: 'Aqua',
    modelName: 'Toyota Aqua',
    capacity: 'Up to 3 passengers · 3 bags',
    perKmRate: pricingSettings.rates.Aqua,
    image: unsplash('1583121274602-3e2820c69888', 1200, 800),
  },
  {
    type: 'Sedan',
    modelName: 'Premium Sedan (Axio / Prius)',
    capacity: 'Up to 3 passengers · 3 large bags',
    perKmRate: pricingSettings.rates.Sedan,
    image: unsplash('1552519507-da3b142c6e3d', 1200, 800),
  },
  {
    type: 'KDH',
    modelName: 'Toyota KDH Van',
    capacity: 'Up to 9 passengers · 8+ bags',
    perKmRate: pricingSettings.rates.KDH,
    image: unsplash('1570125909232-eb263c188f7e', 1200, 800),
  },
];

/** Marketing detail for the fleet showcase. */
export const fleetDetails: Record<
  VehicleType,
  {
    tagline: string;
    bestFor: string;
    idealPax: string;
    luggage: string;
    highlights: string[];
    accent: string; // badge label
  }
> = {
  'Wagon R': {
    tagline: 'Budget-friendly & nimble',
    bestFor: 'Solo travellers & couples watching the budget',
    idealPax: 'Up to 3 guests',
    luggage: '2 cabin bags',
    highlights: ['Most economical per-km rate', 'Easy in tight hill-country roads', 'Great fuel economy'],
    accent: 'Best Value',
  },
  Aqua: {
    tagline: 'Eco-friendly city & touring hybrid',
    bestFor: 'Couples & small families who want efficiency',
    idealPax: 'Up to 3 guests',
    luggage: '3 bags',
    highlights: ['Hybrid — lowest emissions', 'Smooth, quiet ride', 'Perfect all-island tourer'],
    accent: 'Eco Choice',
  },
  Sedan: {
    tagline: 'Comfort & extra luggage space',
    bestFor: 'Travellers who want a plush, roomy ride',
    idealPax: 'Up to 3 guests',
    luggage: '3 large suitcases',
    highlights: ['Premium comfort seating', 'Generous boot space', 'Ideal for longer transfers'],
    accent: 'Comfort',
  },
  KDH: {
    tagline: 'Family & group luxury van',
    bestFor: 'Families and groups travelling together',
    idealPax: 'Up to 9 guests',
    luggage: '8+ bags',
    highlights: ['Spacious high-roof option', 'Keeps groups together', 'Room for gear & souvenirs'],
    accent: 'Group Luxury',
  },
};

/** Trust signals shared across the fleet. */
export const fleetPerks = [
  'Powerful A/C',
  'USB charging ports',
  'English-speaking driver-guide',
  'Bottled water',
];

// ---------------------------------------------------------------------------
// Tour packages
// ---------------------------------------------------------------------------

export const tourPackages: TourPackage[] = [
  {
    id: 'pkg-cultural-triangle-04',
    slug: 'cultural-triangle-kandy-highlights',
    title: '04 Days Cultural Triangle & Kandy Highlights',
    subtitle: 'Ancient kingdoms, cave temples & the sacred city of Kandy',
    durationDays: 4,
    durationNights: 3,
    approxDistanceKm: 450,
    travelStyle: ['Culture', 'Scenic'],
    overview:
      'Step into the heart of Sri Lanka’s Cultural Triangle. Climb the legendary Sigiriya Lion Rock, wander the painted Dambulla cave temples, cycle the ruins of Polonnaruwa, and witness the evening rituals at the Temple of the Sacred Tooth Relic in Kandy — all at your own pace with a private driver-guide.',
    coverImage: unsplash('1588258219511-64eb629cb833', 1600, 1000),
    galleryImages: [
      unsplash('1588258219511-64eb629cb833', 1200, 800),
      unsplash('1537996194471-e657df975ab4', 1200, 800),
      unsplash('1476514525535-07fb3b4ae5f1', 1200, 800),
      unsplash('1470770841072-f978cf4d019e', 1200, 800),
    ],
    itinerary: [
      {
        day: 1,
        title: 'Airport → Sigiriya & Dambulla',
        activities: [
          'Private pick-up from Bandaranaike International Airport',
          'Scenic drive to the Cultural Triangle',
          'Explore the golden Dambulla Cave Temple',
        ],
        travelTime: '≈ 4 hrs driving',
        overnightStay: 'Sigiriya',
      },
      {
        day: 2,
        title: 'Sigiriya Lion Rock & Village Tour',
        activities: [
          'Sunrise climb of Sigiriya Rock Fortress',
          'Traditional village tour with bullock-cart & catamaran ride',
          'Optional Pidurangala viewpoint',
        ],
        travelTime: '≈ 1 hr driving',
        overnightStay: 'Sigiriya',
      },
      {
        day: 3,
        title: 'Polonnaruwa → Kandy',
        activities: [
          'Cycle the ancient ruins of Polonnaruwa',
          'Drive to Kandy via the Matale spice gardens',
          'Evening Kandyan cultural dance show',
        ],
        travelTime: '≈ 3.5 hrs driving',
        overnightStay: 'Kandy',
      },
      {
        day: 4,
        title: 'Kandy → Peradeniya → Departure',
        activities: [
          'Temple of the Sacred Tooth Relic',
          'Royal Botanical Gardens, Peradeniya',
          'Transfer to airport / Colombo',
        ],
        travelTime: '≈ 3.5 hrs driving',
        overnightStay: 'Departure day',
      },
    ],
    inclusions: [
      'Private A/C vehicle with driver-guide',
      'All fuel, tolls & parking',
      'Driver meals & accommodation',
      'Airport pick-up & drop-off',
      'Bottled water daily',
    ],
    exclusions: [
      'Entrance tickets & site fees',
      'Hotel accommodation & meals',
      'Personal expenses & tips',
      'Travel insurance',
    ],
    isFeatured: true,
  },
  {
    id: 'pkg-epic-adventure-08',
    slug: 'epic-sri-lanka-adventure',
    title: '08 Days Epic Sri Lanka Adventure',
    subtitle: 'Cycling, canoeing, trekking, rafting, safari & beach',
    durationDays: 8,
    durationNights: 7,
    approxDistanceKm: 850,
    travelStyle: ['Adventure', 'Wildlife', 'Scenic'],
    overview:
      'The ultimate adrenaline circuit of the island. Cycle around Sigiriya, canoe the Kalu Ganga, trek the misty Knuckles range, raft the white water at Kitulgala, track elephants on a Udawalawe safari and unwind on the golden sands of Mirissa. Built for travellers who want to feel Sri Lanka, not just see it.',
    coverImage: unsplash('1566296314736-6eaac1ca0cb9', 1600, 1000),
    galleryImages: [
      unsplash('1566296314736-6eaac1ca0cb9', 1200, 800),
      unsplash('1551632811-561732d1e306', 1200, 800),
      unsplash('1518548419970-58e3b4079ab2', 1200, 800),
      unsplash('1544735716-392fe2489ffa', 1200, 800),
    ],
    itinerary: [
      {
        day: 1,
        title: 'Airport → Sigiriya',
        activities: ['Private airport pick-up', 'Transfer to Sigiriya', 'Sunset at Pidurangala Rock'],
        travelTime: '≈ 4 hrs driving',
        overnightStay: 'Sigiriya',
      },
      {
        day: 2,
        title: 'Sigiriya Cycling & Rock Fortress',
        activities: ['Morning countryside cycling tour', 'Climb Sigiriya Lion Rock', 'Village lunch experience'],
        travelTime: '≈ 1 hr driving',
        overnightStay: 'Sigiriya',
      },
      {
        day: 3,
        title: 'Kalu Ganga Canoeing → Knuckles',
        activities: ['Canoe the Kalu Ganga river', 'Drive to the Knuckles Conservation Forest'],
        travelTime: '≈ 3 hrs driving',
        overnightStay: 'Knuckles / Kandy',
      },
      {
        day: 4,
        title: 'Knuckles Trekking',
        activities: ['Guided trek through Knuckles trails', 'Waterfalls & mini-world’s-end viewpoints'],
        travelTime: '≈ 1.5 hrs driving',
        overnightStay: 'Kandy',
      },
      {
        day: 5,
        title: 'Kitulgala White-Water Rafting',
        activities: ['Grade 2–3 white-water rafting', 'Rainforest stream walk'],
        travelTime: '≈ 2.5 hrs driving',
        overnightStay: 'Kitulgala',
      },
      {
        day: 6,
        title: 'Udawalawe Safari',
        activities: ['Drive south to Udawalawe', 'Afternoon jeep safari — wild elephants'],
        travelTime: '≈ 4 hrs driving',
        overnightStay: 'Udawalawe',
      },
      {
        day: 7,
        title: 'Mirissa Beach',
        activities: ['Transfer to the south coast', 'Relax on Mirissa beach', 'Optional whale-watching (seasonal)'],
        travelTime: '≈ 2.5 hrs driving',
        overnightStay: 'Mirissa',
      },
      {
        day: 8,
        title: 'Mirissa → Departure',
        activities: ['Morning at leisure', 'Transfer to airport'],
        travelTime: '≈ 3 hrs driving',
        overnightStay: 'Departure day',
      },
    ],
    inclusions: [
      'Private A/C vehicle with driver-guide',
      'All fuel, tolls & parking',
      'Driver meals & accommodation',
      'Airport pick-up & drop-off',
      'Bottled water daily',
    ],
    exclusions: [
      'Adventure activity fees (rafting, safari, canoeing)',
      'Entrance tickets & site fees',
      'Hotel accommodation & meals',
      'Personal expenses, tips & insurance',
    ],
    isFeatured: true,
  },
  {
    id: 'pkg-southern-coast-06',
    slug: 'southern-coast-wildlife-safari',
    title: '06 Days Southern Coast & Wildlife Safari',
    subtitle: 'Dutch forts, palm-fringed beaches & leopard country',
    durationDays: 6,
    durationNights: 5,
    approxDistanceKm: 550,
    travelStyle: ['Wildlife', 'Scenic', 'Culture'],
    overview:
      'Trade the highlands for the tropics. Explore the ramparts of Galle Fort, chase sunsets at Mirissa, track leopards and elephants on a Yala safari, and wind down in the lagoon resort town of Bentota. A relaxed coastal loop with just the right dose of wildlife.',
    coverImage: unsplash('1586611292717-f828b167408c', 1600, 1000),
    galleryImages: [
      unsplash('1586611292717-f828b167408c', 1200, 800),
      unsplash('1563911302283-d2bc129e7570', 1200, 800),
      unsplash('1535338454770-8be927b5a00b', 1200, 800),
      unsplash('1604999565976-8913ad2ddb7c', 1200, 800),
    ],
    itinerary: [
      {
        day: 1,
        title: 'Airport → Bentota',
        activities: ['Private airport pick-up', 'Drive down the southern expressway', 'Bentota lagoon boat safari'],
        travelTime: '≈ 2.5 hrs driving',
        overnightStay: 'Bentota',
      },
      {
        day: 2,
        title: 'Bentota → Galle',
        activities: ['Sea-turtle hatchery visit', 'Explore historic Galle Fort on foot', 'Sunset on the ramparts'],
        travelTime: '≈ 1.5 hrs driving',
        overnightStay: 'Galle',
      },
      {
        day: 3,
        title: 'Galle → Mirissa',
        activities: ['Coconut Tree Hill & Mirissa beach', 'Stilt fishermen photo stop', 'Beachfront evening'],
        travelTime: '≈ 1 hr driving',
        overnightStay: 'Mirissa',
      },
      {
        day: 4,
        title: 'Mirissa → Yala',
        activities: ['Scenic coastal drive to Yala', 'Afternoon leisure'],
        travelTime: '≈ 2.5 hrs driving',
        overnightStay: 'Yala / Tissamaharama',
      },
      {
        day: 5,
        title: 'Yala National Park Safari',
        activities: ['Early-morning jeep safari — leopards & elephants', 'Return for leisure / Tissa lake'],
        travelTime: '≈ 1 hr driving',
        overnightStay: 'Yala / Tissamaharama',
      },
      {
        day: 6,
        title: 'Yala → Departure',
        activities: ['Drive back toward Colombo / airport', 'Departure'],
        travelTime: '≈ 5 hrs driving',
        overnightStay: 'Departure day',
      },
    ],
    inclusions: [
      'Private A/C vehicle with driver-guide',
      'All fuel, tolls & parking',
      'Driver meals & accommodation',
      'Airport pick-up & drop-off',
      'Bottled water daily',
    ],
    exclusions: [
      'Yala safari jeep & park fees',
      'Entrance tickets & site fees',
      'Hotel accommodation & meals',
      'Personal expenses, tips & insurance',
    ],
    isFeatured: false,
  },
];

/** All travel-style tags present across packages — powers the filter bar. */
export const travelStyles: string[] = Array.from(
  new Set(tourPackages.flatMap((p) => p.travelStyle)),
).sort();

export function getPackageBySlug(slug: string): TourPackage | undefined {
  return tourPackages.find((p) => p.slug === slug);
}

// ---------------------------------------------------------------------------
// Verified reviews
// ---------------------------------------------------------------------------

export const reviews: Review[] = [
  {
    id: 'rev-1',
    reviewerName: 'Emily Carter',
    country: 'United Kingdom',
    countryCode: 'gb',
    rating: 5,
    comment:
      'Our driver-guide was exceptional — punctual, warm and endlessly knowledgeable. The route transparency meant zero surprises on cost. Climbing Sigiriya at sunrise was a highlight of our lives.',
    date: '2025-09-18',
    packageSlug: 'cultural-triangle-kandy-highlights',
  },
  {
    id: 'rev-2',
    reviewerName: 'Lukas Weber',
    country: 'Germany',
    countryCode: 'de',
    rating: 5,
    comment:
      'The 8-day adventure was perfectly paced. Rafting at Kitulgala, the Knuckles trek and the Udawalawe elephants — all seamless in a spotless, cool KDH van. Flexible, honest and great value.',
    date: '2025-08-30',
    packageSlug: 'epic-sri-lanka-adventure',
  },
  {
    id: 'rev-3',
    reviewerName: 'Olivia Nguyen',
    country: 'Australia',
    countryCode: 'au',
    rating: 5,
    comment:
      'We customised the whole southern coast trip over WhatsApp before arriving. Galle Fort and the Yala leopard sighting were unforgettable. No hidden charges, exactly as quoted.',
    date: '2025-10-05',
    packageSlug: 'southern-coast-wildlife-safari',
  },
  {
    id: 'rev-4',
    reviewerName: 'Camille Laurent',
    country: 'France',
    countryCode: 'fr',
    rating: 4,
    comment:
      'A beautifully organised private tour. Clean car, safe driving and a guide who clearly loves his country. We only wished we had booked more days — the island is magic.',
    date: '2025-07-22',
    packageSlug: 'cultural-triangle-kandy-highlights',
  },
  {
    id: 'rev-5',
    reviewerName: 'James Mitchell',
    country: 'United Kingdom',
    countryCode: 'gb',
    rating: 5,
    comment:
      'Booking felt effortless and trustworthy from the first message. The pricing breakdown (fuel, batta, tolls) was refreshingly clear. Highly recommend CeylonRoute to any first-timer.',
    date: '2025-06-14',
  },
];
