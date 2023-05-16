let apiKey = "6379130c30bb5a7ca87ece7f3f76d3da";
let apiMoviesUrl = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`;
let apiMovieGenreUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`;
let apiTvGenreUrl = `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=en-US`;
let apiSearchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&include_adult=false`;
let data;
let pageNo = 1;
let moviesHolder = document.querySelector(".movie-titles .row");
let overlay = document.querySelector(".overlay");
let movieModal = document.querySelector(".movie-modal");
let logo = document.querySelector(".logo");
let searchInput = document.querySelector(".input-search");
let crossModal;
let searchQuery;


// Get Data
async function getApiData(pageNo = 1, apiUrl) {
    try {
        data = await fetch(`${apiUrl}&page=${pageNo}`).then((response) => { return response.json() });
        return data;

    } catch (error) {
        return error;
    }
}




// Append Movies
const appendMovie = (movieData, search = false) => {
    let data = movieData.results;
    data.forEach((movie, index) => {
        let colDiv = document.createElement("div");
        colDiv.setAttribute("class", "col-6 col-sm-4 col-md-3 col-xl-2");
        let movieBox = document.createElement("div");
        movieBox.setAttribute("class", "movie-box");
        movieBox.setAttribute("data-page", pageNo);
        movieBox.setAttribute("data-value", index);
        search && movieBox.setAttribute("data-search", search);
        let movieImg = document.createElement("img");
        movie.poster_path && movieImg.setAttribute("src", `http://image.tmdb.org/t/p/w500/${movie.poster_path}`);
        movieImg.setAttribute("alt", `${movie.name || movie.title}`);
        colDiv.appendChild(movieBox);
        movieBox.appendChild(movieImg);
        moviesHolder.appendChild(colDiv);
    });
    // console.log(data)
    pageNo++;

}


// Open Modal
document.addEventListener("click", (evt) => {
    let movieBox = evt.target.parentElement
    if (movieBox.classList.contains("movie-box")) {
        // Open Modal
        crossModal = document.querySelector(".movie-modal .cross");
        movieModal.style.display = "block";
        overlay.style.display = "block";
        document.body.classList.add("overflow-hidden");


        // Get data for Modal
        let moviePage = movieBox.getAttribute("data-page");
        let movieNo = movieBox.getAttribute("data-value");
        let searchStatus = movieBox.getAttribute("data-search");

        let apiUrl;
        searchStatus ? apiUrl = `${apiSearchUrl}&query=${searchQuery}` : apiUrl = apiMoviesUrl;

        getApiData(moviePage, apiUrl).then((data) => {
            let movie = data.results[movieNo];
            let movieImg = movieModal.querySelector(".movie-img img");
            let movieName = movieModal.querySelector(".movie-head");
            let movieDesc = movieModal.querySelector(".movie-desc");
            let movieRlsDate = movieModal.querySelector(".rls-date");
            let movieGenre = movieModal.querySelector(".movie-genre");
            let movieStars = movieModal.querySelector(".movie-stars");
            movieGenre.innerHTML = "";
            movieStars.innerHTML = "";
            let imgUrl = movie.poster_path ? `http://image.tmdb.org/t/p/w500/${movie.poster_path}` : "";;
            movieImg.setAttribute('src', imgUrl);
            movieName.textContent = movie.title || movie.name;
            movieDesc.textContent = movie.overview;
            movieRlsDate.innerHTML = `<span class="rls-head">Release Date:</span> ${movie.release_date || movie.first_air_date}`;

            let stars = Math.round(movie.vote_average * 5 / 10);
            for (let i = 0; i < stars; i++) {
                movieStars.innerHTML += `<i class="fa-solid fa-star"></i>`;
            }

            let apiUrl;
            movie.media_type === "movie" ? apiUrl = apiMovieGenreUrl : apiUrl = apiTvGenreUrl;
            getApiData(undefined, apiUrl).then((data) => {
                let genreIds = movie.genre_ids;
                genreIds && genreIds.forEach((ele) => {
                    movieGenre.innerHTML += `<li>${data.genres.find((data) => data.id == ele).name}</li>`;
                });
            });

        });

    }


    // Close Modal
    if (evt.target.parentElement == crossModal) {
        movieModal.style.display = "none";
        overlay.style.display = "none";
        document.body.classList.remove("overflow-hidden");
    }

});




// Search Movies
searchInput.addEventListener("input", (event) => {
    searchQuery = event.target.value;
    searchTerm = `${apiSearchUrl}&query=${searchQuery}`;
    window.scrollTo(0, 0);
    getApiData(1, searchTerm).then((searchData) => {
        if (searchData.total_results > 0) {
            pageNo = 1;
            moviesHolder.innerHTML = "";
            appendMovie(searchData, true);
            pageNo++;
        } else {
            moviesHolder.innerHTML = "";
            let noFoundText = document.createElement("h2");
            noFoundText.setAttribute("class", "text-center");
            noFoundText.style.marginTop = 10 + "px";
            noFoundText.textContent = "No Results Found";
            moviesHolder.appendChild(noFoundText);

            if (searchQuery == "") {
                moviesHolder.innerHTML = "";
                pageNo = 1;
                getApiData(pageNo, apiMoviesUrl).then((data) => {
                    appendMovie(data);
                });
            }
        }
    });

});




// Infinite Scroll
let scrolled = false;
document.addEventListener("scroll", () => {
    if (!scrolled) {
        scrolled = true;
        document.querySelector(".loader").style.display = "block";
        documentHeight = moviesHolder.scrollHeight;
        let currentScroll = window.scrollY + window.innerHeight;
        if (currentScroll - 50 > documentHeight) {

            if (searchQuery == undefined || searchQuery == "") {
                getApiData(pageNo, apiMoviesUrl).then((data) => {
                    appendMovie(data);
                });
            }
            else {
                searchTerm = `${apiSearchUrl}&query=${searchQuery}`;
                getApiData(pageNo, searchTerm).then((searchData) => {
                    appendMovie(searchData, true);
                });
            }

            setTimeout(() => {
                scrolled = false;
            }, 500);
        } else {
            scrolled = false;
            document.querySelector(".loader").style.display = "none";
        }
    }
});







// Logo Click
logo.addEventListener("click", () => {
    moviesHolder.innerHTML = "";
    pageNo = 1;
    getApiData(pageNo, apiMoviesUrl).then((data) => {
        appendMovie(data);
    });
    searchInput.value = "";
})




// First Load
window.onload = function () {
    getApiData(pageNo, apiMoviesUrl).then((data) => {
        appendMovie(data);
    });
}