import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import axios from "axios";
import Movie from "../models/Movie.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in server/.env");
  process.exit(1);
}

const mongoUri = process.env.MONGODB_URI.includes("?")
  ? process.env.MONGODB_URI
  : `${process.env.MONGODB_URI.replace(/\/$/, "")}/reshow`;

await mongoose.connect(mongoUri);
console.log("✅ DB connected");

const tmdbAxios = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
  },
  timeout: 10000,
});

// Iconic movie IDs to ensure top blockbusters are available in the DB
const iconicMovieIds = [
  27205,   // Inception
  157336,  // Interstellar
  155,     // The Dark Knight
  299534,  // Avengers: Endgame
  872585,  // Oppenheimer
  693134,  // Dune: Part Two
  533535,  // Deadpool & Wolverine
  558449,  // Gladiator II
  76600,   // Avatar: The Way of Water
  634649,  // Spider-Man: No Way Home
  912649,  // Venom: The Last Dance
  1022789, // Inside Out 2
  402431,  // Wicked
  1241982, // Moana 2
  1726,    // Iron Man
];

async function seed() {
  const movieIdsToFetch = new Set(iconicMovieIds);

  try {
    const [nowPlayingRes, popularRes] = await Promise.all([
      tmdbAxios.get("/movie/now_playing").catch(() => ({ data: { results: [] } })),
      tmdbAxios.get("/movie/popular").catch(() => ({ data: { results: [] } })),
    ]);

    for (const m of nowPlayingRes.data.results || []) {
      if (m.id) movieIdsToFetch.add(m.id);
    }
    for (const m of popularRes.data.results || []) {
      if (m.id) movieIdsToFetch.add(m.id);
    }
  } catch (err) {
    console.warn("Could not fetch lists from TMDB, proceeding with iconic IDs:", err.message);
  }

  console.log(`🎬 Total candidate movies to process: ${movieIdsToFetch.size}`);

  let addedCount = 0;
  let updatedCount = 0;

  for (const movieId of movieIdsToFetch) {
    try {
      const [detailsRes, creditsRes] = await Promise.all([
        tmdbAxios.get(`/movie/${movieId}`),
        tmdbAxios.get(`/movie/${movieId}/credits`),
      ]);

      const data = detailsRes.data;
      const credits = creditsRes.data;

      const movieDoc = {
        _id: String(data.id),
        title: data.title || "Untitled",
        overview: data.overview || "No overview available.",
        poster_path: data.poster_path || "",
        backdrop_path: data.backdrop_path || "",
        release_date: data.release_date || new Date().toISOString().split("T")[0],
        original_language: data.original_language || "en",
        tagline: data.tagline || "",
        genres: data.genres || [],
        casts: (credits.cast || []).slice(0, 15).map((c) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profile_path: c.profile_path,
        })),
        vote_average: Number(data.vote_average) || 0,
        runtime: Number(data.runtime) || 120,
      };

      const existing = await Movie.findById(String(movieId));
      if (!existing) {
        await Movie.create(movieDoc);
        addedCount++;
        console.log(`➕ Added: ${movieDoc.title} (${movieDoc._id})`);
      } else {
        await Movie.findByIdAndUpdate(String(movieId), movieDoc);
        updatedCount++;
        console.log(`🔄 Updated: ${movieDoc.title} (${movieDoc._id})`);
      }
    } catch (err) {
      console.error(`⚠️ Failed to fetch/save movie ${movieId}:`, err.message);
    }
  }

  const totalInDb = await Movie.countDocuments();
  console.log(`\n🎉 Seed completed! Added: ${addedCount}, Updated: ${updatedCount}, Total in DB: ${totalInDb}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
