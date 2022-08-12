const searchBtn = document.getElementById("search-btn")
const searchInput = document.getElementById("movie-search")
const movieCards = document.getElementById("film-cards")
const emptySearch = document.getElementById("empty-search")
const seeMore = document.getElementById("see-more")
const seeMoreBtn = document.getElementById("see-more-btn")
const watchlistContainer = document.getElementById("watchlist")
const emptyWatchlist = document.getElementById("empty-watchlist")
let movieList = []
let moviesDetail = []
let html = ""
let watchlistHtml = ""
let searchPage = 0
let totalPages = 0

//add event listener for search page only, not watchlist
if (searchInput){
searchBtn.addEventListener("click", resetMovies)
searchInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault()
    searchBtn.click()
  }
})
}

//reset search info on search click (don't want to reset array in searchMovies
// as it's called for multiple page results - want to retain previous results on "See More")
function resetMovies() {
  movieList = []
  moviesDetail = []
  searchPage = 0
  totalPages = 0
  html = ""

  searchTerm = searchInput.value
  searchMovies(searchTerm)
}

async function searchMovies() {
  searchPage++
  //search API using input search term - returns basic info
  const res = await fetch(`http://www.omdbapi.com/?apikey=7fa4932a&s=${searchTerm}&page=${searchPage}&type=movie`)
  const data = await res.json()
  totalResults = data.totalResults
  totalPages = Math.ceil(totalResults / 10)

  if (data.Response === "False") {
    noResults()
  } else {
    movieList = data.Search

    searchDetail()
  }
  searchInput.value = ""
}

async function searchDetail() {
  //using imdbID's from movieList array, send new fetch for movie details
  for (let i = 0; i < movieList.length; i++) {
    const res = await fetch(`http://www.omdbapi.com/?apikey=7fa4932a&i=${movieList[i].imdbID}&type=movie`)
    const info = await res.json()

    moviesDetail.push(info)
  }
  renderMovies()
}

function noResults() {
  emptySearch.innerHTML = `<p class="empty-search-text"> Unable to find what you're looking for. Please try another search. </p>`
}

function renderMovies() {
  emptySearch.classList.add("hidden")
  emptySearch.classList.remove("empty-search")
  movieCards.innerHTML = `<h3>Total Results: ${totalResults}</h3>`

  for (let i = 0; i < moviesDetail.length; i++) {
    let posterImg = moviesDetail[i].Poster === "N/A" ? "images/NoPoster.png" : moviesDetail[i].Poster
    html += `
      <div class="film-info" id="${movieList[i].imdbID}">
        <div class="film-poster">
          <img src=${posterImg} alt="${moviesDetail[i].Title} poster" />
        </div>
        <div class="film-details">
          <div class="film-details-row">
            <h3> ${moviesDetail[i].Title}</h3>
            <img src="images/StarIcon.png" alt="star"/>
            <h4>${moviesDetail[i].imdbRating}</h4>
          </div>
          <div class="film-details-row" id="${movieList[i].imdbID}">
            <h4>${moviesDetail[i].Runtime} </h4>
            <h4>${moviesDetail[i].Genre}</h4>
            <button class="btn add-watchlist" id="add-watchlist"
            onclick="addToWatchlist(event)" add-state=${localStorage.getItem(movieList[i].imdbID) ? "remove" : "add"}>
            Watchlist</button>

          </div>
          <div class="film-details-row">
            <p> ${moviesDetail[i].Plot}</p>
          </div>
        </div>
      </div>`
  }
  movieCards.innerHTML += html

  //Let user click to see more if search results exceed 10
  let totalPages = Math.ceil(totalResults / 10)
    if (searchPage < totalPages) {
      seeMore.innerHTML = `<button id="see-more-btn" class ="btn" onclick="searchMovies()">See more</button>`
  } else {
      seeMore.innerHTML = ""
      seeMore.classList.add("hidden")}
}

// Saving movies to localStorage watchlist
function addToWatchlist(event) {
  const watchlistBtn = event.target
  const addState = watchlistBtn.getAttribute("add-state")
  const id = watchlistBtn.parentNode.getAttribute("id")
  // copy html of entire film card
  const savedFilmHtml = watchlistBtn.parentNode.parentNode.parentNode

  if (addState === "add") {
    watchlistBtn.setAttribute("add-state", "remove")
    localStorage.setItem(id, savedFilmHtml.outerHTML)
    console.log(watchlistBtn)
    console.log(savedFilmHtml)
    console.log(savedFilmHtml.outerHTML)


  } else {
    watchlistBtn.setAttribute("add-state", "add")
    localStorage.removeItem(id)
    renderWatchlist()

  }
}

function renderWatchlist(savedFilmHtml) {
  //if localstorage contains data, hide the default text & render the html
  if (localStorage.length > 0){
    emptyWatchlist.classList.add("hidden")
    emptyWatchlist.classList.remove("empty-search")
    //reset html if movie is removed from list 
    watchlistHtml = ""

    for (let index = 0; index < localStorage.length; index++) {
      watchlistHtml += localStorage.getItem(localStorage.key(index))
    }
    watchlistContainer.innerHTML = watchlistHtml
  }
}
