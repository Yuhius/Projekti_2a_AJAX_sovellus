const gameTableBody = document.querySelector("#gameTableBody");
const searchInput = document.querySelector("#searchInput");
const platformSelect = document.querySelector("#platformSelect");
const genreSelect = document.querySelector("#genreSelect");
const searchBtn = document.querySelector("#searchBtn");

async function fetchGames() {
  const platform = platformSelect.value;
  const genre = genreSelect.value;
  const searchTerm = searchInput.value.trim().toLowerCase();

  // Rakennetaan API-osoite valintojen mukaan
  let url = "https://www.freetogame.com/api/games";
  const params = [];

  if (platform && platform !== "all") {
    params.push(`platform=${platform}`);
  }
  if (genre) {
    params.push(`category=${genre}`);
  }

  if (params.length > 0) {
    url += "?" + params.join("&");
  }

  // Ilmoitetaan käyttäjälle latauksesta
  gameTableBody.innerHTML = `<tr><td colspan="5">Haetaan pelejä...</td></tr>`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Verkkovirhe: ${response.status}`);
    }
    let games = await response.json();

    // Suodatetaan vielä tekstikentän perusteella (pelin nimi)
    if (searchTerm !== "") {
      games = games.filter(game => game.title.toLowerCase().includes(searchTerm));
    }

    // Järjestetään pelit julkaisupäivän mukaan uusimmasta vanhimpaan
    games.sort((a, b) => {
      if (!a.release_date) return 1;
      if (!b.release_date) return -1;
      return new Date(b.release_date) - new Date(a.release_date);
    });

    // Otetaan 50 uusinta hakutuloksista
    const latestGames = games.slice(0, 50);

    // Tyhjennetään taulukko
    gameTableBody.innerHTML = "";

    if (latestGames.length === 0) {
      gameTableBody.innerHTML = `<tr><td colspan="5">Hakuehdoilla ei löytynyt pelejä.</td></tr>`;
      return;
    }

    // Luodaan rivit
    latestGames.forEach(game => {
      const row = document.createElement("tr");

      let formattedDate = "-";
      if (game.release_date) {
        const releaseDate = new Date(game.release_date);
        formattedDate = releaseDate.toLocaleDateString("fi-FI", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
      }

      row.innerHTML = `
        <td><img src="${game.thumbnail}" alt="${game.title}" width="100"></td>
        <td><a href="${game.game_url}" target="_blank">${game.title}</a></td>
        <td>${game.genre}</td>
        <td>${game.developer}</td>
        <td>${formattedDate}</td>
      `;

      gameTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Virhe haettaessa pelejä:", error);
    gameTableBody.innerHTML = `<tr><td colspan="5">Tietojen hakeminen epäonnistui.</td></tr>`;
  }
}

// Tapahtumankuuntelijat – haku käynnistyy napista tai valintojen muuttuessa
searchBtn.addEventListener("click", fetchGames);

// Ensihaku sivun latautuessa
fetchGames();