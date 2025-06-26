import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // imdbID

    title: { type: String, required: true }, // Title
    overview: { type: String, required: true }, // Plot

    poster_path: { type: String, required: true }, // Poster
    backdrop_path: { type: String, required: false }, // Optional

    release_date: { type: String, required: true }, // Released
    original_language: { type: String, required: false }, // Language
    tagline: { type: String, required: false }, // Not available from OMDb

    genres: { type: Array, required: true }, // OMDb Genre field → ["Action", "Sci-Fi"]
    casts: { type: Array, required: true }, // OMDb Actors field → ["Actor1", "Actor2"]

    vote_average: { type: Number, required: true }, // imdbRating
    runtime: { type: Number, required: true }, // Runtime (parsed to minutes)

    director: { type: String, required: false },
    writer: { type: String, required: false },
    rated: { type: String, required: false },
    country: { type: String, required: false },
    awards: { type: String, required: false },
    box_office: { type: String, required: false },
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
