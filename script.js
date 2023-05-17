
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
        if (pageNo) {
            data = await fetch(`${apiUrl}&page=${pageNo}`).then((response) => { return response.json() });
        } else {
            data = await fetch(apiUrl).then((response) => { return response.json() });
        }
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
            let modWatchlistBtn = movieModal.querySelector(".mod-watchlist-btn");
            movieGenre.innerHTML = "";
            movieStars.innerHTML = "";
            let imgUrl = movie.poster_path ? `http://image.tmdb.org/t/p/w500/${movie.poster_path}` : "";;
            movieImg.setAttribute('src', imgUrl);
            movieName.textContent = movie.title || movie.name;
            movieDesc.textContent = movie.overview;
            movieRlsDate.innerHTML = `<span class="rls-head">Release Date:</span> ${movie.release_date || movie.first_air_date}`;
            modWatchlistBtn.setAttribute("onClick", `addMovieWatchlist(${movie.id}, "${movie.media_type}")`);
            modWatchlistBtn.textContent = "Add to Watchlist";
            modWatchlistBtn.style.backgroundColor = "#573184";

            if (getList) {
                getList.forEach((item) => {
                    if (item.id == movie.id && item.deleted == false) {
                        modWatchlistBtn.textContent = "Remove from Watchlist";
                        modWatchlistBtn.setAttribute("onClick", `delMovie(${movie.id})`);
                        modWatchlistBtn.style.backgroundColor = "rgb(227, 66, 30)";
                    }
                });
            }



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
    if (evt.target.parentElement == crossModal || evt.target == overlay) {
        movieModal.style.display = "none";
        overlay.style.display = "none";
        document.body.classList.remove("overflow-hidden");
        watchlistModal.style.display = "none";
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






// Watchlist

// intial watchlist
let watchlist = [
    {
        id: 868759,
        watched: false,
        deleted: false,
        type: "movie"
    },
    {
        id: 804150,
        watched: true,
        deleted: false,
        type: "movie"
    },
    {
        id: 76331,
        watched: false,
        deleted: false,
        type: "tv"
    }
];


// Temprary Datas
let getApiUrl;
let findType;
let delBtn;
let getList;


// DOM Elements
let watchlistBtn = document.querySelector(".watchlist");
let watchlistBox = document.querySelector(".movie-list .row");
let watchlistModal = document.querySelector(".watchlist-box");



// Save watchlist to local storage 
getList = localStorage.getItem("watchlist") ? JSON.parse(localStorage.getItem("watchlist")) : localStorage.setItem("watchlist", JSON.stringify(watchlist));


// Watchlist Button Action
watchlistBtn.addEventListener("click", () => {

    watchlistModal.style.display = "block";
    overlay.style.display = "block";
    document.body.classList.add("overflow-hidden");
    crossModal = watchlistModal.querySelector(".cross");

    appendWatchList();

});


// Delete Movie from Waatchlist
const delMovie = (id) => {
    let modWatchlistBtn = movieModal.querySelector(".mod-watchlist-btn");
    getList.forEach((item) => {
        if (item.id == id) {
            item.deleted = true;
            modWatchlistBtn.setAttribute("onClick", `addMovieWatchlist(${item.id}, "${item.type}")`);
            modWatchlistBtn.textContent = "Add to Watchlist";
            modWatchlistBtn.style.backgroundColor = "#573184";
        }
    });

    localStorage.setItem("watchlist", JSON.stringify(getList));
    appendWatchList();
}

// Watchlist Watch Status change
const getWatchValue = (id) => {
    getList.forEach((item)=>{
        if(item.id == id){
            item.watched = true;
        }
    });
}


// Add Movies to Watchlist
const addMovieWatchlist = (id, type) => {

    let alreadyThere = false;
    let modWatchlistBtn = movieModal.querySelector(".mod-watchlist-btn");

    getList.forEach((item) => {
        if (item.id == id) {
            item.deleted = false;
            alreadyThere = true;
            return;
        }
    });
    
    if (!alreadyThere) {
        if (type == "movie") {
            findType = "movie";
        } else {
            findType = "tv";
        }

        if (id && type) {
            let getApiUrl = `https://api.themoviedb.org/3/${findType}/${id}?api_key=${apiKey}&language=en-US`;

            getApiData(undefined, getApiUrl).then((data) => {
                let watchlistMovie = {
                    id: data.id,
                    watched: false,
                    deleted: false,
                    type: findType
                }
                getList = [...getList, watchlistMovie];
                localStorage.setItem("watchlist", JSON.stringify(getList));
            });
        }
    }
    
    
    localStorage.setItem("watchlist", JSON.stringify(getList));
    modWatchlistBtn.textContent = "Remove from Watchlist";
    modWatchlistBtn.setAttribute("onClick", `delMovie(${id})`);
    modWatchlistBtn.style.backgroundColor = "rgb(227, 66, 30)";
    
}



// Append Watchlist Movies
const appendWatchList = () => {
    watchlistBox.innerHTML = "Add Movies to Watchlist";

    getList.forEach((item) => {
        if (item.type == "movie") {
            findType = "movie";
        } else {
            findType = "tv";
        }
        if (!item.deleted) {
            let getApiUrl = `https://api.themoviedb.org/3/${findType}/${item.id}?api_key=${apiKey}&language=en-US`;

            watchlistBox.innerHTML = "";

            getApiData(undefined, getApiUrl).then((data) => {
                let colDiv = document.createElement("div");
                colDiv.setAttribute("class", "col-lg-2 col-md-3 col-sm-4 col-6");
                watchlistBox.appendChild(colDiv);
                colDiv.innerHTML = `
                <div class="watch-movie">
                <div class="w-movie-det">
                <div class="w-movie-img">
                            <img src="http://image.tmdb.org/t/p/w500/${data.poster_path}" alt="">
                        </div>
                        <div class="w-movie-name">
                            <div class="w-head">${data.title || data.name}</div>
                        </div>
                    </div>
                    <div class="w-movie-btns">
                        <select class="form-select" aria-label="Default select example" onChange=getWatchValue(${item.id})>
                            <option ${item.watched ? "" : "selected"}>Unwatched</option>
                            <option ${item.watched ? "selected" : ""}>Watched</option>
                        </select>
                        <div class="delete-btn" onClick=delMovie(${item.id})>
                            <i class="fa-solid fa-trash"></i>
                        </div>
                    </div>
                </div>
            `;
            });
        }
    });
}