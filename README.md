# **Language Tutors App**

A **Next.js + Tailwind CSS** web application with **Firebase Realtime Database** for online language tutor services.

---

## **Project Overview**

This project is a multi-page web app designed for a company that offers online language learning services through tutors.

The app consists of five main pages:

- **Home** — Presents company advantages and a call-to-action button linking to the Teachers page. The design uses variations of the color palette based on the provided mockup or prototype to keep the project unique.

- **Teachers** — Displays a list of tutors that users can filter by:
   - **Language of instruction**
   - **Student proficiency level**
   - **Price per hour**

- **Favorites** — A private page showing tutors the user has marked as favorites.

- **Bookings** — A private page listing all trial lessons booked by the authenticated user.
   - Users can view the **booking date**, **tutor name**, and **status**.
   - Booking data is fetched from **Firebase Realtime Database** and displayed in a **responsive card layout**.

- **Profile** — A private page where authenticated users can:
   - **View** and **update** their personal information (**name**, **email**)
   - See **account creation date** and other profile details stored in **Firebase Realtime Database**

---

## **Key Features & Technical Requirements**

- **User Authentication** — Implemented with **Firebase Realtime Database**: registration, login, current user data retrieval, and logout.

- **Forms & Validation** — Registration and login forms use **react-hook-form** with **zod** for minimal field validation. All fields are mandatory.
   - Modal windows close when clicking the **"X"** button, clicking outside (backdrop), or pressing **Esc**.

- **Tutors Collection in Firebase Realtime Database** — Collection fields include:
  `name`, `surname`, `languages`, `levels`, `rating`, `reviews`, `price_per_hour`, `lessons_done`, `avatar_url`, `lesson_info`, `conditions`, `experience`.
   
- **Tutor Cards** — Cards display tutor details according to the mockup.

- **Pagination** — Initially, 4 tutor cards are displayed on the Teachers page. Additional cards load upon clicking the **"Load more"** button, fetching the next batch from the database.

- **Favorites Functionality**
   - If an unauthenticated user clicks the **"heart"** button, show a modal login.
   - For authenticated users, add/remove tutors to/from favorites, and toggle the heart button color accordingly.
   - On page reload, the favorites state must persist and reflect correctly.

- **Read More** — Clicking **"Read more"** expands the card showing detailed tutor info and student reviews.

- **Booking Trial Lessons** — Clicking **"Book trial lesson"** opens a modal with a booking form validated by **react-hook-form** and **zod**. All fields are required.
   - Modal closes via **"X"**, backdrop click, or **Esc**.

- **Private Favorites Page** — Only accessible to authenticated users; displays their favorite tutors styled similarly to the Teachers page.

- **Private Bookings Page** — Displays all lessons booked by the user in a **responsive card layout** with booking date, tutor name, and status.

- **Profile Management** — Allows authenticated users to view and update profile data and see account creation date stored in Firebase.

---

## **Tech Stack**

- **Framework:** Next.js (App Router)
- **Languages:** JavaScript + TypeScript
- **Styling:** Tailwind CSS
- **Database & Auth:** Firebase Realtime Database & Firebase Authentication
- **Forms & Validation:** react-hook-form + zod
- **Deployment:** Vercel

---

## **Author**

**Yurii Shpuryk**
