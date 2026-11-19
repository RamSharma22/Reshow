/**
 * Seed script: fetches now-playing movies from TMDB and adds 5 shows to MongoDB.
 * Run from /server folder: node scripts/seedShows.js
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in server/.env");
  process.exit(1);
}

// ─── DB Connect ─────────────────────────────────────────────────────────────
const mongoUri = process.env.MONGODB_URI.includes("?")
  ? process.env.MONGODB_URI
  : `${process.env.MONGODB_URI.replace(/\/$/, "")}/reshow`;

await mongoose.connect(mongoUri);
console.log("✅ DB connected");

// ─── Helpers ─────────────────────────────────────────────────────────────────
const tmdbFetch = async (pathUrl) => {
  const res = await fetch(`https://api.themoviedb.org/3${pathUrl}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
  });
  return res.json();
};

// Generate show dates: today + next 6 days, 3 time slots each day
const generateShowDates = () => {
  const slots = [];
  const times = ["10:00", "14:30", "19:00"];
  for (let d = 0; d < 7; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];
    for (const time of times) {
      slots.push({ date: dateStr, time });
    }
  }
  return slots;
};

// ─── Main ────────────────────────────────────────────────────────────────────
console.log("📡 Fetching now-playing movies from TMDB...");
const nowPlayingData = await tmdbFetch("/movie/now_playing");
const nowPlaying = nowPlayingData.results || [];

if (!nowPlaying || nowPlaying.length === 0) {
  console.error("❌ No movies returned from TMDB. Check TMDB_API_KEY.");
  process.exit(1);
}

// Seed up to 15 movies
const moviesToSeed = nowPlaying.slice(0, 15);
let showsCreated = 0;

for (const m of moviesToSeed) {
  // Fetch full movie details + credits
  const [details, credits] = await Promise.all([
    tmdbFetch(`/movie/${m.id}`),
    tmdbFetch(`/movie/${m.id}/credits`),
  ]);

  // Upsert movie
  let movie = await Movie.findById(String(m.id));
  if (!movie) {
    movie = await Movie.create({
      _id: String(m.id),
      title: details.title,
      overview: details.overview,
      poster_path: details.poster_path,
      backdrop_path: details.backdrop_path || "",
      release_date: details.release_date,
      original_language: details.original_language,
      tagline: details.tagline || "",
      genres: details.genres || [],
      casts: (credits.cast || []).slice(0, 10).map((c) => ({
        name: c.name,
        character: c.character,
        profile_path: c.profile_path,
      })),
      vote_average: details.vote_average,
      runtime: details.runtime || 120,
    });
    console.log(`🎬 Movie saved: ${movie.title}`);
  } else {
    console.log(`🎬 Movie already exists: ${movie.title}`);
  }

  // Create shows (3 slots per day for 7 days)
  const slots = generateShowDates();
  for (const { date, time } of slots) {
    const showDateTime = new Date(`${date}T${time}:00`);
    // Skip if show already exists
    const exists = await Show.findOne({ movie: String(m.id), showDateTime });
    if (!exists) {
      await Show.create({
        movie: String(m.id),
        showDateTime,
        showPrice: 150,
        occupiedSeats: {},
      });
      showsCreated++;
    }
  }
  console.log(`✅ Shows created for: ${details.title}`);
}

console.log(`\n🎉 Done! ${showsCreated} shows added for ${moviesToSeed.length} movies.`);
await mongoose.disconnect();
process.exit(0);
