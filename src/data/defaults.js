// Starting content for the site. Everything here can be edited from the admin panel.
// Prices, ride list and offers are SAMPLE values — update them from /admin before going live.

export const defaultSettings = {
  name: 'Masti Water Park',
  shortName: 'Masti',
  tagline: "Gujarat's family water park",
  logo: '/brand/masti-logo.png',

  heroTitle: 'Make a splash this season',
  heroSubtitle:
    'Wave pool, twisting slides, a full kids zone and an adventure park — all under the Saurashtra sun, a short drive from Surendranagar.',
  heroVideo: 'https://www.youtube.com/watch?v=FoBSrDtFlTQ',
  announcement: 'Open all week · 10:00 AM to 6:00 PM · Group & school bookings welcome',

  phones: ['+91 93133 99829', '+91 63566 73409'],
  whatsapp: '+91 93133 99829',
  email: '',
  address: 'Masti Water Park, Danawada, Khodu, Gujarat 363510',
  mapLink: 'https://maps.app.goo.gl/3uPyFbKjCYqbrBpU9?g_st=aw',

  timings: {
    weekday: '10:00 AM – 6:00 PM',
    weekend: '10:00 AM – 6:00 PM',
    note: 'Last entry 1 hour before closing. Costume is compulsory in pools.',
  },

  about:
    'Masti Water Park is a family water park at Danawada near Khodu, Gujarat. Come for the slides, stay for the wave pool, the rain dance and the food — a full day out for kids, families, friends and school groups.',

  stats: [
    { label: 'Water rides', value: '20+' },
    { label: 'Happy visitors', value: '1 Lakh+' },
    { label: 'Kids attractions', value: '8' },
    { label: 'Lifeguards on duty', value: '30+' },
  ],

  social: {
    instagram: '',
    facebook: '',
    youtube: '',
  },
}

// Real photos (free Pexels licence, stored in /public/images). Replace with the park's own photos from the admin panel.
const RIDE_PHOTOS = {
  'wave-pool': '/images/ride-wave-pool.webp',
  'lazy-river': '/images/ride-lazy-river.webp',
  tornado: '/images/ride-tornado.webp',
  racer: '/images/ride-racer.webp',
  'free-fall': '/images/ride-free-fall.webp',
  'family-slide': '/images/ride-family-slide.webp',
  'rain-dance': '/images/ride-rain-dance.webp',
  'kids-pool': '/images/ride-kids-pool.webp',
  'pirate-ship': '/images/ride-pirate-ship.webp',
  'mini-slides': '/images/ride-mini-slides.webp',
  zipline: '/images/ride-zipline.webp',
  'rope-course': '/images/ride-rope-course.webp',
  'climbing-wall': '/images/ride-climbing-wall.webp',
  'bungee-trampoline': '/images/ride-trampoline.webp',
}

export const HERO_PHOTOS = [
  '/images/hero-main.webp',
  '/images/hero-family.webp',
  '/images/hero-slides.webp',
  '/images/hero-kids.webp',
]

const r = (id, name, category, description, minHeight, thrill, featured = false) => ({
  id, name, category, description, minHeight, thrill, featured, image: '', order: 0,
})

export const defaultRides = [
  r('wave-pool', 'Tsunami Wave Pool', 'water', 'Ocean-style waves every few minutes with a DJ deck on weekends. The heart of the park.', '', 2, true),
  r('lazy-river', 'Lazy River', 'water', 'Grab a tube and float a slow loop around the park. Perfect after a big slide.', '', 1, true),
  r('tornado', 'Tornado Funnel', 'thrill', 'Drop into a giant funnel in a family raft and swing up the walls before splashing out.', '4 ft', 5, true),
  r('racer', 'Multi-Lane Racer', 'thrill', 'Race your friends head-first down side-by-side mat lanes. Loser buys the chai.', '4 ft', 4, true),
  r('free-fall', 'Free Fall', 'thrill', 'A near-vertical body slide for those who like their stomach in their throat.', '4.5 ft', 5),
  r('family-slide', 'Family Raft Slide', 'water', 'Open twisting slide for the whole group on one big raft.', '3.5 ft', 3),
  r('rain-dance', 'Rain Dance', 'water', 'Overhead showers, foam and the loudest playlist in town.', '', 2, true),
  r('kids-pool', 'Kids Splash Pool', 'kids', 'Shallow pool with mini slides, water cannons and a tipping bucket.', 'below 4 ft', 1, true),
  r('pirate-ship', 'Pirate Play Ship', 'kids', 'Climb, slide and spray from a pirate ship parked in knee-deep water.', 'below 4 ft', 2),
  r('mini-slides', 'Mini Twisters', 'kids', 'Small, gentle slides sized for little riders.', '2.5 ft – 4 ft', 1),
  r('zipline', 'Zipline', 'adventure', 'Fly over the park on a steel line with a full harness and trained crew.', '4 ft', 4, true),
  r('rope-course', 'Rope Course', 'adventure', 'Burma bridge, net walk and balance beams — a full obstacle course in the air.', '4 ft', 3),
  r('climbing-wall', 'Climbing Wall', 'adventure', 'Pick a route and ring the bell at the top. Auto-belay for safety.', '3.5 ft', 3),
  r('bungee-trampoline', 'Bungee Trampoline', 'adventure', 'Bounce higher than you thought possible while strapped in safely.', '3 ft', 2),
].map((ride, i) => ({ ...ride, order: i, image: RIDE_PHOTOS[ride.id] || '' }))

export const defaultTickets = [
  {
    id: 'kids', title: 'Kids', subtitle: 'Height 3 ft to 4 ft',
    priceWeekday: 400, priceWeekend: 500,
    includes: ['All kids rides', 'Wave pool & rain dance', 'Lazy river'],
    highlight: false, order: 0,
  },
  {
    id: 'adult', title: 'Adult', subtitle: 'Height above 4 ft',
    priceWeekday: 600, priceWeekend: 700,
    includes: ['All water rides & slides', 'Wave pool & rain dance', 'Lazy river', 'Changing room access'],
    highlight: true, order: 1,
  },
  {
    id: 'combo', title: 'Masti Combo', subtitle: 'Entry + lunch + adventure',
    priceWeekday: 900, priceWeekend: 1050,
    includes: ['Everything in Adult', 'Buffet lunch', '2 adventure activities', 'Free locker'],
    highlight: false, order: 2,
  },
]

export const defaultOffers = [
  { id: 'group', title: 'Group of 20+', description: 'Flat 15% off on entry for groups of 20 or more. Call us to book.', tag: 'Groups', validTill: '', active: true, order: 0 },
  { id: 'school', title: 'School Picnic Package', description: 'Special per-student rate with lunch and supervised kids zone. Teachers enter free.', tag: 'Schools', validTill: '', active: true, order: 1 },
  { id: 'birthday', title: 'Birthday Bash', description: 'Birthday person enters free with a group of 10. Show any ID with your date of birth.', tag: 'Celebrate', validTill: '', active: true, order: 2 },
]

const yt = (id, url, caption, order) => ({ id, type: 'video', src: url, caption, order })

const photo = (n, caption) => ({ id: `p${n}`, type: 'image', src: `/images/gallery-${String(n).padStart(2, '0')}.webp`, caption, order: 10 + n })

export const defaultGallery = [
  yt('v1', 'https://www.youtube.com/watch?v=FoBSrDtFlTQ', 'A day at Masti Water Park', 0),
  yt('v2', 'https://www.youtube.com/watch?v=0xz61HtxOlo', 'Masti Water Park, Danawada', 1),
  yt('v3', 'https://www.youtube.com/watch?v=Z9q-QTKFMAw', 'Visitors having fun', 2),
  photo(1, 'Slides and pools from above'),
  photo(2, 'Splash tower'),
  photo(3, 'Pool with a view'),
  photo(4, 'Kids play area'),
  photo(5, 'Tube ride'),
  photo(6, 'Splash landing'),
  photo(7, 'Family zone'),
  photo(8, 'Into the tunnel'),
  photo(9, 'Twisting tube slides'),
  photo(10, 'The park at a glance'),
]

export const defaultFaqs = [
  { id: 'f1', q: 'What are the park timings?', a: 'The park is open every day from 10:00 AM to 6:00 PM. Last entry is one hour before closing.', order: 0 },
  { id: 'f2', q: 'How is the child ticket decided?', a: 'By height, not age. Kids between 3 ft and 4 ft take the kids ticket. Children under 3 ft enter free with a paying adult.', order: 1 },
  { id: 'f3', q: 'Is swimwear compulsory?', a: 'Yes. Nylon / lycra swimwear is required in all pools and slides. Costumes are available on rent at the park.', order: 2 },
  { id: 'f4', q: 'Can I bring outside food?', a: 'Outside food is not allowed inside the park. Our food court serves Gujarati thali, Punjabi, snacks and cold drinks.', order: 3 },
  { id: 'f5', q: 'Are lockers available?', a: 'Yes, lockers are available on rent with a refundable deposit.', order: 4 },
  { id: 'f6', q: 'Do you take group and school bookings?', a: 'Yes. Use the Book a Visit page or call us — we will share group rates and arrange everything.', order: 5 },
]

export const RIDE_CATEGORIES = [
  { id: 'all', label: 'All rides' },
  { id: 'water', label: 'Water rides' },
  { id: 'thrill', label: 'Thrill slides' },
  { id: 'kids', label: 'Kids zone' },
  { id: 'adventure', label: 'Adventure park' },
]
