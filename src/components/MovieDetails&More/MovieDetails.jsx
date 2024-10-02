import { useState, useEffect } from "react";
import Loader from "../Loader&Error/Loader";
import StarRating from "./StarRating";
import Rated from "./Rated";
const KEY = "9d0c85a2";

export default function MovieDetails({
  movieId,
  onCloseMovie,
  onAddWatched,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const isRated = watched.some((mov) => mov.imdbID === movieId);

  const {
    Title: title,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Fenre: genre,
  } = movie;

  function handleRating(rate) {
    setRating(rate);
  }

  function handleClick() {
    onAddWatched(movie, rating);
  }

  useEffect(
    function () {
      async function fetchMovie(movieId) {
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${movieId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      fetchMovie(movieId);
    },
    [movieId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "MovieNote";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB rating
              </p>
            </div>
          </header>

          <section>
            {isRated ? (
              <Rated
                rating={
                  watched.find((movie) => movie.imdbID === movieId).userRating
                }
              />
            ) : (
              <>
                <div className="rating">
                  <StarRating
                    maxRating={10}
                    size={24}
                    onRating={handleRating}
                    rating={rating}
                  />
                  <button class="btn-add" onClick={handleClick}>
                    + Add to list
                  </button>
                </div>
              </>
            )}
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
