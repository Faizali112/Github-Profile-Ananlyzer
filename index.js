const express = require('express');
const axios = require('axios');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Serve static files from the public directory (where index.html lives)
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// 1. POST: Analyze and store/update GitHub profile
app.post('/api/analyze/:username', async (req, res) => {
    const { username } = req.params;

    try {
        // Fetch from GitHub Public API
        const githubResponse = await axios.get(`https://api.github.com/users/${username}`, {
            headers: { 'User-Agent': 'Github-Profile-Analyzer' }
        });

        const data = githubResponse.data;

        const followers = data.followers || 0;
        const publicRepos = data.public_repos || 0;
        
        // 4 decimal places ensure fractional values don't snap down to 0.00
        const ratio = followers > 0 ? (publicRepos / followers).toFixed(4) : publicRepos.toFixed(4);

        // Calculate Account Age in Years dynamically
        const createdDate = new Date(data.created_at);
        const today = new Date();
        const ageInYears = ((today - createdDate) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);

        // Save or update in MySQL
        const query = `
            INSERT INTO profiles (username, name, bio, public_repos, followers, following, public_gists, repo_follower_ratio, account_age_years, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                bio = VALUES(bio),
                public_repos = VALUES(public_repos),
                followers = VALUES(followers),
                following = VALUES(following),
                public_gists = VALUES(public_gists),
                repo_follower_ratio = VALUES(repo_follower_ratio),
                account_age_years = VALUES(account_age_years),
                avatar_url = VALUES(avatar_url),
                analyzed_at = CURRENT_TIMESTAMP
        `;

        await db.execute(query, [
            data.login,
            data.name || null,
            data.bio || null,
            publicRepos,
            followers,
            data.following || 0,
            data.public_gists || 0,
            ratio,
            ageInYears,
            data.avatar_url || null
        ]);

        res.status(200).json({
            message: "Profile analyzed and saved successfully!"
        });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: "GitHub user not found." });
        }
        console.error(error);
        res.status(500).json({ error: "An error occurred while processing the profile." });
    }
});

// 2. GET: Fetch all analyzed profiles
app.get('/api/profiles', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM profiles ORDER BY analyzed_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error fetching profiles." });
    }
});

// 3. GET: Fetch a single analyzed profile from DB
app.get('/api/profiles/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM profiles WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Profile not found in database. Analyze it first!" });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error fetching profile." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});