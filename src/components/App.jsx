import { useEffect, useState } from "react";
import NavBar from "./NavBar/NavBar";
import Search from "./NavBar/Search";
import NumResults from "./NavBar/NumResult";
import Loader from "./Loader&Error/Loader";
import ErrorMessage from "./Loader&Error/ErrorMessage";
import MovieList from "./MovieList";
import MovieDetails from "./MovieDetails&More/MovieDetails";
import WatchedMovieList from "./Watched/WatchedMovieList";
import Summary from "./Watched/Summary";

const KEY = "9d0c85a2";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelect(id) {
    setSelectedId((curr) => (curr === id ? null : id));
  }

  function queryHandle(query) {
    setQuery(query);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatchedMovies(movie, userRating) {
    setWatched((watched) =>
      watched.some((mov) => mov.imdbID === movie.imdbID)
        ? watched
        : [...watched, { ...movie, userRating: userRating }]
    );
    setSelectedId(null);
  }

  function handleDeleteWatchedMovies(movieId) {
    setWatched((watched) => watched.filter((mov) => mov.imdbID !== movieId));
  }

  useEffect(function () {
    function callBack(e) {
      if (e.code === "Escape") {
        handleCloseMovie();
      }
    }
    document.addEventListener("keydown", callBack);

    return function () {
      document.removeEventListener("keydown", callBack);
    };
  }, []);

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok) throw new Error("The loading is not working somehow...");
          const data = await res.json();
          if (data.Response === "False") {
            throw new Error("The movie is not found");
          }

          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      handleCloseMovie();
      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Search onQueryHandle={queryHandle} query={query} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {!error && !isLoading && (
            <MovieList movies={movies} onSelect={handleSelect} />
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              movieId={selectedId}
              onCloseMovie={handleCloseMovie}
              KEY={KEY}
              onAddWatched={handleAddWatchedMovies}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDelete={handleDeleteWatchedMovies}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}
