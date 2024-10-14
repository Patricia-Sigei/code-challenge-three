// The base URL
const baseURL = "http://localhost:3000/films";

// Function to display the first movie's details
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

    buyButton.onclick = () => buyTicket(movie); // Use onclick instead of addEventListener to avoid multiple listeners
}

// Function to buy a ticket
async function buyTicket(movie) {
    if (movie.tickets_sold < movie.capacity) {
        try {
            // Increment the tickets sold locally
            movie.tickets_sold += 1;

            // Update the movie on the server
            await updateMovieOnServer(movie);
            
            // Update the movie details on the UI
            updateMovieDetails(movie);
        } catch (error) {
            console.error('Error buying ticket:', error);
        }
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

// Function to update the movie on the server
async function updateMovieOnServer(movie) {
    const response = await fetch(`${baseURL}/${movie.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickets_sold: movie.tickets_sold })
    });

    if (!response.ok) {
        throw new Error('Failed to update movie on the server');
    }
}

// Function to get the first movie
async function getFirstMovie() {
    try {
        const response = await fetch(`${baseURL}/1`);
        const movie = await response.json();
        displayFirstMovie(movie);
    } catch (error) {
        console.log("Error fetching movie:", error);
    }
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
            event.stopPropagation(); 
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
async function deleteMovie(id, filmItem) {
    try {
        const response = await fetch(`${baseURL}/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            console.log("Movie deleted successfully");
            filmItem.remove(); // Remove the movie item from the list
        } else {
            console.log("Error deleting movie:", response.statusText);
        }
    } catch (error) {
        console.log("Error deleting movie:", error);
    }
}

// Function to fetch all movies and render the list
async function displayMovieList() {
    try {
        const response = await fetch(baseURL);
        const movies = await response.json();
        renderMovieList(movies);
    } catch (error) {
        console.log("Error fetching movies:", error);
    }
}

// Load the first movie's details and movie list when the page loads
window.addEventListener('DOMContentLoaded', () => {
    getFirstMovie();
    displayMovieList();
});
