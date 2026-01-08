# College Connect: Event & Social Platform

College Connect is a full-stack web application designed to be the central hub for a university campus. It combines a powerful event management system with a private, campus-only social network, allowing students to connect, share, and participate in campus life.

This project is built with a modern, scalable backend using Node.js, Express, and Prisma and a dynamic, component-based frontend using React.

##  Core Features


**1. Authentication & Role Management**

* **Student Signup:** New users can register for an account and are assigned the STUDENT role by default.

* **Secure Login:** JWT (JSON Web Token) based authentication for all user roles.

* **Password Reset:** Full "forgot password" flow that sends a secure, time-limited reset link via email.

* **Role-Based Access Control (RBAC):** The application has three distinct user roles with specific permissions:

    * `STUDENT`: Can browse/register for events, join clubs, and use all social features.

    * `ORGANIZER`: Can do everything a Student can, plus create and manage events for their assigned clubs.

    * `ADMIN`: Full super-user permissions, including promoting users and creating clubs.


**2. Admin Dashboard**

* **User Management:** Admins can view a complete list of all users in the system.

* **Promote to Organizer:** Admins can promote any STUDENT to an ORGANIZER, enabling them to manage clubs.

* **Club Creation:** Admins can create new clubs and assign an ORGANIZER as the manager.

**3. Event Management**

* **Event Creation (Admin/Organizer):** A detailed form for creating new events, including title, description, date/time, venue, price, and registration limits.

* **Club Assignment:** Admins can create events for any club, while Organizers can only create events for clubs they manage.

* **Individual & Team Events:** Supports both individual and team-based registration (with min/max team sizes).

* **Event Lifecycle:**

    * **Announcements:** Organizers can post announcements for their event, which sends a notification to all registered participants.

    * **Results:** Organizers can post event results (winner, runner-up) from a list of registered participants.

**4. Event & Club Browsing (Students)**

* **Home Page Feed:** A main dashboard showing all upcoming events.

* **Club Directory:** A dedicated page to browse and discover all campus clubs.

* **Club Details:** A rich detail page for each club, showing its description, organizer, member list, and upcoming events.

* **Join/Leave Clubs:** Students can join and leave clubs with a single click.

* **Event Details:** A full-page view for each event with all details, including a "Register" button.

**5. Social Network ("Mini-Instagram")**

* **Create Post:** Users can create new posts, including uploading an image (with preview) and writing a caption.

* **File Uploads:** Secure image uploads are handled by Multer and stored in Cloudinary.

* **Post Visibility:** Users can set the visibility of their posts (Public, My Department, Linked Event).

* **Social Feed:** A main /feed route showing posts from followed users, public posts, and posts from the user's department.

* **Like/Unlike:** Users can like and unlike posts with an optimistic UI update.

* **Commenting:** Users can view all comments on a single post page and add their own.

* **User Profiles:**

    * **My Profile (`/profile`):** A private page for users to see their own info, with tabs for their posts, joined clubs, and registered events.

    * **Public Profile (`/profile/:id`):** A public page to view other users' profiles, their public posts, and their clubs.

    * **Follow/Unfollow:** Users can follow and unfollow other users.

**6. Notification System**

* **Navbar Integration:** A "bell" icon in the navbar shows a real-time badge with the count of unread notifications.

* **Dropdown List:** Clicking the bell shows a dropdown list of all recent notifications.

* **Mark as Read:** The count decreases as users click on individual notifications to read them.

* **Triggers:** Notifications are automatically created for:

    * **New Like**

    * **New Comment**

    * **New Follower**

    * **Event Announcement**

    * **Event Results (Winner/Runner-up)**

##  Tech Stack

| **Area** | **Technology** |
|-----------|----------------|
| **Frontend** | React (Vite), React Router, Axios, Inline CSS-in-JS |
| **Backend** | Node.js, Express.js, **Socket.io** |
| **Database** | PostgreSQL, **MongoDB (Replica Set for Notifications & Real-Time Features)** |
| **ORM** | Prisma |
| **Authentication** | JSON Web Token (JWT), bcrypt |
| **File Uploads** | Cloudinary, Multer |
| **API Validation** | zod |
| **Email** | Nodemailer |
| **Security** | **Rate Limiting (express-rate-limit)** |
| **Real-Time** | **Socket.io** |


##  Setup & Installation

To run this project locally, you will need to set up both the backend server and the frontend client.

**1. Backend Setup**

1. **Clone the repository** and cd into the backend directory.

2. **Install dependencies:**

        npm install


3. **Create your `.env` file:**

    * Copy the `.env.example` file to a  new file named `.env`.

    * Fill in all the required variables:

        * `DATABASE_URL`: Your PostgreSQL connection string.

        * `JWT_SECRET`: A strong, random string for signing tokens.

        * `EMAIL_USER` / `EMAIL_PASS`: Your Nodemailer (e.g., Gmail "App Password") credentials.

        * `CLOUDINARY_...`: Your API keys from your Cloudinary dashboard.

    **4. Run database migrations:**

    * This will set up your database tables based on the schema.prisma file.

            npx prisma migrate dev


    **5. Seed the database:**

    * This will run the prisma/seed.js script to create your first ADMIN user.

            npx prisma db seed


    **6. Start the server:**

            npm run dev


The backend server will be running on `http://localhost:5000`.

**2. Frontend Setup**

1. Open a new terminal and `cd` into the `frontend` (or client) directory.

2. Install dependencies:

        npm install


3. Run the client:

        npm run dev


    The React development server will start, usually on `http://localhost:5173`.

4. Open the app in your browser at `http://localhost:5173` and start using it!

#  API Endpoints
##  API Endpoints

###  **Auth**

| **Method** | **Endpoint** | **Access** | **Description** |
|-------------|--------------|-------------|------------------|
| `POST` | `/auth/signup` | Public | Register a new **STUDENT** user. |
| `POST` | `/auth/login` | Public | Log in any user and receive a JWT. |
| `GET` | `/auth/verify` | Private | Verify a token and get user data on app load. |
| `POST` | `/auth/forgot-password` | Public | Start the password reset email flow. |
| `POST` | `/auth/reset-password` | Public | Set a new password using a reset token. |

---

###  **Admin**

| **Method** | **Endpoint** | **Access** | **Description** |
|-------------|--------------|-------------|------------------|
| `GET` | `/admin/users` | Admin | Get a list of all users. |
| `PUT` | `/admin/promote` | Admin | Promote a user (by ID) to **ORGANIZER**. |

---

###  **Users & Profiles**

| **Method** | **Endpoint** | **Access** | **Description** |
|-------------|--------------|-------------|------------------|
| `GET` | `/users/me` | Private | Get the full, rich profile of the logged-in user. |
| `GET` | `/users/:id` | Private | Get the public profile of another user. |
| `POST` | `/users/:id/follow` | Private | Follow a user. |
| `DELETE` | `/users/:id/unfollow` | Private | Unfollow a user. |

---

###  **Notifications**

| **Method** | **Endpoint** | **Access** | **Description** |
|-------------|--------------|-------------|------------------|
| `GET` | `/users/notifications` | Private | Get all notifications for the logged-in user. |
| `PUT` | `/users/notifications/:id/read` | Private | Mark a single notification as read. |

---

###  **Clubs**

| **Method** | **Endpoint** | **Access** | **Description** |
|-------------|--------------|-------------|------------------|
| `POST` | `/clubs` | Admin | Create a new club and assign an organizer. |
| `GET` | `/clubs` | Private | Get a list of all clubs. |
| `GET` | `/clubs/my-clubs` | Organizer | Get only the clubs managed by the logged-in organizer. |
| `GET` | `/clubs/:id` | Private | Get details for a single club (members, events). |
| `POST` | `/clubs/:id/join` | Student | Join a club. |
| `DELETE` | `/clubs/:id/leave` | Student | Leave a club. |

---

###  **Events**

| **Method** | **Endpoint** | **Access** | **Description** |
|-------------|--------------|-------------|------------------|
| `POST` | `/events` | Org/Admin | Create a new event for a club. |
| `GET` | `/events` | Private | Get a list of all active events. |
| `GET` | `/events/:id` | Private | Get details for a single event. |
| `GET` | `/events/:id/registrants` | Org/Admin | Get a list of users registered for an event. |
| `POST` | `/events/:id/register-individual` | Student | Register as an individual for an event. |
| `POST` | `/events/:id/register-team` | Student | Register a team for an event. |
| `POST` | `/events/:id/announce` | Org/Admin | Create an announcement for an event. |
| `POST` | `/events/:id/results` | Org/Admin | Post the results for an event. |


###  **Posts (Social)**

| **Method** | **Endpoint** | **Access** | **Description** |
|-------------|--------------|-------------|------------------|
| `POST` | `/posts` | Private | Create a new post (with image upload). |
| `GET` | `/posts/feed` | Private | Get the user's personalized social feed. |
| `GET` | `/posts/:id` | Private | Get a single post and all its comments. |
| `POST` | `/posts/:id/like` | Private | Like or unlike a post. |
| `POST` | `/posts/:id/comment` | Private | Add a comment to a post. |


###  Additional Backend Infrastructure

**Rate Limiting**
- Implemented using `express-rate-limit`.
- Protects authentication routes and other sensitive endpoints from brute-force attacks and API abuse.

**Socket.io Integration**
- Powers real-time features such as:
  - Live notifications
  - Future messaging system
  - Event announcements in real time

**MongoDB Replica Set**
- Used for storing notifications and real-time event data.
- Provides high availability and failover support.
- Ensures real-time operations are fast and reliable.


##  Future Enhancements

* **Payment Integration:** Use Stripe or Razorpay to handle payments for paid events.

* **Team Registration UI:** A dedicated UI for team leaders to invite and manage their team members.


* **Pagination:** Add pagination to all feeds (events, posts, clubs) to handle large amounts of data.

* **CSS Refactor:** Convert all inline styles to CSS Modules or a CSS-in-JS library for better maintainability.

* **Dark Mode:** Implement a site-wide dark mode toggle.
* **Messaging Feature** There will be a messaging app inside this app






