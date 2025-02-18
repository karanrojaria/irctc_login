# Train Booking System API

This is a Train Booking System API built using Node.js and PostgreSQL. It provides endpoints for user authentication, train management, booking seats, and checking seat availability.

## Features

- **User Authentication**
  - Register a user
  - Login and generate JWT tokens for authentication

- **Train Management (Admin only)**
  - Add new trains
  - View available trains between stations
  - Check seat availability on a train

- **User Features**
  - Book seats on available trains
  - View booking details

## Database Setup

The project uses PostgreSQL for data storage. The following tables are used:

- **users**
  - `id` (primary key)
  - `name`
  - `email`
  - `password`
  - `role` (either "user" or "admin")

- **trains**
  - `id` (primary key)
  - `name`
  - `source`
  - `destination`
  - `total_seats`

- **bookings**
  - `id` (primary key)
  - `user_id` (foreign key referencing `users`)
  - `train_id` (foreign key referencing `trains`)
  - `seats_booked`

## Installation & Setup

### Prerequisites

- Node.js (v14.x or later)
- PostgreSQL
- npm or yarn (for package management)

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/karanrojaria/irctc_login.com
   cd irct_login
