// The base URL
const baseURL = "http://localhost:3000/films";
// Function to display first movie's details
function displayFirstMovie(movie) {
    const poster = document.getElementById('poster');
    const title = document.getElementById('title');
    const runtime = document.getElementById('runtime');
    const showtime = document.getElementById('showtime');
    const availableTickets = document.getElementById('ticket-num');
    const buyButton = document.getElementById('buy-ticket');
    const description = document.getElementById('film-info');

    poster.src = movie.poster;
    title.textContent = movie.title;
    runtime.textContent = `Runtime: ${movie.runtime} minutes`;
    showtime.textContent = `Showtime: ${movie.showtime}`;
    description.textContent = movie.description;

    const ticketAvailable = movie.capacity - movie.tickets_sold;
    availableTickets.textContent = `${ticketAvailable} remaining tickets`; 

    buyButton.setAttribute('data-movie-id', movie.id);
    buyButton.textContent = ticketAvailable > 0 ? "Buy Ticket" : "Sold Out";
    buyButton.disabled = ticketAvailable <= 0;

    buyButton.addEventListener('click', () => buyTicket(movie));
}

// Function to buy a ticket
function buyTicket(movie) {
    if (movie.tickets_sold < movie.capacity) {
        movie.tickets_sold += 1;
        updateMovieDetails(movie);
    }
}

// Function to update movie details after buying a ticket
function updateMovieDetails(movie) {
    const availableTickets = document.getElementById('ticket-num');
    const buyButton = document.getElementById('buy-ticket');

    const ticketAvailable = movie.capacity - movie.tickets_sold;
    availableTickets.textContent = `${ticketAvailable} remaining tickets`; 

    buyButton.textContent = ticketAvailable > 0 ? "Buy Ticket" : "Sold Out";
    buyButton.disabled = ticketAvailable <= 0;
}

// Function to get the first movie
function getFirstMovie() {
    fetch(`${baseURL}/1`)
    .then(response => response.json())
    .then(movie => displayFirstMovie(movie))
    .catch(error => console.log("Error fetching movie:", error));
}

// Function to render movie list 
function renderMovieList(movies) {
    const filmList = document.getElementById('films');
    filmList.innerHTML = ''; // Clear any placeholder

    movies.forEach(movie => {
        const filmItem = document.createElement('li');
        filmItem.textContent = movie.title;
        filmItem.classList.add('film', 'item');
        filmItem.addEventListener('click', () => displayFirstMovie(movie));
        
        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.marginLeft = '10px';
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering the displayFirstMovie
            deleteMovie(movie.id, filmItem);
        });

        filmItem.appendChild(deleteButton);
        filmList.appendChild(filmItem);
        if (movie.capacity - movie.tickets_sold <= 0) {
            filmItem.classList.add('sold-out');
        }
    });
}

// Function to delete a movie from the server
function deleteMovie(id, filmItem) {
    fetch(`${baseURL}/${id}`, {
        method: "DELETE"
    })
    .then(response => {
        if (response.ok) {
            console.log("Movie deleted successfully");
            filmItem.remove(); // Remove the movie item from the list
        } else {
            console.log("Error deleting movie:", response.statusText);
        }
    })
    .catch(error => console.log("Error deleting movie:", error));
}

// Function to fetch all movies and render the list
function displayMovieList() {
    fetch(baseURL)
    .then(response => response.json())
    .then(movies => renderMovieList(movies))
    .catch(error => console.log("Error fetching movies:", error));
}

// Load the first movie's details and movie list when the page loads
window.addEventListener('DOMContentLoaded', () => {
    getFirstMovie();
    displayMovieList();
});
