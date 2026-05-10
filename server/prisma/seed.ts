import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Traveloop database...');

  // Clean existing data
  await prisma.stopActivity.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.tripBudget.deleteMany();
  await prisma.packingItem.deleteMany();
  await prisma.tripNote.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();

  // --- CITIES ---
  const cities = await Promise.all([
    prisma.city.create({ data: { name: 'Paris', country: 'France', region: 'Europe', costIndex: 4.2, popularity: 5.0, description: 'The city of light and romance', coverPhoto: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800' } }),
    prisma.city.create({ data: { name: 'Tokyo', country: 'Japan', region: 'Asia', costIndex: 3.8, popularity: 4.9, description: 'Where ancient traditions meet futuristic innovation', coverPhoto: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' } }),
    prisma.city.create({ data: { name: 'New York', country: 'USA', region: 'North America', costIndex: 4.8, popularity: 4.8, description: 'The city that never sleeps', coverPhoto: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800' } }),
    prisma.city.create({ data: { name: 'Bali', country: 'Indonesia', region: 'Asia', costIndex: 1.8, popularity: 4.7, description: 'Island of gods with stunning temples and beaches', coverPhoto: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800' } }),
    prisma.city.create({ data: { name: 'Cape Town', country: 'South Africa', region: 'Africa', costIndex: 2.2, popularity: 4.5, description: 'Where mountains meet the ocean', coverPhoto: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800' } }),
    prisma.city.create({ data: { name: 'Rome', country: 'Italy', region: 'Europe', costIndex: 3.5, popularity: 4.8, description: 'Eternal city with millennia of history', coverPhoto: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800' } }),
    prisma.city.create({ data: { name: 'Sydney', country: 'Australia', region: 'Oceania', costIndex: 4.5, popularity: 4.6, description: 'Iconic harbour city with world-class beaches', coverPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' } }),
    prisma.city.create({ data: { name: 'Dubai', country: 'UAE', region: 'Middle East', costIndex: 4.0, popularity: 4.5, description: 'City of superlatives and luxury', coverPhoto: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800' } }),
    prisma.city.create({ data: { name: 'Bangkok', country: 'Thailand', region: 'Asia', costIndex: 1.5, popularity: 4.6, description: 'Vibrant street food, temples, and nightlife', coverPhoto: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800' } }),
    prisma.city.create({ data: { name: 'London', country: 'UK', region: 'Europe', costIndex: 4.7, popularity: 4.7, description: 'Royal heritage meets modern cosmopolitan culture', coverPhoto: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' } }),
  ]);

  const [paris, tokyo, newYork, bali, capeTown, rome, sydney, dubai, bangkok, london] = cities;

  // --- ACTIVITIES ---
  const activitiesData = [
    // Paris
    { cityId: paris.id, name: 'Eiffel Tower Visit', type: 'sightseeing', cost: 26, durationHours: 3, description: 'Climb or take the elevator to the top of this iconic iron lattice tower for breathtaking views.', imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=600' },
    { cityId: paris.id, name: 'Louvre Museum', type: 'cultural', cost: 17, durationHours: 4, description: 'Home to the Mona Lisa and thousands of other masterpieces.', imageUrl: 'https://images.unsplash.com/photo-1565099824688-b93c6e1b0d9e?w=600' },
    { cityId: paris.id, name: 'Seine River Cruise', type: 'sightseeing', cost: 15, durationHours: 1.5, description: 'Glide along the Seine past Notre-Dame and the Eiffel Tower.', imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=600' },
    { cityId: paris.id, name: 'Montmartre Food Tour', type: 'food', cost: 65, durationHours: 3, description: 'Taste croissants, cheese, and wine in the artistic Montmartre quarter.', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
    { cityId: paris.id, name: 'Palace of Versailles', type: 'cultural', cost: 20, durationHours: 5, description: "The Sun King's magnificent palace and gardens just outside Paris.", imageUrl: 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=600' },
    { cityId: paris.id, name: 'Catacombs of Paris', type: 'adventure', cost: 13, durationHours: 2, description: "Explore the city's underground ossuary holding millions of remains.", imageUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=600' },
    // Tokyo
    { cityId: tokyo.id, name: 'Shibuya Crossing Walk', type: 'sightseeing', cost: 0, durationHours: 1, description: "Experience the world's busiest pedestrian crossing.", imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600' },
    { cityId: tokyo.id, name: 'Tsukiji Outer Market', type: 'food', cost: 30, durationHours: 2, description: 'Fresh sushi and street food at the famous fish market.', imageUrl: 'https://images.unsplash.com/photo-1569924226288-98ff84ee8ac2?w=600' },
    { cityId: tokyo.id, name: 'Senso-ji Temple', type: 'cultural', cost: 0, durationHours: 2, description: "Tokyo's oldest and most significant Buddhist temple in Asakusa.", imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600' },
    { cityId: tokyo.id, name: 'teamLab Borderless', type: 'cultural', cost: 32, durationHours: 3, description: 'Immersive digital art museum with stunning light installations.', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
    { cityId: tokyo.id, name: 'Mt Fuji Day Trip', type: 'adventure', cost: 80, durationHours: 10, description: 'Guided hike or scenic views of Japan\'s iconic volcano.', imageUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?w=600' },
    { cityId: tokyo.id, name: 'Ramen Cooking Class', type: 'food', cost: 55, durationHours: 2.5, description: 'Learn to make authentic Japanese ramen from scratch.', imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600' },
    // Bali
    { cityId: bali.id, name: 'Uluwatu Temple Sunset', type: 'cultural', cost: 4, durationHours: 2, description: 'Watch the sunset from this dramatic clifftop temple with Kecak fire dance.', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600' },
    { cityId: bali.id, name: 'Rice Terrace Trek', type: 'adventure', cost: 20, durationHours: 4, description: "Hike through Tegalalang's iconic UNESCO-listed rice terraces.", imageUrl: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600' },
    { cityId: bali.id, name: 'Surf Lesson Canggu', type: 'adventure', cost: 35, durationHours: 2, description: 'Beginner surf lesson at one of Bali\'s hippest beach towns.', imageUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600' },
    { cityId: bali.id, name: 'Traditional Balinese Cooking', type: 'food', cost: 45, durationHours: 4, description: 'Visit a local market then cook a full Balinese feast.', imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600' },
    { cityId: bali.id, name: 'Monkey Forest Sanctuary', type: 'sightseeing', cost: 5, durationHours: 1.5, description: "Sacred forest home to hundreds of playful Balinese macaques.", imageUrl: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600' },
    // Rome
    { cityId: rome.id, name: 'Colosseum Tour', type: 'cultural', cost: 18, durationHours: 3, description: 'Step inside the ancient amphitheater where gladiators once fought.', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600' },
    { cityId: rome.id, name: 'Vatican Museums', type: 'cultural', cost: 20, durationHours: 4, description: 'Marvel at the Sistine Chapel and centuries of papal art.', imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600' },
    { cityId: rome.id, name: 'Roman Food Tour', type: 'food', cost: 70, durationHours: 3.5, description: 'Pasta, supplì, and gelato on a guided culinary walk.', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
    { cityId: rome.id, name: 'Trevi Fountain & Piazzas', type: 'sightseeing', cost: 0, durationHours: 2, description: 'Toss a coin at Trevi and wander Piazza Navona.', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600' },
    { cityId: rome.id, name: 'Catacombs Guided Tour', type: 'cultural', cost: 15, durationHours: 2, description: "Explore Rome's ancient underground Christian burial sites.", imageUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=600' },
    // New York
    { cityId: newYork.id, name: 'Central Park Bike Tour', type: 'adventure', cost: 40, durationHours: 3, description: 'Cycle through 843 acres of iconic urban parkland.', imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600' },
    { cityId: newYork.id, name: 'Met Museum', type: 'cultural', cost: 25, durationHours: 3, description: 'One of the largest art museums in the world.', imageUrl: 'https://images.unsplash.com/photo-1555990538-16ff7de81b86?w=600' },
    { cityId: newYork.id, name: 'Brooklyn Food Tour', type: 'food', cost: 85, durationHours: 3, description: 'Pizza, bagels, and artisan food in Williamsburg.', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
    { cityId: newYork.id, name: 'Empire State Building', type: 'sightseeing', cost: 44, durationHours: 2, description: 'Iconic observation deck with 360° city views.', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600' },
    { cityId: newYork.id, name: 'Broadway Show', type: 'cultural', cost: 120, durationHours: 3, description: 'Experience world-class theatre on the Great White Way.', imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600' },
    // London
    { cityId: london.id, name: 'Tower of London', type: 'cultural', cost: 30, durationHours: 3, description: 'Explore the medieval fortress and see the Crown Jewels.', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600' },
    { cityId: london.id, name: 'British Museum', type: 'cultural', cost: 0, durationHours: 3, description: 'Free world-class museum spanning human history.', imageUrl: 'https://images.unsplash.com/photo-1555990538-16ff7de81b86?w=600' },
    { cityId: london.id, name: 'Thames River Cruise', type: 'sightseeing', cost: 18, durationHours: 1.5, description: 'Glide past the Houses of Parliament and Tower Bridge.', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600' },
    { cityId: london.id, name: 'Borough Market Food Tour', type: 'food', cost: 40, durationHours: 2, description: "London's oldest and most famous food market."},
    // Dubai
    { cityId: dubai.id, name: 'Burj Khalifa At The Top', type: 'sightseeing', cost: 45, durationHours: 2, description: "Observation deck atop the world's tallest building.", imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600' },
    { cityId: dubai.id, name: 'Desert Safari', type: 'adventure', cost: 85, durationHours: 6, description: 'Dune bashing, camel riding, and a Bedouin camp dinner.', imageUrl: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?w=600' },
    { cityId: dubai.id, name: 'Dubai Food Tour', type: 'food', cost: 60, durationHours: 3, description: 'From shawarma to fine dining in the spice souk area.', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
    // Bangkok
    { cityId: bangkok.id, name: 'Grand Palace', type: 'cultural', cost: 15, durationHours: 3, description: 'The dazzling complex of royal temples and halls.', imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600' },
    { cityId: bangkok.id, name: 'Street Food Night Tour', type: 'food', cost: 35, durationHours: 3, description: 'Pad thai, mango sticky rice, and more on a local walking tour.', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
    { cityId: bangkok.id, name: 'Chao Phraya Long-tail Boat', type: 'adventure', cost: 12, durationHours: 2, description: 'Speed through Bangkok\'s klongs (canals) on a traditional boat.', imageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600' },
    // Cape Town
    { cityId: capeTown.id, name: 'Table Mountain Hike', type: 'adventure', cost: 10, durationHours: 5, description: 'Hike or cable-car to the flat-topped icon above Cape Town.', imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600' },
    { cityId: capeTown.id, name: 'Cape Point Day Trip', type: 'sightseeing', cost: 25, durationHours: 7, description: "Drive the scenic Cape Peninsula to the continent's southwestern tip.", imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600' },
    { cityId: capeTown.id, name: 'V&A Waterfront Food', type: 'food', cost: 40, durationHours: 2, description: 'Fresh seafood and local wine at the vibrant waterfront.', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
    // Sydney
    { cityId: sydney.id, name: 'Sydney Opera House Tour', type: 'cultural', cost: 42, durationHours: 2, description: 'Guided backstage tour of the iconic UNESCO World Heritage building.', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' },
    { cityId: sydney.id, name: 'Bondi to Coogee Coastal Walk', type: 'adventure', cost: 0, durationHours: 3, description: '6km clifftop walk with stunning ocean views and sea pools.', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' },
    { cityId: sydney.id, name: 'Darling Harbour Food Tour', type: 'food', cost: 55, durationHours: 2.5, description: 'Sydney\'s diverse cuisine from waterfront restaurants.', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
  ];

  for (const act of activitiesData) {
    await prisma.activity.create({ data: act });
  }

  // --- DEMO USER ---
  const passwordHash = await bcrypt.hash('demo1234', 12);
  const demoUser = await prisma.user.create({
    data: { name: 'Alex Wanderer', email: 'demo@traveloop.com', passwordHash, isAdmin: false },
  });

  // Admin user
  const adminHash = await bcrypt.hash('admin1234', 12);
  await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@traveloop.com', passwordHash: adminHash, isAdmin: true },
  });

  // --- TRIP 1: Europe Dream ---
  const trip1 = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      name: 'Europe Dream Tour',
      description: 'An unforgettable journey through the heart of Europe — from the Eiffel Tower to the Colosseum.',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-15'),
      isPublic: true,
      shareSlug: randomUUID(),
      coverPhoto: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=1200',
    },
  });

  const parisActivities = await prisma.activity.findMany({ where: { cityId: paris.id }, take: 3 });
  const romeActivities = await prisma.activity.findMany({ where: { cityId: rome.id }, take: 3 });

  const stop1 = await prisma.stop.create({ data: { tripId: trip1.id, cityId: paris.id, arrivalDate: new Date('2025-06-01'), departureDate: new Date('2025-06-06'), order: 0 } });
  const stop2 = await prisma.stop.create({ data: { tripId: trip1.id, cityId: rome.id, arrivalDate: new Date('2025-06-06'), departureDate: new Date('2025-06-12'), order: 1 } });

  for (const act of parisActivities) {
    await prisma.stopActivity.create({ data: { stopId: stop1.id, activityId: act.id, scheduledTime: '10:00' } });
  }
  for (const act of romeActivities) {
    await prisma.stopActivity.create({ data: { stopId: stop2.id, activityId: act.id, scheduledTime: '09:00' } });
  }

  await prisma.tripBudget.create({ data: { tripId: trip1.id, transportCost: 450, stayCost: 1200, mealsCost: 600, miscCost: 300 } });

  await prisma.packingItem.createMany({
    data: [
      { tripId: trip1.id, name: 'Passport', category: 'documents', isPacked: true },
      { tripId: trip1.id, name: 'Travel Insurance', category: 'documents', isPacked: true },
      { tripId: trip1.id, name: 'Universal Power Adapter', category: 'electronics', isPacked: false },
      { tripId: trip1.id, name: 'Comfortable Walking Shoes', category: 'clothing', isPacked: false },
      { tripId: trip1.id, name: 'Light Jacket', category: 'clothing', isPacked: false },
      { tripId: trip1.id, name: 'Sunscreen', category: 'toiletries', isPacked: true },
    ],
  });

  await prisma.tripNote.create({
    data: { tripId: trip1.id, userId: demoUser.id, stopId: stop1.id, content: 'Book Eiffel Tower tickets at least 2 weeks in advance! Skip the queue with online booking. Also try the crêpes near Trocadéro — absolutely divine.' },
  });

  // --- TRIP 2: Asian Adventure ---
  const trip2 = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      name: 'Asian Adventure',
      description: 'Dive into the contrasts of Asia — bustling Bangkok streets, serene Bali temples, and Tokyo\'s neon nights.',
      startDate: new Date('2025-09-10'),
      endDate: new Date('2025-09-25'),
      isPublic: false,
      coverPhoto: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200',
    },
  });

  const bangkokActs = await prisma.activity.findMany({ where: { cityId: bangkok.id }, take: 2 });
  const baliActs = await prisma.activity.findMany({ where: { cityId: bali.id }, take: 3 });
  const tokyoActs = await prisma.activity.findMany({ where: { cityId: tokyo.id }, take: 2 });

  const stop3 = await prisma.stop.create({ data: { tripId: trip2.id, cityId: bangkok.id, arrivalDate: new Date('2025-09-10'), departureDate: new Date('2025-09-14'), order: 0 } });
  const stop4 = await prisma.stop.create({ data: { tripId: trip2.id, cityId: bali.id, arrivalDate: new Date('2025-09-14'), departureDate: new Date('2025-09-20'), order: 1 } });
  const stop5 = await prisma.stop.create({ data: { tripId: trip2.id, cityId: tokyo.id, arrivalDate: new Date('2025-09-20'), departureDate: new Date('2025-09-25'), order: 2 } });

  for (const act of bangkokActs) await prisma.stopActivity.create({ data: { stopId: stop3.id, activityId: act.id } });
  for (const act of baliActs) await prisma.stopActivity.create({ data: { stopId: stop4.id, activityId: act.id } });
  for (const act of tokyoActs) await prisma.stopActivity.create({ data: { stopId: stop5.id, activityId: act.id } });

  await prisma.tripBudget.create({ data: { tripId: trip2.id, transportCost: 800, stayCost: 900, mealsCost: 500, miscCost: 200 } });

  console.log('✅ Seed complete!');
  console.log('   Demo user: demo@traveloop.com / demo1234');
  console.log('   Admin user: admin@traveloop.com / admin1234');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
