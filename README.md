# GitHub Profile Analyzer API

A robust backend service built with Node.js, Express, and MySQL that fetches data from the GitHub public API, calculates custom profile performance insights, and manages historical profiles natively.

## Features
- **Profile Analysis:** Automatically pulls live metrics from GitHub.
- **Smart Insights:** Dynamically calculates a user's Public Repository-to-Follower ratio to evaluate user engagement style.
- **Idempotent Storage:** Safely tracks updates using MySQL `ON DUPLICATE KEY UPDATE` syntax without clogging records.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **HTTP Client:** Axios

## Local Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone <your-github-repo-link>
   cd github-profile-analyzer

2. **Install Dependencies:**

Bash
npm install

3. **Configure Environment Variables:**
**Create a .env file in the root directory:**

Code snippet
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=github_analyzer

4. **Initialize the Database:**
**Import the schema setup from schema.sql into your local MySQL server.**

5. **Run the Application:**

Bash
# Development mode with auto-reload
npm run dev
