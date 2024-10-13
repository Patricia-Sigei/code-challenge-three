// Your code here
// Define the base URL for the API
const BASE_URL = 'http://localhost:3000/films';

// Function to fetch film data and give the first film details and the list
const fetchFilms = async () => {
  try {
    const response = await fetch(`${BASE_URL}`);
    const films = await response.json();
    renderFirstFilm(films[0]); 
    renderFilmList(films);     
  } catch (error) {
    console.error('Error fetching films:', error);
  }
};

// Function to render the details of the first film
const renderFirstFilm = (film) => {
  const filmDetailsContainer = document.querySelector('#film-details');
  console.log(filmDetailsContainer); 
  if (!filmDetailsContainer) {
    console.error("Film details container not found");
    return;
  }
  
  const availableTickets = film.capacity - film.tickets_sold;

  filmDetailsContainer.innerHTML = `
    <h2>${film.title}</h2>
    <img src="${film.poster}" alt="${film.title} poster">
    <p>Runtime: ${film.runtime} minutes</p>
    <p>Showtime: ${film.showtime}</p>
    <p>Available Tickets: ${availableTickets}</p>
    <button id="buy-ticket-button" ${availableTickets === 0 ? 'disabled' : ''}>
      ${availableTickets === 0 ? 'Sold Out' : 'Buy Ticket'}
    </button>
  `;
// Including eventlister to the buy ticket button
  const buyTicketButton = document.querySelector('#buy-ticket-button');
  buyTicketButton.addEventListener('click', () => buyTicket(film));
};

// Function to render the list of films
const renderFilmList = (films) => {
  const filmsList = document.querySelector('#films');
  filmsList.innerHTML = ''; // Clear the existing list

  films.forEach((film) => {
    const availableTickets = film.capacity - film.tickets_sold;
    const filmItem = document.createElement('li');
    filmItem.classList.add('film', 'item', availableTickets === 0 ? 'sold-out' : '');
    filmItem.innerHTML = `
      <span>${film.title}</span>
      <button class="delete-button" data-id="${film.id}">Delete</button>
    `;
    
    filmsList.appendChild(filmItem);

    // Add event listener for delete button
    const deleteButton = filmItem.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => deleteFilm(film.id, filmItem));
    
    // Add click event to film item to load details
    filmItem.addEventListener('click', () => renderFirstFilm(film));
  });
};

// Function to buy a ticket for a film
const buyTicket = async (film) => {
  const availableTickets = film.capacity - film.tickets_sold;

  if (availableTickets > 0) {
    const updatedTicketsSold = film.tickets_sold + 1;

    try {
      // Update the tickets sold in the database
      await fetch(`${BASE_URL}/${film.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickets_sold: updatedTicketsSold }),
      });

      // Persist the new ticket purchase
      await fetch('http://localhost:3000/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ film_id: film.id, number_of_tickets: 1 }),
      });

      // Update the film details on the front-end
      film.tickets_sold = updatedTicketsSold;
      renderFirstFilm(film);
      renderFilmList(await fetchFilms()); 
    } catch (error) {
      console.error('Error purchasing ticket:', error);
    }
  }
};

// Function to delete a film
const deleteFilm = async (filmId, filmItem) => {
  try {
    await fetch(`${BASE_URL}/${filmId}`, {
      method: 'DELETE',
    });
// Remove the film item from the list
    filmItem.remove(); 
  } catch (error) {
    console.error('Error deleting film:', error);
  }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  fetchFilms();
});
