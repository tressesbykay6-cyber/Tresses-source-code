import { Service, Stylist, Product, GalleryItem, Review, LoyaltyAccount } from '../types';

const makeService = (
  id: string, name: string, category: Service['category'], price: number, durationMinutes: number,
  description: string, image: string, stylistName = 'Tresses by Kay', stylistId = 'st2'
): Service => ({
  id, name, category, price, durationMinutes,
  durationLabel: durationMinutes >= 60 ? `${durationMinutes / 60} hr${durationMinutes === 60 ? '' : 's'}` : `${durationMinutes} mins`,
  stylistName, stylistId, rating: 4.9, reviewCount: 0, image, description,
  depositAmount: Math.round(price * 0.3),
});

// Full published menu. Prices are starting prices and can be refined in Admin
// once the secured management API is available.
export const MOCK_SERVICES: Service[] = [
  makeService('s1', 'Box Braids', 'Braids', 4500, 240, 'Neat, protective box braids tailored to your preferred size and length.', '/media/gallery/DbkZiW1l7NZ.webp', 'Mary Wambui', 'st1'),
  makeService('s1a', 'Braids', 'Braids', 3500, 180, 'Classic braided styling, personalised to your preferred length and finish.', '/media/gallery/DbDGbz6PmtL.webp', 'Mary Wambui', 'st1'),
  makeService('s2', 'Knotless Braids', 'Braids', 5000, 270, 'Lightweight knotless braids with a comfortable, natural-looking finish.', '/media/gallery/DbplN-ovBtX.webp', 'Mary Wambui', 'st1'),
  makeService('s3', 'Cornrows', 'Braids', 2500, 120, 'Clean, tension-conscious cornrows in classic or creative patterns.', '/media/gallery/DauOTGpiXvR.webp', 'Mary Wambui', 'st1'),
  makeService('s4', 'Crotchet Hair', 'Braids', 3500, 180, 'Secure crochet installation with a natural, full result.', '/media/gallery/DapEnucCBS4.webp', 'Mary Wambui', 'st1'),
  makeService('s5', 'Dreadlocks', 'Braids', 4500, 240, 'Dreadlock maintenance, retwist, styling, and care suited to your hair.', '/media/gallery/Daj7C3DCoAu.webp', 'Mary Wambui', 'st1'),
  makeService('s6', 'Twist Outs', 'Hair Styling', 2200, 90, 'Defined, moisturised twist-out styling with a soft, lasting finish.', '/media/gallery/DaSYAeVl1ie.webp'),
  makeService('s7', 'Natural Hair Styling', 'Hair Styling', 2500, 120, 'Healthy natural-hair styling that respects your curl pattern and scalp.', '/media/gallery/DaVfj4Dl-_7.webp'),
  makeService('s8', 'Wash And Go', 'Hair Styling', 1800, 60, 'Cleansed, conditioned, and defined wash-and-go styling for natural curls.', '/media/gallery/DaU-J7Mv5I5.webp'),
  makeService('s9', 'Hairstyling', 'Hair Styling', 2000, 75, 'Event-ready styling, finishing, and shaping for your chosen look.', '/media/gallery/Dane2jRl2w2.webp'),
  makeService('s10', 'Bridal Hair Styling', 'Hair Styling', 6000, 150, 'Consultation-led bridal hair styling designed to last through your celebration.', '/media/gallery/DacQFIci-yd.webp'),
  makeService('s11', 'Human Hair Styling', 'Wigs & Extensions', 3000, 120, 'Styling and finishing for human-hair wigs and extensions.', '/media/gallery/DbGvSoIlzHf.webp'),
  makeService('s12', 'Hair Extensions', 'Wigs & Extensions', 5000, 180, 'Extension fitting and blending for natural movement and volume.', '/media/gallery/DbLCFOql-cx.webp'),
  makeService('s13', 'Shampoo & Conditioning', 'Hair Treatments & Color', 1500, 45, 'Professional cleanse and conditioning chosen for your hair needs.', '/media/gallery/DbTEyAIFyFh.webp', 'Neema Mutua', 'st3'),
  makeService('s14', 'Hair Treatment', 'Hair Treatments & Color', 2500, 75, 'Restorative treatment focused on moisture, strength, and scalp comfort.', '/media/gallery/DI3Ir68iLgN.webp', 'Neema Mutua', 'st3'),
  makeService('s15', 'Make-up Services', 'Makeup', 3000, 75, 'Polished, long-wear make-up for events, photos, and celebrations.', '/media/gallery/DaSYAeVl1ie.webp', 'Amani Otieno', 'st5'),
  makeService('s16', 'Acrylic Nails', 'Nails', 2500, 90, 'Acrylic nail set with professional shaping and finish.', '/media/gallery/DZb00JcF-5P.webp', 'Neema Mutua', 'st3'),
  makeService('s17', 'Manicures', 'Nails', 1500, 45, 'Detailed manicure with cuticle care, shaping, and polish.', '/media/gallery/DZWxsFnFzuB.webp', 'Neema Mutua', 'st3'),
  makeService('s18', 'Pedicures', 'Nails', 2000, 60, 'Relaxing pedicure with exfoliation, care, and polish.', '/media/gallery/DZsPWWSi_38.webp', 'Neema Mutua', 'st3'),
  makeService('s19', 'Overlays', 'Nails', 1800, 60, 'Natural-nail overlay for strength and a refined finish.', '/media/gallery/DZCE0GzCxDh.webp', 'Neema Mutua', 'st3'),
  makeService('s20', 'Gum Gel Nails', 'Nails', 2200, 75, 'Flexible builder-gel manicure with durable, glossy coverage.', '/media/gallery/DZ6_O-zl_Z-.webp', 'Neema Mutua', 'st3'),
];

export const MOCK_STYLISTS: Stylist[] = [
  {
    id: 'st2',
    name: 'Kay (Founder)',
    role: 'Master Hair Architect & Wig Specialist',
    bio: 'Founder of Tresses by Kay with over 9 years shaping Nairobi’s luxury hair culture. Renowned for natural-looking HD lace wig melts and precision color.',
    photo: '/Dark_themed_logo_design_2K_202608061034.jpeg',
    specialties: ['Wigs & Extensions', 'Custom Color', 'Hair Transformation'],
    experienceYears: 9,
    rating: 5.0,
    reviewCount: 380,
    portfolio: [
      '/Dark_themed_logo_design_2K_202608061034.jpeg',
      '/Dark_themed_logo_design_2K_202608061034.jpeg',
      '/Dark_themed_logo_design_2K_202608061034.jpeg'
    ],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  },
  {
    id: 'st1',
    name: 'Mary Wambui',
    role: 'Lead Braid Artisan',
    bio: 'Painless braiding specialist who believes in scalp care as much as aesthetic perfection. Master of knotless, boho goddess, and cornrow art.',
    photo: '/Dark_themed_logo_design_2K_202608061034.jpeg',
    specialties: ['Knotless Braids', 'Boho Goddess', 'Fulani Braids', 'Cornrows'],
    experienceYears: 6,
    rating: 4.9,
    reviewCount: 240,
    portfolio: [
      '/Dark_themed_logo_design_2K_202608061034.jpeg',
      '/Dark_themed_logo_design_2K_202608061034.jpeg'
    ],
    availableDays: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat']
  },
  {
    id: 'st5',
    name: 'Amani Otieno',
    role: 'Senior Editorial & Bridal Makeup Artist',
    bio: 'Certified editorial artist specializing in skin-like finishes, rich brown-girl palettes, and camera-ready bridal perfection.',
    photo: '/Dark_themed_logo_design_2K_202608061034.jpeg',
    specialties: ['Bridal Glam', 'Soft Glam', 'Photoshoot Makeup'],
    experienceYears: 7,
    rating: 5.0,
    reviewCount: 210,
    portfolio: [
      '/Dark_themed_logo_design_2K_202608061034.jpeg',
      '/Dark_themed_logo_design_2K_202608061034.jpeg'
    ],
    availableDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  },
  {
    id: 'st3',
    name: 'Neema Mutua',
    role: 'Nail Artist & Scalp Care Specialist',
    bio: 'Precision-driven aesthetician creating minimalist Russian gel manicures and therapeutic scalp detox treatments.',
    photo: '/Dark_themed_logo_design_2K_202608061034.jpeg',
    specialties: ['Russian Gel', 'Nail Art', 'Silk Press & Detox'],
    experienceYears: 5,
    rating: 4.8,
    reviewCount: 175,
    portfolio: [
      '/Dark_themed_logo_design_2K_202608061034.jpeg'
    ],
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat']
  },
  {
    id: 'st4',
    name: 'Wanjiru Njuguna',
    role: 'Colorist & Hair Care Specialist',
    bio: 'Color chemistry enthusiast dedicated to vibrant, damage-free blondes, honey balayage, and natural curl restoration.',
    photo: '/Dark_themed_logo_design_2K_202608061034.jpeg',
    specialties: ['Balayage', 'Color Correction', 'Hydration Therapies'],
    experienceYears: 6,
    rating: 4.9,
    reviewCount: 140,
    portfolio: [
      '/Dark_themed_logo_design_2K_202608061034.jpeg'
    ],
    availableDays: ['Wed', 'Thu', 'Fri', 'Sat']
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Tresses Slick Edge Control (150g)',
    category: 'Hair Care & Styling',
    price: 1800,
    rating: 4.9,
    image: '/media/gallery/Da2WctUiSGI.webp',
    description: 'Non-flaking, firm hold edge tamer infused with argan oil and castor seed oil for a high-shine finish that lasts 24 hours.',
    inStock: true,
  },
  {
    id: 'p2',
    name: 'Luxury Double-Lined Silk Bonnet',
    category: 'Accessories',
    price: 2200,
    rating: 5.0,
    image: '/media/gallery/DapEnucCBS4.webp',
    description: '100% Mulberry silk bonnet to preserve moisture, prevent frizz, and protect braid & wig installs while sleeping.',
    inStock: true,
  },
  {
    id: 'p3',
    name: 'HD Lace Melting Band & Grip',
    category: 'Wig Essentials',
    price: 1200,
    rating: 4.8,
    image: '/media/gallery/Dane2jRl2w2.webp',
    description: 'Adjustable elastic melting band engineered for melt perfection without tension headaches or hairline pull.',
    inStock: true,
  },
  {
    id: 'p4',
    name: 'Pure Argan & Rosehip Scalp Serum (100ml)',
    category: 'Hair Care & Styling',
    price: 2800,
    rating: 4.9,
    image: '/media/gallery/DaVfj4Dl-_7.webp',
    description: 'Nourishing cold-pressed scalp elixir to stimulate growth, soothe braided scalps, and prevent itchiness.',
    inStock: true,
  },
  {
    id: 'p5',
    name: 'Complete HD Wig Install & Care Kit',
    category: 'Wig Essentials',
    price: 4500,
    rating: 5.0,
    image: '/media/gallery/DacQFIci-yd.webp',
    description: 'Includes Lace Melt Spray, Wax Stick, Edge Brush, Melting Band, and Lace Tinting Mousse in Medium Warm Brown.',
    inStock: true,
  },
  {
    id: 'p6',
    name: 'Rosewater Hydrating Scalp Mist (200ml)',
    category: 'Hair Care & Styling',
    price: 1600,
    rating: 4.7,
    image: '/media/gallery/DaU-J7Mv5I5.webp',
    description: 'Refreshing mist formulated with organic rose distillate and aloe juice to revive protective styles and lock in moisture.',
    inStock: true,
  }
];

export const MOCK_GALLERY: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Sleek Waist-Length Knotless Braids',
    category: 'Braids',
    image: '/media/gallery/DauOTGpiXvR.webp',
    likes: 342,
    stylistName: 'Mary Wambui',
  },
  {
    id: 'g2',
    title: 'Seamless HD Frontal Wig Melt Transformation',
    category: 'Wigs & Extensions',
    image: '/media/gallery/DaU-J7Mv5I5.webp',
    isBeforeAfter: true,
    beforeImage: '/media/gallery/Da2WctUiSGI.webp',
    afterImage: '/media/gallery/DaVfj4Dl-_7.webp',
    likes: 512,
    stylistName: 'Kay (Founder)',
  },
  {
    id: 'g3',
    title: 'Soft Glam Bridal Makeup with Dewy Skin',
    category: 'Makeup',
    image: '/media/gallery/Daj7C3DCoAu.webp',
    likes: 289,
    stylistName: 'Amani Otieno',
  },
  {
    id: 'g4',
    title: 'Honey Warm Balayage & Gloss Treatment',
    category: 'Hair Treatments & Color',
    image: '/media/gallery/DahuUv1l6SW.webp',
    likes: 198,
    stylistName: 'Wanjiru Njuguna',
  },
  {
    id: 'g5',
    title: 'Minimalist Milky Russian Gel Manicure',
    category: 'Nails',
    image: '/media/gallery/DacQFIci-yd.webp',
    likes: 167,
    stylistName: 'Neema Mutua',
  },
  {
    id: 'g6',
    title: 'Boho Goddess Braids with Human Hair Curls',
    category: 'Braids',
    image: '/media/gallery/DapEnucCBS4.webp',
    likes: 421,
    stylistName: 'Mary Wambui',
  },
  {
    id: 'g7',
    title: 'Behind the Chair: Custom Wig Plucking & Melt Process',
    category: 'Videos',
    image: '/media/gallery/DaVfj4Dl-_7.webp',
    videoUrl: '/media/reels/DaVfj4Dl-_7_3.mp4',
    likes: 670,
    stylistName: 'Kay (Founder)',
  },
  {
    id: 'g8',
    title: 'Silk Press Bounce & Movement',
    category: 'Hair Treatments & Color',
    image: '/media/gallery/DasnNqZlx5y.webp',
    likes: 245,
    stylistName: 'Neema Mutua',
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    clientName: 'Sharon K.',
    rating: 5,
    serviceBooked: 'Frontal Wig Install',
    date: '2 days ago',
    quote: 'Kay is a magician! My wig literally looks like it grew out of my scalp. The studio atmosphere at JKUAT Towers is so serene, private, and high-end. Best salon experience in Nairobi.',
    verified: true,
  },
  {
    id: 'r2',
    clientName: 'Nia M.',
    rating: 5,
    serviceBooked: 'Knotless Braids',
    date: '1 week ago',
    quote: 'I used to get severe tension headaches from braiding until I tried Mary. Zero pain, feather-light, and my edges are thriving. It lasted 7 full weeks looking brand new!',
    verified: true,
  },
  {
    id: 'r3',
    clientName: 'Brenda O.',
    rating: 5,
    serviceBooked: 'Bridal Glam Makeup & Trial',
    date: '2 weeks ago',
    quote: 'Amani did my bridal makeup and my bridal party’s glam. We photographed flawlessly from morning till 2 AM! She listened to everything I wanted and kept my skin looking like skin.',
    verified: true,
  },
  {
    id: 'r4',
    clientName: 'Wanjira T.',
    rating: 5,
    serviceBooked: 'Balayage & Olaplex',
    date: '3 weeks ago',
    quote: 'The level of professionalism here is unmatched. No waiting for hours, no rough handling. Wanjiru transformed my dark brown hair into honey caramel without damage.',
    verified: true,
  }
];

export const INITIAL_LOYALTY_ACCOUNT: LoyaltyAccount = {
  clientName: 'Zari Hassan',
  phone: '+254 712 345 678',
  points: 380,
  targetPoints: 500,
  nextReward: 'Free Scalp Detox Steam Treatment or Gel Polish Refresh',
  tier: 'Platinum Studio',
  upcomingBookings: [
    {
      id: 'bk-101',
      service: MOCK_SERVICES[2], // Wig install
      stylist: MOCK_STYLISTS[0], // Kay
      date: 'Saturday, Aug 15, 2026',
      timeSlot: '11:00 AM',
      depositPaid: 1000,
      totalPrice: 3500,
      status: 'Confirmed',
      clientName: 'Zari Hassan',
      clientPhone: '+254 712 345 678',
      durationMinutes: 180,
      notes: 'Please bring warm honey tone lace tint.'
    }
  ],
  pastBookings: [
    {
      id: 'bk-092',
      service: MOCK_SERVICES[0], // Knotless
      stylist: MOCK_STYLISTS[1], // Mary
      date: 'June 10, 2026',
      timeSlot: '09:00 AM',
      depositPaid: 1000,
      totalPrice: 4500,
      status: 'Completed',
      clientName: 'Zari Hassan',
      clientPhone: '+254 712 345 678',
      durationMinutes: 240,
    }
  ],
  savedInspoIds: ['g1', 'g2', 'g6']
};
