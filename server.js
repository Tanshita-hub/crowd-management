
// server.js
const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();
app.use(express.json());

const GOOGLE_API_KEY = "AIzaSyDRmfh4uxv4bKtRfN9O0n5l7kMjqaooj2E";

// store live places
let livePlaces = [];

// serve frontend
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// get nearby places (REAL places) with fallback
app.post("/live-places-base", async (req, res) => {
    try {
        const { lat, lng } = req.body;

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json
?location=${lat},${lng}
&radius=5000
&key=${GOOGLE_API_KEY}`;


        const response = await axios.get(url);

console.log("Google Status:", response.data.status);
console.log("Places Found:", response.data.results.length);
if (response.data.status === "ZERO_RESULTS") {
    console.log("ZERO_RESULTS → Using demo crowd data");

    livePlaces = [
        { name: "Main Bus Stand", distance: 800, capacity: 300, current: 180 },
        { name: "City Market", distance: 1200, capacity: 500, current: 420 },
        { name: "Railway Station", distance: 2500, capacity: 600, current: 550 }
    ];

    return res.json(livePlaces);
}


        livePlaces = response.data.results.slice(0, 5).map(place => {
            const distance = Math.floor(Math.random() * 1000) + 100;
            const capacity = Math.floor(distance / 2) + 100;

            return {
                name: place.name,
                distance,
                capacity,
                current: Math.floor(Math.random() * capacity)
            };
        });

        res.json(livePlaces);

    } catch (err) {
        console.error("Google Places API error:", err.message);

        // fallback fake data (VERY IMPORTANT for demo)
        res.json([
            { name: "Bus Stand", distance: 300, capacity: 250, current: 120 },
            { name: "Railway Station", distance: 500, capacity: 350, current: 280 },
            { name: "Market Area", distance: 700, capacity: 450, current: 390 }
        ]);
    }
});

// auto update people count every 3 seconds
setInterval(() => {
    livePlaces = livePlaces.map(p => {
        let change = Math.floor(Math.random() * 20 - 10); // -10 to +10
        let newCount = p.current + change;

        if (newCount < 0) newCount = 0;
        if (newCount > p.capacity) newCount = p.capacity;

        return { ...p, current: newCount };
    });
}, 3000);

app.get("/live-places-current", (req, res) => {
    res.json(livePlaces);
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
