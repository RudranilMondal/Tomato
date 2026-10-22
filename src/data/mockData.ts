import { Restaurant, Cuisine, Coupon, UserProfile, RiderInfo } from '../types';

export const CUISINES: Cuisine[] = [
  { id: '1', name: 'Biryani', iconUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '2', name: 'Pizza', iconUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '3', name: 'Burgers', iconUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '4', name: 'North Indian', iconUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '5', name: 'South Indian', iconUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '6', name: 'Chinese', iconUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '7', name: 'Desserts', iconUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '8', name: 'Healthy', iconUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '9', name: 'Rolls & Wraps', iconUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200&auto=format&fit=crop&q=80' },
  { id: '10', name: 'Coffee & Shakes', iconUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=200&auto=format&fit=crop&q=80' }
];

export const COUPONS: Coupon[] = [
  {
    code: 'TOMATTTO50',
    title: '50% OFF',
    description: 'Get 50% discount up to ₹100 on your feast',
    discountPercentage: 50,
    maxDiscount: 100,
    minOrderValue: 199
  },
  {
    code: 'FREESHIP',
    title: 'FREE DELIVERY',
    description: 'Zero delivery charges on orders above ₹249',
    discountPercentage: 100,
    maxDiscount: 35,
    minOrderValue: 249
  },
  {
    code: 'GOURMET20',
    title: 'FLAT 20% OFF',
    description: '20% off on premium dining up to ₹150',
    discountPercentage: 20,
    maxDiscount: 150,
    minOrderValue: 399
  },
  {
    code: 'WELCOME',
    title: 'WELCOME BONUS',
    description: 'Flat ₹75 off for all fresh Tomattto foodies',
    discountPercentage: 30,
    maxDiscount: 75,
    minOrderValue: 149
  }
];

export const INITIAL_USER: UserProfile = {
  id: 'usr-001',
  name: 'Souvik Mukherjee',
  phone: '+91 98765 43210',
  email: 'souvik@tomattto.app',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  addresses: [
    {
      id: 'addr-1',
      label: 'Home',
      line: 'Flat 402, Sunset Heights, 100ft Road, Indiranagar, Bengaluru',
      isDefault: true
    },
    {
      id: 'addr-2',
      label: 'Work',
      line: 'WeWork Galaxy, 43 Residency Rd, Shanthala Nagar, Bengaluru',
      isDefault: false
    }
  ]
};

export const SAMPLE_RIDER: RiderInfo = {
  id: 'rdr-701',
  name: 'Vikram Singh',
  phone: '+91 98234 56789',
  photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  rating: 4.9,
  vehicleNumber: 'KA 03 EN 4592',
  lat: 12.972,
  lng: 77.642
};

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Behrouz Biryani',
    slug: 'behrouz-biryani',
    tagline: 'Royal, slow-cooked Persian Dum Biryani',
    description: 'Centuries-old secret royal recipe layered with exotic spices, tender meat, and aromatic long grain basmati rice.',
    coverImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    ratingCount: 2840,
    prepTimeMinutes: 28,
    costForTwo: 600,
    isPureVeg: false,
    isOpen: true,
    address: 'Indiranagar 100ft Road, Bengaluru',
    distanceKm: 1.8,
    cuisines: ['Biryani', 'Mughlai', 'Kebabs'],
    offerText: '50% OFF up to ₹100',
    categories: [
      {
        id: 'cat-1-1',
        restaurantId: 'rest-1',
        name: 'Royal Dum Biryani',
        sortOrder: 1,
        items: [
          {
            id: 'item-1-1',
            restaurantId: 'rest-1',
            categoryId: 'cat-1-1',
            name: 'Dum Gosht Biryani (Mutton)',
            description: 'Tender boneless mutton marinated in royal spices, layered with fragrant basmati and saffron milk.',
            price: 445,
            discountPrice: 399,
            dietary: 'non_veg',
            imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true,
            variants: [
              { id: 'v1', name: 'Regular (Serves 1)', price: 445 },
              { id: 'v2', name: 'King Size (Serves 2-3)', price: 799 }
            ],
            addons: [
              { id: 'a1', name: 'Mirchi Ka Salan', price: 35 },
              { id: 'a2', name: 'Burani Raita', price: 40 },
              { id: 'a3', name: 'Gulab Jamun (1 pc)', price: 45 }
            ]
          },
          {
            id: 'item-1-2',
            restaurantId: 'rest-1',
            categoryId: 'cat-1-1',
            name: 'Zaikedaar Paneer Biryani',
            description: 'Fresh malai paneer cubes slow-cooked in a rich spiced gravy atop layered long grain rice.',
            price: 345,
            discountPrice: 315,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true,
            variants: [
              { id: 'v3', name: 'Regular (Serves 1)', price: 345 },
              { id: 'v4', name: 'King Size (Serves 2-3)', price: 620 }
            ],
            addons: [
              { id: 'a1', name: 'Mirchi Ka Salan', price: 35 },
              { id: 'a2', name: 'Burani Raita', price: 40 }
            ]
          },
          {
            id: 'item-1-3',
            restaurantId: 'rest-1',
            categoryId: 'cat-1-1',
            name: 'Murgh Makhani Biryani',
            description: 'Smoked boneless chicken tikka cooked in creamy makhani gravy layered with royal dum rice.',
            price: 385,
            discountPrice: 349,
            dietary: 'non_veg',
            imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=80',
            isBestseller: false,
            isInStock: true,
            variants: [
              { id: 'v5', name: 'Regular (Serves 1)', price: 385 },
              { id: 'v6', name: 'King Size (Serves 2-3)', price: 699 }
            ],
            addons: [
              { id: 'a1', name: 'Mirchi Ka Salan', price: 35 },
              { id: 'a2', name: 'Burani Raita', price: 40 }
            ]
          }
        ]
      },
      {
        id: 'cat-1-2',
        restaurantId: 'rest-1',
        name: 'Royal Starters & Kebabs',
        sortOrder: 2,
        items: [
          {
            id: 'item-1-4',
            restaurantId: 'rest-1',
            categoryId: 'cat-1-2',
            name: 'Murgh Kefta Kebab',
            description: 'Mouth-melting minced chicken skewers spiced with royal caraway and cooked over glowing embers.',
            price: 275,
            discountPrice: 245,
            dietary: 'non_veg',
            imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true,
            addons: [
              { id: 'a4', name: 'Mint Chutney Dip', price: 25 },
              { id: 'a5', name: 'Rumali Roti', price: 30 }
            ]
          },
          {
            id: 'item-1-5',
            restaurantId: 'rest-1',
            categoryId: 'cat-1-2',
            name: 'Falafel with Hummus & Dip',
            description: 'Crispy chickpea herb patties served with creamy sesame tahini and house pickles.',
            price: 220,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&auto=format&fit=crop&q=80',
            isInStock: true
          }
        ]
      },
      {
        id: 'cat-1-3',
        restaurantId: 'rest-1',
        name: 'Desserts & Beverages',
        sortOrder: 3,
        items: [
          {
            id: 'item-1-6',
            restaurantId: 'rest-1',
            categoryId: 'cat-1-3',
            name: 'Gulab Jamun (Set of 2)',
            description: 'Warm golden khoya dumplings steeped in rose water and cardamom infused sugar syrup.',
            price: 95,
            discountPrice: 85,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true
          }
        ]
      }
    ]
  },
  {
    id: 'rest-2',
    name: 'Brik Oven Neapolitan',
    slug: 'brik-oven',
    tagline: 'Artisanal Sourdough & Woodfired Pizza',
    description: 'Authentic Naples style hand-tossed sourdough pizzas baked at 450°C in our imported oven.',
    coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    ratingCount: 4120,
    prepTimeMinutes: 22,
    costForTwo: 750,
    isPureVeg: false,
    isOpen: true,
    address: 'Church Street, Central Bengaluru',
    distanceKm: 2.4,
    cuisines: ['Pizza', 'Italian', 'Pasta'],
    offerText: 'Flat 20% OFF',
    categories: [
      {
        id: 'cat-2-1',
        restaurantId: 'rest-2',
        name: 'Woodfired Pizzas (11 inch)',
        sortOrder: 1,
        items: [
          {
            id: 'item-2-1',
            restaurantId: 'rest-2',
            categoryId: 'cat-2-1',
            name: 'The Margherita Verace',
            description: 'San Marzano tomato sauce, fresh mozzarella fior di latte, extra virgin olive oil, and sweet Italian basil.',
            price: 495,
            discountPrice: 445,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true,
            addons: [
              { id: 'a2-1', name: 'Fresh Burrata Ball', price: 160 },
              { id: 'a2-2', name: 'Hot Honey Drizzle', price: 40 },
              { id: 'a2-3', name: 'Extra Fior Di Latte', price: 80 }
            ]
          },
          {
            id: 'item-2-2',
            restaurantId: 'rest-2',
            categoryId: 'cat-2-1',
            name: 'Smoked Pepperoni Diablo',
            description: 'Zesty pork pepperoni, red chili flakes, roasted garlic, and mozzarella over crisp bubbly sourdough.',
            price: 645,
            dietary: 'non_veg',
            imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true,
            addons: [
              { id: 'a2-2', name: 'Hot Honey Drizzle', price: 40 },
              { id: 'a2-4', name: 'Truffle Oil Infusion', price: 95 }
            ]
          },
          {
            id: 'item-2-3',
            restaurantId: 'rest-2',
            categoryId: 'cat-2-1',
            name: 'Truffle Funghi & Parmesan',
            description: 'Wild forest button mushrooms, roasted thyme, creamy white sauce, and shaved Grana Padano.',
            price: 585,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80',
            isInStock: true
          }
        ]
      },
      {
        id: 'cat-2-2',
        restaurantId: 'rest-2',
        name: 'Sides & Dips',
        sortOrder: 2,
        items: [
          {
            id: 'item-2-4',
            restaurantId: 'rest-2',
            categoryId: 'cat-2-2',
            name: 'Garlic Pull-Apart Bread',
            description: 'Soft sourdough knots tossed in parsley garlic butter with melted parmesan.',
            price: 240,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&auto=format&fit=crop&q=80',
            isInStock: true
          }
        ]
      }
    ]
  },
  {
    id: 'rest-3',
    name: 'Truffles Smash Burgers',
    slug: 'truffles-burgers',
    tagline: 'Legendary Juiciest Burgers & Shakes',
    description: 'Voted Bengaluru\'s favourite burger joint for over 15 years. Gourmet brioche buns with handcrafted patties.',
    coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    rating: 4.5,
    ratingCount: 9300,
    prepTimeMinutes: 25,
    costForTwo: 450,
    isPureVeg: false,
    isOpen: true,
    address: 'Koramangala 5th Block, Bengaluru',
    distanceKm: 3.1,
    cuisines: ['Burgers', 'American', 'Shakes'],
    offerText: 'Buy 1 Get 1 on Shakes',
    categories: [
      {
        id: 'cat-3-1',
        restaurantId: 'rest-3',
        name: 'Signature Burgers',
        sortOrder: 1,
        items: [
          {
            id: 'item-3-1',
            restaurantId: 'rest-3',
            categoryId: 'cat-3-1',
            name: 'All American Cheese Burger',
            description: 'Crispy seasoned chicken patty, melted cheddar, lettuce, gherkins and secret thousand island glaze.',
            price: 260,
            discountPrice: 235,
            dietary: 'non_veg',
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true,
            addons: [
              { id: 'a3-1', name: 'Add Bacon Strip', price: 60 },
              { id: 'a3-2', name: 'Double Cheese Slice', price: 35 },
              { id: 'a3-3', name: 'Peri Peri Fries (Small)', price: 75 }
            ]
          },
          {
            id: 'item-3-2',
            restaurantId: 'rest-3',
            categoryId: 'cat-3-1',
            name: 'Crispy Veggie Crunch Burger',
            description: 'Herb crusted potato and green pea patty topped with crunchy slaw and chipotle mayo.',
            price: 195,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80',
            isInStock: true
          }
        ]
      },
      {
        id: 'cat-3-2',
        restaurantId: 'rest-3',
        name: 'Thick Shakes',
        sortOrder: 2,
        items: [
          {
            id: 'item-3-3',
            restaurantId: 'rest-3',
            categoryId: 'cat-3-2',
            name: 'Belgian Dark Chocolate Shake',
            description: 'Rich Belgian chocolate ganache blended with double scoop ice cream and topped with choco flakes.',
            price: 190,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true
          }
        ]
      }
    ]
  },
  {
    id: 'rest-4',
    name: 'Rameshwaram Cafe',
    slug: 'rameshwaram-cafe',
    tagline: 'Pure Ghee Crispy Dosas & Filter Kaapi',
    description: 'The temple of South Indian breakfast: Podi Thatte Idlis bathed in pure desi ghee and piping hot sambar.',
    coverImage: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    ratingCount: 14800,
    prepTimeMinutes: 18,
    costForTwo: 250,
    isPureVeg: true,
    isOpen: true,
    address: '12th Main, Indiranagar, Bengaluru',
    distanceKm: 0.9,
    cuisines: ['South Indian', 'Breakfast', 'Coffee'],
    offerText: 'Free Filter Coffee on ₹299',
    categories: [
      {
        id: 'cat-4-1',
        restaurantId: 'rest-4',
        name: 'Ghee Delights',
        sortOrder: 1,
        items: [
          {
            id: 'item-4-1',
            restaurantId: 'rest-4',
            categoryId: 'cat-4-1',
            name: 'Ghee Podi Masala Dosa',
            description: 'Golden crispy red rice dosa smeared with spicy gunpowder podi, dollop of fresh churned ghee & potato bhaji.',
            price: 155,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true
          },
          {
            id: 'item-4-2',
            restaurantId: 'rest-4',
            categoryId: 'cat-4-1',
            name: 'Ghee Podi Thatte Idli (Pair)',
            description: 'Steamed fluffy plate idlis topped with spicy molagapodi and poured with simmering desi ghee.',
            price: 120,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true
          },
          {
            id: 'item-4-3',
            restaurantId: 'rest-4',
            categoryId: 'cat-4-1',
            name: 'Traditional Filter Kaapi',
            description: 'Decoction brewed fresh using Chikmagalur Peaberry beans frothed with full cream milk.',
            price: 55,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true
          }
        ]
      }
    ]
  },
  {
    id: 'rest-5',
    name: 'Punjab Grill Royal',
    slug: 'punjab-grill',
    tagline: 'Rich Curries & Charcoal Tandoor',
    description: 'Signature Butter Chicken, Dal Makhani simmered 24 hours over charcoal, and stuffed Kulchas.',
    coverImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
    rating: 4.4,
    ratingCount: 1850,
    prepTimeMinutes: 30,
    costForTwo: 800,
    isPureVeg: false,
    isOpen: true,
    address: 'Phoenix Marketcity, Whitefield',
    distanceKm: 4.2,
    cuisines: ['North Indian', 'Mughlai', 'Tandoor'],
    offerText: '50% OFF up to ₹100',
    categories: [
      {
        id: 'cat-5-1',
        restaurantId: 'rest-5',
        name: 'Main Courses',
        sortOrder: 1,
        items: [
          {
            id: 'item-5-1',
            restaurantId: 'rest-5',
            categoryId: 'cat-5-1',
            name: 'Murgh Makhani (Butter Chicken)',
            description: 'Charcoal roasted tandoori chicken simmered in rich satin smooth tomato and cashew nut gravy.',
            price: 460,
            discountPrice: 410,
            dietary: 'non_veg',
            imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true
          },
          {
            id: 'item-5-2',
            restaurantId: 'rest-5',
            categoryId: 'cat-5-1',
            name: 'Dal Punjab Grill (Simmered 24 hrs)',
            description: 'Black lentils slow cooked overnight on clay tandoor with unsalted white butter and ripe tomatoes.',
            price: 360,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true
          }
        ]
      }
    ]
  },
  {
    id: 'rest-6',
    name: 'Mainland China & Wok',
    slug: 'mainland-china',
    tagline: 'Authentic Cantonese, Szechuan & Dim Sum',
    description: 'Master chefs steaming delicate dim sums and wok-tossed noodles with real Szechuan peppercorns.',
    coverImage: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&auto=format&fit=crop&q=80',
    rating: 4.3,
    ratingCount: 1420,
    prepTimeMinutes: 26,
    costForTwo: 700,
    isPureVeg: false,
    isOpen: true,
    address: 'MG Road, Bengaluru',
    distanceKm: 2.8,
    cuisines: ['Chinese', 'Asian', 'Dim Sum'],
    offerText: 'Flat ₹100 OFF',
    categories: [
      {
        id: 'cat-6-1',
        restaurantId: 'rest-6',
        name: 'Dim Sums & Noodles',
        sortOrder: 1,
        items: [
          {
            id: 'item-6-1',
            restaurantId: 'rest-6',
            categoryId: 'cat-6-1',
            name: 'Prawn Har Gau Dim Sum (4 pcs)',
            description: 'Translucent steamed parcels packed with juicy tiger prawns and water chestnuts.',
            price: 395,
            dietary: 'non_veg',
            imageUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true
          },
          {
            id: 'item-6-2',
            restaurantId: 'rest-6',
            categoryId: 'cat-6-1',
            name: 'Hakka Chili Garlic Noodles',
            description: 'Wok tossed hand-pulled noodles with charred bell peppers, garlic crisps and scallions.',
            price: 290,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80',
            isInStock: true
          }
        ]
      }
    ]
  },
  {
    id: 'rest-7',
    name: "Glen's Bakehouse",
    slug: 'glens-bakehouse',
    tagline: 'Red Velvet Mini Cupcakes & Fresh Bakes',
    description: 'Artisanal European bakery known for gooey cheesecakes, sourdough sandwiches, and fresh brewed coffee.',
    coverImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    ratingCount: 6200,
    prepTimeMinutes: 20,
    costForTwo: 400,
    isPureVeg: true,
    isOpen: true,
    address: 'Lavelle Road, Bengaluru',
    distanceKm: 2.1,
    cuisines: ['Desserts', 'Bakery', 'Coffee'],
    offerText: 'Free Cupcake on ₹350',
    categories: [
      {
        id: 'cat-7-1',
        restaurantId: 'rest-7',
        name: 'Desserts & Cakes',
        sortOrder: 1,
        items: [
          {
            id: 'item-7-1',
            restaurantId: 'rest-7',
            categoryId: 'cat-7-1',
            name: 'Signature Red Velvet Cupcake (Box of 4)',
            description: 'Velvety moist cocoa crumb with rich cream cheese frosting.',
            price: 240,
            discountPrice: 210,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true
          },
          {
            id: 'item-7-2',
            restaurantId: 'rest-7',
            categoryId: 'cat-7-1',
            name: 'New York Baked Cheesecake Slice',
            description: 'Classic velvety cream cheese cake over a buttery graham cracker crust with berry coulis.',
            price: 260,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true
          }
        ]
      }
    ]
  },
  {
    id: 'rest-8',
    name: 'Subway Fresh Bowls',
    slug: 'subway-fresh',
    tagline: 'Crisp Subs, Salad Bowls & Wraps',
    description: 'Customise your subs with fresh veggies, whole wheat bread, and low-fat signature dressings.',
    coverImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    rating: 4.2,
    ratingCount: 3100,
    prepTimeMinutes: 19,
    costForTwo: 350,
    isPureVeg: false,
    isOpen: true,
    address: 'HSR Layout Sector 4, Bengaluru',
    distanceKm: 3.5,
    cuisines: ['Healthy', 'Salads', 'Wraps'],
    offerText: '30% OFF up to ₹75',
    categories: [
      {
        id: 'cat-8-1',
        restaurantId: 'rest-8',
        name: 'Salad Bowls & Subs',
        sortOrder: 1,
        items: [
          {
            id: 'item-8-1',
            restaurantId: 'rest-8',
            categoryId: 'cat-8-1',
            name: 'Paneer Tikka Salad Bowl',
            description: 'Marinated roasted paneer cubes tossed with crisp lettuce, cucumbers, olives, and sweet onion sauce.',
            price: 255,
            dietary: 'veg',
            imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
            isBestseller: true,
            isInStock: true
          },
          {
            id: 'item-8-2',
            restaurantId: 'rest-8',
            categoryId: 'cat-8-1',
            name: 'Roast Chicken Sub (6 inch)',
            description: 'Succulent roasted chicken slices with choice of crisp veggies and multigrain bread.',
            price: 280,
            dietary: 'non_veg',
            imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop&q=80',
            isInStock: true
          }
        ]
      }
    ]
  }
];
