import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { inngest } from "../inngest/index.js";
console.log("✅ showController.js loaded");
export const getNowPlayingMovies = async (req, res) => {
  try {
    // Use 's' (search) for a general query or 't' for exact title
    const { data } = await axios.get("https://www.omdbapi.com/", {
      params: {
        apikey: process.env.OMDB_API_KEY,
        s: "Avengers", // You can change this to be dynamic later
        type: "movie",
      },
    });

    const movies = data.Search || []; // OMDb returns Search[] array
    res.json({ success: true, movies });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
//adding new show to the database
export const addShow = async (req, res) => {
  try {
    console.log("👉 req.body =", req.body);

    if (
      !req.body ||
      !req.body.movieId ||
      !req.body.showInput ||
      !req.body.showPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: movieId, showInput, or showPrice",
      });
    }

    const { movieId, showInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);

    if (!movie) {
      const { data: detail } = await axios.get("https://www.omdbapi.com/", {
        params: { apikey: process.env.OMDB_API_KEY, i: movieId },
      });

      if (!detail || detail.Response === "False") {
        return res.status(404).json({
          success: false,
          message: "Invalid movie ID or movie not found",
        });
      }

      const movieDetails = {
        _id: detail.imdbID,
        title: detail.Title,
        overview: detail.Plot,
        poster_path: detail.Poster,
        backdrop_path: detail.Poster,
        release_date: detail.Released,
        original_language: detail.Language,
        tagline: "",
        genres: detail.Genre?.split(",").map((g) => g.trim()) || [],
        casts: detail.Actors?.split(",").map((a) => a.trim()) || [],
        vote_average: parseFloat(detail.imdbRating) || 0,
        runtime: parseInt(detail.Runtime) || 0,
        director: detail.Director,
        writer: detail.Writer,
        rated: detail.Rated,
        country: detail.Country,
        awards: detail.Awards,
        box_office: detail.BoxOffice,
      };

      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = showInput.map(({ date, time }) => ({
      movie: movie._id,
      showDateTime: new Date(`${date}T${time}`),
      showPrice,
      occupiedSeats: {},
    }));

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }
    await inngest.send({
      name: "app/show.added",
      data: { movieTitle: movie.title },
    });

    res.json({ success: true, message: "Show(s) added successfully" });
  } catch (error) {
    console.error("❌ Error adding show:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    // ✅ Filter out shows where movie is null (bad reference)
    const validShows = shows.filter((show) => show.movie && show.movie._id);

    // ✅ Deduplicate movies
    const uniqueMap = new Map();
    validShows.forEach((show) => {
      const movieId = show.movie._id;
      if (!uniqueMap.has(movieId)) {
        uniqueMap.set(movieId, show.movie);
      }
    });

    res.json({ success: true, shows: Array.from(uniqueMap.values()) });
  } catch (error) {
    console.error("❌ Error getting shows:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//api to get single show from the database
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;
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
    console.error("❌ Error getting shows:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


