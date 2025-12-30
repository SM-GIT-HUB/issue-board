# Smart Issue Board

A simple issue tracking board built as part of the internship assignment.  
The focus of this project is **practical decision making**, **clean data modeling** and **handling ambiguous requirements**, rather than over engineering.


## Tech Stack

- **Frontend:** Next.js (App Router) + Tailwind CSS  
- **Backend / Database:** Firebase / Firestore  
- **Authentication:** Firebase Auth (Email & Password)  
- **Hosting:** Vercel  
- **Code Hosting:** GitHub  


## Why This Frontend Stack?

I chose **Next.js** because it allows rapid development with a clear file based routing system and works seamlessly with **Vercel**, which is the required hosting platform.

Since the application relies on Firebase for authentication and database, a custom backend was unnecessary. Using Next.js with client-side Firebase SDKs kept the architecture simple and aligned with the scope of the assignment.

Tailwind CSS was used for quick, minimal styling without spending time on custom CSS.


## Firestore Data Structure

The application uses a single collection:

### `issues` (collection)

Each document represents one issue and contains:

- `title` (string)
- `description` (string)
- `priority` (`Low | Medium | High`)
- `status` (`Open | In Progress | Done`)
- `assignedTo` (string)
- `createdBy` (string – user email)
- `createdAt` (timestamp)

Firestore is schema less, so fields are created when an issue is added.  
This flat structure keeps queries simple and supports filtering and sorting efficiently.

### Firestore Security Rules

- Only authenticated users can read and write issues
- Only valid `status` and `priority` values are stored


## Similar Issue Handling

While creating an issue, the system checks for similar existing issues based on the **words in the issue title**.

The title is normalized (lowercased and split into words) and issues with overlapping words are considered similar.

If similar issues are found:

- The user is shown a warning
- Existing issue titles and statuses are displayed
- The user can still choose to create the issue if it is different

This approach avoids accidental duplicates while keeping the logic simple, transparent and user controlled.


## Challenges Faced

- Understanding Firestore security rules and separating read vs write conditions
- Deciding how much logic should live in the frontend versus Firestore rules
- Interpreting vague requirements like “similar issue handling” and choosing a practical solution
- Handling Next.js client-side authentication cleanly without over-engineering


## What I Would Improve Next

- Better similarity detection (e.g., ignoring common stop words or improving word matching)
- Pagination for large issue lists
- Role-based permissions (e.g., admin vs user)
- Issue comments or activity history
- Improved UI/UX polish for larger screens


## Live Demo

👉 *(Add your Vercel deployment link here)*


## Repository

👉 *(Add your public GitHub repository link here)*