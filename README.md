# Language Tutors App

A Next.js + Tailwind CSS web application with Firebase Realtime Database for online language tutor services.

---

## Project Overview

This project is a multi-page web app designed for a company that offers online language learning services through tutors. The app consists of three main pages:

- **Home** — Presents company advantages and a call-to-action button linking to the Teachers page. The design uses variations of the color palette based on the provided mockup or prototype to keep the project unique.

- **Teachers** — Displays a list of tutors that users can filter by:

  - Language of instruction
  - Student proficiency level
  - Price per hour

- **Favorites** — A private page showing tutors the user has marked as favorites.

---

## Key Features & Technical Requirements

1. **User Authentication**  
   Implemented with Firebase Realtime Database: registration, login, current user data retrieval, and logout.

2. **Forms & Validation**  
   Registration and login forms use `react-hook-form` with `yup` for minimal field validation. All fields are mandatory.  
   Modal windows close when clicking the "X" button, clicking outside (backdrop), or pressing Esc.

3. **Tutors Collection in Firebase Realtime Database**  
   Collection fields include:  
   `name`, `surname`, `languages`, `levels`, `rating`, `reviews`, `price_per_hour`, `lessons_done`, `avatar_url`, `lesson_info`, `conditions`, `experience`.  
   Use the provided `teachers.json` to populate the database.

4. **Tutor Cards**  
   Cards display tutor details according to the mockup.

5. **Pagination**  
   Initially, 4 tutor cards are displayed on the Teachers page. Additional cards load upon clicking the "Load more" button, fetching the next batch from the database.

6. **Favorites Functionality**

   - If an unauthenticated user clicks the "heart" button, show a modal or toast notifying that this feature requires login.
   - For authenticated users, add/remove tutors to/from favorites, persist this state (via localStorage or Firebase users collection), and toggle the heart button color accordingly.
   - On page reload, the favorites state must persist and reflect correctly.

7. **Read More**  
   Clicking "Read more" expands the card showing detailed tutor info and student reviews.

8. **Booking Trial Lessons**  
   Clicking "Book trial lesson" opens a modal with a booking form validated by `react-hook-form` and `yup`. All fields are required. Modal closes via "X", backdrop click, or Esc.

9. **Private Favorites Page**  
   Only accessible to authenticated users; displays their favorite tutors styled similarly to the Teachers page.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Database & Auth:** Firebase Realtime Database & Firebase Authentication
- **Forms & Validation:** react-hook-form + yup
- **Deployment:** Vercel

---

## Author

Yurii Shpuryk

---

Thank you for checking out the project! Feel free to open issues or contribute.
