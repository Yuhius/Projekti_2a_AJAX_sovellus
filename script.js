const gameList = document.querySelector("#gameList");
const gameTableBody = document.querySelector("#gameTableBody");

async function fetchLatestGames() {
  try {
    const response = await fetch("https://www.freetogame.com/api/games");
    if (!response.ok) {
      throw new Error(`Verkkovirhe: ${response.status}`);
    }
    const games = await response.json();

    // Järjestetään pelit julkaisupäivän mukaan uusimmasta vanhimpaan
    games.sort((a, b) => {
      // Käsitellään tilanteet, joissa päivämäärä saattaa puuttua
      if (!a.release_date) return 1;
      if (!b.release_date) return -1;
      return new Date(b.release_date) - new Date(a.release_date);
    });

    // Otetaan järjestetystä listasta 50 ensimmäistä (uusinta) peliä
    const latestGames = games.slice(0, 50);

    // Tyhjennetään taulukko ennen uutta sisältöä
    gameTableBody.innerHTML = "";

    if (latestGames.length === 0) {
      gameTableBody.innerHTML = `<tr><td colspan="5">Ei pelijulkaisuja saatavilla.</td></tr>`;
      return;
    }

    // Luodaan rivit taulukkoon
    latestGames.forEach(game => {
      const row = document.createElement("tr");

      // Muotoillaan julkaisupäivämäärä suomalaiseen muotoon DD.MM.YYYY
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

// Kutsutaan funktiota
fetchLatestGames();