import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { inngest } from "../inngest/index.js";

// API to get now playing and database movies
export const getNowPlayingMovies = async (req, res) => {
  try {
    // 1. Fetch all movies from the MongoDB database
    const dbMovies = await Movie.find().sort({ createdAt: -1 }).lean();

    const formattedDbMovies = dbMovies.map((movie) => ({
      id: String(movie._id),
      _id: String(movie._id),
      title: movie.title,
      overview: movie.overview || "",
      poster_path: movie.poster_path || "",
      backdrop_path: movie.backdrop_path || "",
      release_date: movie.release_date || "",
      vote_average: typeof movie.vote_average === "number" ? movie.vote_average : 0,
      vote_count: movie.vote_count || 120,
      genres: movie.genres || [],
      runtime: movie.runtime || 120,
    }));

    // Map by ID to prevent duplicates
    const moviesMap = new Map();
    formattedDbMovies.forEach((m) => moviesMap.set(String(m.id), m));

    // 2. Attempt to fetch now-playing movies from TMDB API to enrich the list
    if (process.env.TMDB_API_KEY) {
      try {
        const { data } = await axios.get(
          "https://api.themoviedb.org/3/movie/now_playing",
          {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
            timeout: 5000,
          }
        );

        if (data && Array.isArray(data.results)) {
          data.results.forEach((tmdbMovie) => {
            const mId = String(tmdbMovie.id);
            if (!moviesMap.has(mId)) {
              moviesMap.set(mId, {
                id: mId,
                _id: mId,
                title: tmdbMovie.title,
                overview: tmdbMovie.overview || "",
                poster_path: tmdbMovie.poster_path || "",
                backdrop_path: tmdbMovie.backdrop_path || "",
                release_date: tmdbMovie.release_date || "",
                vote_average: typeof tmdbMovie.vote_average === "number" ? tmdbMovie.vote_average : 0,
                vote_count: tmdbMovie.vote_count || 100,
              });
            }
          });
        }
      } catch (tmdbError) {
        console.warn("TMDB fetch failed, falling back to database movies:", tmdbError.message);
      }
    }

    const movies = Array.from(moviesMap.values());
    res.json({ success: true, movies });
  } catch (error) {
    console.error("Error in getNowPlayingMovies:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to add a new show to the database
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);

    if (!movie) {
      // Fetch movie details and credits from TMDB API
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),

        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
      ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      const movieDetails = {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      };

      //   Add movie to the database
      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = [];
    showsInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {}, // Initialize with empty object
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    // Trigger Inngest event
    // await inngest.send({
    //   name: "app/show.added",
    //   data: { movieTitle: movie.title },
    // });

    res.json({ success: true, message: "Show Added successfully." });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all shows from the database
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    // filter unique shows by movie _id
    const uniqueMoviesMap = new Map();
    shows.forEach((show) => {
      const movie = show.movie;
      if (movie && !uniqueMoviesMap.has(String(movie._id))) {
        uniqueMoviesMap.set(String(movie._id), movie);
      }
    });

    res.json({ success: true, shows: Array.from(uniqueMoviesMap.values()) });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get a single show from the database
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;
    // get all upcoming shows for the movie
    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });

    const movie = await Movie.findById(movieId);
    const dateTime = {};

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) {
        dateTime[date] = [];
      }

      dateTime[date].push({ time: show.showDateTime, showId: show._id });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
