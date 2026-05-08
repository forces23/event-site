lSpec sheet for the quince site

### description

* a website used as a quincenera invitation site that will double as a upload images site for the quest to upload the photos and videos they take. i do want it mobile friendly, so it should look great on a phone and on a computer.
* this is geared toward information use for guest invited and functional use for guest that are uploading the images to the guest gallery
* the goal is to display the beauty of the quince and the quince girl and give guest information about the quince. this also serves as the "portal" for guest uploading images

### Features

* Embedded map
* Direction link that takes you to the location using apple maps or google maps (it should pop up asking which one they want) 
* Im thinking i want it modular so that i can reuse it for my other sisters quince( think config file modularaity) Poll every 30 seconds automatically (shows new photos without refresh)
* i want a easy way to upload pictures and videos (up to a cetain size) for guest (look into partycam site),
* There will be a gallery of just her and a second gallery for guest uploaded pictures
* I want a qr code that can be scanned and takes you to the upload images page. i want a static PNG in the public folder
* Im thinking of using s3 for storage of images but if there is a better cheaper way let me know. 
* Music playing on load of the page
* should be a way to RSVP or to decline RSVP

  * there should be a dashboard hidden behind a login screen to show rsvps and declines and other info that would be nice to have for a party(maybe some additional info like plus ones count, kids count, a want to see the messages left for the quince girl.)
* for logging into the dashboard. there will only be 2 users. admin(me/developer), viewer(sister/mom). i want you to create aseed script to insert the admin and 2 viewers in mongodb

### Layout

Important sections in order
-Hero
     --Very girly, floral
-Date of event and location
     --Embeded maps
     --“Directions” button then it ask apple maps or google maps
-Padrines
-Quince Court 
     --Damas
     --Chambelanes
-Details 
     --Dress code
     --Gift
          ---Wishlist link(like a gift registry) 
     --Acomedations (if any) 
-Gallery
     --Quince girl's gallery
     --Guest gallery

```
① Hero         — Name, animated florals, music autoplay, im thinking of having a picture of the quince girl here but i am unsure if i will have one so the picture would be added in last min. just keep that in mind 
② Event Info   — Date/countdown, venue, map embed, directions modal
③ Padrinos     — Grid of sponsors/godparents with roles what they are sponsoring. for now no photos.
④ Court        — Damas | Chambelanes (two columns, photos + names)
⑤ Details      — Dress code, gift registry link, hotel blocks
⑥ Gallery      — Her photos (curated) + Guest uploads (live feed)
⑦ Footer       — QR code to upload page
```

the messages will not show on the home screen as of now and all messages are allowed to be public by default. i may add this in later so skip for now

RSVP is a button in the event info section it should pop a modal/dialog up and allwo the user to enter in the needed info and submit

### Technology stack:

* Language: Typescript
* Framework: Next.js 16.2 (latest)
* UI Library: React
* Styling: use Tailwind and shadcn
* Database: MongoDB Atlas
  * ODM: Mongoose
* Auth: NextAuth.js
* Storage: Cloudflare R2
* HTTP Client: Axios
* State Management: Zustand
* testing: vitest and playwright
* Hosting / Platform: Vercel

### Patterns:

```
use react hook forms for all forms. i use snake_case for all db columns.
```

### what i dont want :

```
no login wall for guests, no dark mode, no email sending
```

### **Responsive / mobile?**

* i want it to be responsive to work on both desktop and mobile devices

### **What can go wrong?**

* only error i can thik of is the error for uplaoding image should state that there was an issue uploading image or video and also there should be an error for size limit of videos

### **What "Done" looks like...**

#### Page Load & Global

- [ ] Music attempts autoplay on load and A floating mute/unmute button that also acts as the play trigger if browser blocks the autoplay then just default to muted symbol
- [ ] Mute / unmute button is visible and functional
- [ ] Page is fully responsive on mobile and desktop
- [ ] All colors, fonts, and event-specific content are driven by the config file
- [ ] Swapping config/isabella.ts with a new file correctly updates the entire site

* A floating mute/unmute button that also acts as the play trigger

#### Hero Section

- [ ] Quince girl's name is displayed prominently
- [ ] Animated floral / girly design elements are present
- [ ] Music autoplay is wired to the Hero section load
- [ ] Photo placeholder is in place and ready to swap for a real photo at any time

#### Event Info Section

- [ ] Event date (July 24, 2026) and start time (6:00 PM) are displayed
- [ ] Live countdown timer to the event is visible and ticking
- [ ] Venue name (La Roma Banquet Hall) and full address are displayed
- [ ] Google Maps embed loads and pins the correct venue location
- [ ] "Directions" button opens a modal asking the user to choose Apple Maps or Google Maps
- [ ] Apple Maps deep link opens and routes to the venue on iOS
- [ ] Google Maps deep link opens and routes to the venue on Android / desktop
- [ ] RSVP button is present in this section and opens the RSVP modal when clicked

#### Padrinos Section

- [ ] Padrinos render in a grid layout
- [ ] Each padrino shows their name and what they are sponsoring (no photos)
- [ ] Padrino data is pulled from the config file

#### Court Section

- [ ] Damas and Chambelanes render in two side-by-side columns
- [ ] Each court member shows a photo placeholder and their name
- [ ] Court data is pulled from the config file

#### Details Section

- [ ] Dress code is displayed ("Look your best")
- [ ] Gift registry link is present (placeholder URL)
- [ ] Accommodations section is  skipped

#### Gallery Section

- [ ] Quince girl's curated gallery renders with photo placeholders
- [ ] Guest gallery renders all uploaded photos in a grid
- [ ] Guest gallery auto-refreshes every 30 seconds showing new uploads without a manual page refresh

#### Footer

- [ ] Static QR code PNG is displayed in the footer
- [ ] Scanning the QR code navigates to the /upload page
- [ ] QR code is clearly legible on both mobile and desktop screens

#### Image & Video Upload — /upload page

- [ ] /upload page is accessible without logging in
- [ ] Guest can upload up to 20 images at a time
- [ ] Guest can upload up to 5 videos at a time
- [ ] 20MB per image limit is enforced — clear error shown if exceeded
- [ ] 500MB per video limit is enforced — clear error shown if exceeded
- [ ] Only accepted file types allowed: JPG, JPEG, PNG, HEIC, MOV, MP4
- [ ] Uploading an unsupported file type shows a clear error message
- [ ] A network or server upload failure shows a clear error message
- [ ] A successful upload shows a confirmation message to the guest
- [ ] Uploaded photos appear in the guest gallery immediately after upload
- [ ] All uploaded files are stored in Cloudflare R2

#### RSVP Flow

- [ ] RSVP modal opens when the RSVP button is clicked
- [ ] Step 1 collects: Full Name (required), Email or Phone (at least one required), Relationship
- [ ] Step 2 shows large Yes / No attending buttons
- [ ] If Yes: adults stepper (min 1) and kids stepper (min 0) shown; total headcount auto-calculates
- [ ] If No: skips directly to Step 3
- [ ] Step 3 shows a message textarea (300 char limit) and "Make it public" toggle (defaults to on)
- [ ] Submitting saves the full RSVP document to MongoDB with all schema fields
- [ ] Full-screen Thank You message is shown after successful submission
- [ ] Thank You screen auto-redirects to home after 10 seconds
- [ ] RSVP deadline placeholder date is visible near the RSVP button
- [ ] After the deadline passes the RSVP form is disabled and shows "RSVP is now closed"
- [ ] "Already RSVP'd? Need to change your RSVP?" text and Update RSVP button are visible
- [ ] Clicking Update RSVP opens a lookup modal asking for email or phone used when RSVPing
- [ ] A matching email or phone pre-populates the existing RSVP form
- [ ] Guest can edit their response and click Update to save changes
- [ ] An unrecognized email or phone shows a clear "not found" error

#### Dashboard — Shared (Admin + Viewer)

- [ ] Navigating to /dashboard while logged out redirects to the login page
- [ ] Admin credentials log in and land on the dashboard
- [ ] Viewer credentials log in and land on the dashboard
- [ ] Invalid credentials show a clear error message
- [ ] Overview cards show accurate counts: Total Responses, Attending, Declined, Total Headcount, Total Adults, Total Kids
- [ ] Messages Wall displays all public messages from the RSVP form
- [ ] RSVP table shows: Name, Email, Phone, Relationship, Status, Adults, Kids, Submitted Date
- [ ] Both Admin and Viewer can view all guest uploaded photos in the gallery
- [ ] Both Admin and Viewer can download all guest photos at once
- [ ] Both Admin and Viewer can select and download individual photos

#### Dashboard — Admin Only

- [ ] Admin can delete individual RSVP entries from the table
- [ ] Admin can export the full RSVP list as a CSV file
- [ ] Admin can delete individual photos from the guest gallery
- [ ] Admin can delete individual messages from the Messages Wall
- [ ] Delete controls and Export CSV button are not visible to the Viewer role

### config file layout

example og config.ts for madularity between quince girls:

```ts
export const EVENT = {
  name: "Isabella",
  date: "2025-08-15T18:00:00",
  rsvpBy: "2025-08-09T18:00:00",
  venue: {
    name: "The Grand Ballroom",
    address: "123 Main St, Houston TX",
    lat: 29.7604,
    lng: -95.3698,
  },
  theme: {
    primaryColor: "#f9a8d4",  // swap per sister
    accentColor: "#fbbf24",
    font: "Playfair Display",
  },
  music: "/assets/music/song.mp3",
  padrinos: [{ name: "The García Family", role: "Florals" },...],
  damas: [{ name: "Sofia Reyes", photo: "/placeholders/dama.jpg" },...],
  chambelanes: [{ name: "Alexis Reyes", photo: "/placeholders/dama.jpg" },...],
  dresscode: "Formal. Ladies in pastels, gentlemen in black.",
  registry: "https://amazon.com/registry/...",
}
```

i dont have images yet so whereever there is images that need placement use a placeholder.

### Image / Video Upload Rules

* max file size for images: **20MB per image,** up to 20 images uploaded at a time.
* max file size for videos: 500MB per video, upload only 5 videos at a time
* uploading is anonymous for now
* i want to say imediately visible after upload in gallery
* file types are only file types that are taken photos from android and iphone.

### RSVP Form data

```json
{
  "_id": "abc123",
  "event": "isabella_quince_2025",
  "guest": {
    "name": "Maria Garcia",
    "email": "maria@gmail.com",
    "phone": "+1 (713) 555-0192",
    "relationship": "family"
  },
  "rsvp": {
    "status": "attending",
    "submittedAt": "2025-06-01T14:32:00Z",
    "updatedAt": "2025-06-01T14:32:00Z",
    "token": "uuid-unique-edit-token"
  },
  "party": {
    "totalAdults": 2,
    "totalKids": 2,
    "totalHeadcount": 4
  },
  "message": {
    "msg": "Feliz Quinceañera Isabella! We are so proud of you!",
    "isPublic": true
  },
  "meta": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "source": "qr_code",
    "language": "es"
  }
}
```

#### Form Steps

Step 1 — Your Info

```
Full Name         (required)
Email             (email OR phone required)
Phone             (email OR phone required)
Relationship      (Family / Friend / Coworker / Other)
```

Step 2 — Attending?

```
Big YES / NO buttons

  IF YES →
    How many adults?    (number stepper, min 1)
    How many kids?      (number stepper, min 0)
    (headcount auto-calculated)

  IF NO →
    (skip to message)
```

Step 3 — Message

```
Leave a message for Isabella    (textarea, 300 chars)
Make it public on the site?     (toggle)
```

**3 steps. Clean. Done.**

- leave a big thank you screen and then it will timeout after 10 seconds and route back to the home

a user should be able to update the RSVP by entering the phone number or email they entered meaning that at least one of the 2 must be entered when rsvping. only 1 is required not both.

there is goin to be a RSVP deadline date i just dont know it so add it a placeholder date. this should be in the config file as well

to update the RSVP there should be a button that "Update RSVP". with a statement abouve it saying "Already RSVP? Need to change your RSVP?". this should pop up a modal/dialog, and ask the user to enter the phone number or email used with the rsvp then it will fetch the data and show a form with the populated data to be edited. after completing edits ther will be a button saying "Update"

### Updated Dashboard Cards

```
📊 Overview
├── Total Responses
├── ✅ Attending
├── ❌ Declined
├── 👥 Total Headcount
├── 🧑 Total Adults
└── 🧒 Total Kids

💌 Messages Wall
└── All public messages for Isabella

📋 RSVP Table
├── Name, email, phone
├── Relationship
├── Status
├── Adults + Kids
├── Submitted date
└── Delete (admin only)

📤 Export CSV (admin only)
```

the admin should have the ability to delete images from the guest gallery in the dashboard as a type of moderation. so there should be a gallery section that is in the dashboard only visible to the admin. the admina should also have the ability to download all or selected images just like the viewer. admin has the ability to delete any messages on the message board.

the viewer should have the ability to download all the images or selected images. so the view should have a gallery section but is able to download the images either all or selected one. the viewer has the ability to view the messages on the message board

### Event Details:

venue name: La Roma Banquet Hall

venue address: 32550 Cherry Hill rd, Garden City, MI, 48135

starts at 6pm ends at midnight

date is july 24th, 2026

Dress code: there is none at the moment just look your best

Gift Registry/Wishlist: use a place holder for now

hotel accomedations: skip 

### Design Direction

* color of the dress is mint green and gold so i am thinking design around that for now. but make it easily changeable/configurable. there is some reference images found in the path "C:\Users\Bobby\Desktop\Projects\Coding\GitHub Repos\Quince-website\ref-images"

### Project Structure

```

quince-invite/
├── app/
│   ├── page.tsx              # Main invitation
│   ├── upload/
│   │   └── page.tsx          # QR code destination
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts      # Handles R2 uploads
│   │   └── gallery/
│   │       └── route.ts      # Fetches guest photos
│   └── layout.tsx
├── components/
│   ├── Hero.tsx
│   ├── EventDetails.tsx
│   ├── MapEmbed.tsx
│   ├── DirectionsModal.tsx
│   ├── Padrinos.tsx
│   ├── Court.tsx
│   ├── Details.tsx
│   ├── Gallery.tsx
│   ├── GuestGallery.tsx
│   └── QRCode.tsx
├── config/
│   └── isabella.ts           # ← swap this per sister
└── public/
    └── music/
```

### Reference Images

I amw you to take designs from the refernce images but ignore the color schemes. i want you to stay with mint green and gold for main colors. 

### Updated Tech Decisions Per Feature

| Feature                       | Recommendation                    | Why                                                                 |
| ----------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| **Maps embed**          | Google Maps Embed API (free tier) | Best compatibility                                                  |
| **Directions popup**    | Custom modal → deep links        | Native app handoff                                                  |
| **Image/video storage** | Cloudflare R2                     | S3-compatible, free for 10GB, no egress fees                        |
| **Upload backend**      | Next.js API Routes                | Already in your stack, replaces need for separate Cloudflare Worker |
| **Gallery display**     | Next.js + R2 public URLs          | Native image optimization with `next/image`                       |
| **QR Code**             | `qrcode.react`library           | Built for React/Next.js, no service needed                          |
| **Music**               | Self-hosted MP3 in R2             | No licensing issues, free egress                                    |
| **Database**            | MongoDB Atlas (free tier)         | NoSQL, flexible, 512MB free, perfect for RSVPs                      |
| **Auth**                | NextAuth.js                       | Built-in OAuth + Credentials, role support                          |
| **RSVP form**           | Next.js multi-step form + MongoDB | Native API routes save directly to DB                               |
| **Dashboard**           | Next.js `/dashboard`route       | Protected by NextAuth session + role check                          |
| **Hosting**             | Vercel                            | Built by Next.js team, free tier, auto-deploys                      |
