# Masti Water Park — Website + Admin Panel

Official website for **Masti Water Park, Danawada (Khodu), Gujarat 363510**.
Public site for visitors + a private admin panel to change the logo, name, contacts, rides, tickets, offers, photos, videos and to handle booking enquiries.

| Layer     | Tech                                          |
|-----------|-----------------------------------------------|
| Front end | React 18 + Vite + Tailwind CSS 4, Google Fonts (Playfair Display + Manrope) |
| Back end  | Firebase Authentication (admin login) + Firestore security rules (server-side checks) |
| Database  | Cloud Firestore (live, real-time — admin changes appear on the site instantly) |
| Hosting   | Firebase Hosting (CDN, HTTP/3)                |
| Booking   | Form → WhatsApp message + saved in Admin → Enquiries |

---

## 1. Run it on your computer (with the real backend)

Needs Node 20+ and Java 11+ (for the Firebase emulator). Use **two terminals**:

```bash
npm install
npm run backend        # terminal 1: local Firebase database + login (keep it running)
npm run seed           # first time only: creates the admin login + starter content
npm run dev:local      # terminal 2: the website, connected to that backend
```

| What | Where |
|------|-------|
| Website | http://localhost:5173 |
| Admin panel | http://localhost:5173/admin |
| Raw database viewer | http://127.0.0.1:4000/firestore |

Local admin login: `admin@masti.test` / `Masti@2026` — a local test account that exists only on this computer.

Data is saved in `emulator-data/` when you stop the backend with **Ctrl+C** and loaded again next time.

Quick preview without any backend: `npm run dev` (browser demo mode, data saved only in that browser, login `admin@masti.local` / `masti@123`).

### Tests

```bash
npm test              # 26 checks on the form rules (past dates, negative guests, phone, ...)
npm run test:rules    # 36 checks on database security (backend must be running)
```

---

## 2. Connect Firebase (live database)

1. Go to https://console.firebase.google.com → **Add project** (e.g. `masti-water-park`).
2. **Build → Firestore Database → Create database** (production mode, region `asia-south1` Mumbai).
3. **Build → Authentication → Get started → Email/Password → Enable.**
4. **Authentication → Users → Add user** — create the admin email + password.
   Copy the new user's **User UID**.
5. **Firestore → Start collection** → Collection ID `admins` → Document ID = *that UID* → add any field (e.g. `name: "Owner"`) → Save.
   Only users listed in `admins` can edit the site.
6. **Project settings (gear) → Your apps → Web (`</>`)** → register app → copy the config values.
7. Copy `.env.example` to `.env` and paste the values:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

8. Publish the security rules (one time) — the Firebase CLI is already installed in this project:

   ```bash
   npx firebase login
   npx firebase use --add          # pick your project
   npx firebase deploy --only firestore:rules
   ```

9. Restart `npm run dev`, log in at `/admin`, and press **Load starter content** on the Dashboard.
   Then edit everything to the real details.

Photos are compressed in the browser and stored inside Firestore, so the free **Spark plan** is enough — no Firebase Storage needed.

---

## 3. Put it online

```bash
npm run deploy      # = vite build && firebase deploy
```

Your site will be live at `https://<project-id>.web.app`. To use your own domain (e.g. `mastiwaterpark.in`) go to **Hosting → Add custom domain**.

---

## 4. Folder structure

```
masti-water-park/
├─ public/brand/masti-logo.jpg     default logo (can be changed from admin)
├─ src/
│  ├─ main.jsx                     app entry
│  ├─ App.jsx                      all routes (site + admin)
│  ├─ index.css                    theme colours, fonts, buttons
│  ├─ data/defaults.js             starter content (sample rides, prices, FAQs)
│  ├─ lib/
│  │  ├─ firebase.js               Firebase connection (reads .env)
│  │  ├─ store.js                  ALL database + login code (Firestore or demo)
│  │  └─ utils.js                  YouTube, phone, map, image helpers
│  ├─ context/SiteContext.jsx      live site data shared by every page
│  ├─ components/                  Navbar, Footer, RideCard, EnquiryForm, …
│  ├─ pages/                       Home, Rides, Tickets, Offers, Gallery, Contact, Book
│  └─ admin/                       Login, Dashboard, Settings, Enquiries, list editors
├─ firestore.rules                 who can read / write what
├─ firebase.json                   hosting + rules config
└─ .env.example                    Firebase keys template
```

## 5. Database layout (Firestore)

| Collection / doc  | What it holds                                   | Who can write |
|-------------------|-------------------------------------------------|---------------|
| `site/settings`   | name, logo, tagline, phones, address, map link, timings, hero text & video, stats, social | admin |
| `rides`           | name, category (water/thrill/kids/adventure), description, height rule, thrill 1-5, photo, featured | admin |
| `tickets`         | title, weekday & weekend price, inclusions, highlight | admin |
| `offers`          | title, description, label, valid till, active   | admin |
| `gallery`         | type (image/video), photo or YouTube link, caption | admin |
| `faqs`            | question, answer                                | admin |
| `enquiries`       | booking / contact forms from visitors + status  | visitors create, admin reads |
| `admins/{uid}`    | list of admin users                             | Firebase console only |

## 6. Admin panel — what you can change

- **Site settings** — logo upload, park name, tagline, phone numbers, WhatsApp, email, address text, Google Maps link, timings, home banner text, background YouTube video, announcement bar, number strip, social links.
- **Rides** — add/edit/delete/reorder rides for every zone (water, thrill, kids, adventure park) with photo.
- **Tickets** — prices for weekdays and weekends; booking form estimates totals from these.
- **Offers** — show/hide seasonal deals.
- **Gallery** — upload photos, add YouTube videos.
- **FAQs**.
- **Enquiries** — every booking/contact form arrives instantly; call or WhatsApp the visitor and mark it new → contacted → confirmed → closed.

## 7. WhatsApp booking

"Book a Visit" opens the booking form. When the visitor presses **Book on WhatsApp**:

1. WhatsApp opens (app on phone, WhatsApp Web on computer) with a ready-made message to the park's number — name, mobile, date, ticket, guests, visit type and estimated total. The visitor only presses Send.
2. The same booking is saved in **Admin → Enquiries** so nothing is lost.

The receiving number is **Admin → Site settings → WhatsApp number** (default `+91 93133 99829`). The Contact page form works the same way.

## 8. Photos

Photos in `public/images/` are real photos from [Pexels](https://www.pexels.com/license/) (free for commercial use, no attribution required). Replace them with the park's own photos any time:
- Ride photos → Admin → Rides → edit a ride → Photo
- Banner collage → Admin → Site settings → Banner photo 1-4
- Gallery → Admin → Gallery

The logo with transparent background is `public/brand/masti-logo.png` (original kept as `masti-logo.jpg`).

> Prices, ride list, offers and stats in `src/data/defaults.js` are **sample values**. Replace them with the real ones from the admin panel before launch. The three default videos are public YouTube videos of Masti Water Park — swap them for the park's own channel videos when available.

## 9. Admin panel & security

- Only users listed in the `admins` collection can open the admin panel, read enquiries or change anything. Everyone else sees the login page, and the database itself refuses their requests (`firestore.rules`).
- **My profile** (Admin → My profile): each admin can change their own name, mobile number, photo and password (current password required). They cannot change their own role or someone else's profile.
- **Enquiries** can be searched, filtered by status and exported to CSV (opens in Excel).
- **Activity log** (Admin → Activity log) records every change: what, by whom, when. Each change and its log entry are saved together in one step, and the history cannot be edited or deleted.
- Booking form checks, in the browser *and* again in the database: name, Indian mobile number, visit date from today up to one year ahead (no past dates), a ticket from the list, whole-number guests 0–200 with at least one adult, a known visit type, message up to 500 characters.
