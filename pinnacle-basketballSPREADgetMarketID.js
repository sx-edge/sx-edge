const fetch = require('node-fetch');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Constants for API endpoints and keys
const PINNACLE_API_URL = "https://pinnacle-odds.p.rapidapi.com/kit/v1/markets?sport_id=3&is_have_odds=true";
const SPORTX_API_URL = "https://api.sx.bet/markets/active?moneyline=true&sportIds=1&type=342";
const RAPIDAPI_KEY = "YOUR_RAPIDAPI_KEY"; // Replace with your actual RapidAPI key

// Function to fetch and process sports betting data from SportX API
function fetchSportXData() {
    var request = new XMLHttpRequest();
    request.onload = () => processSportXData(request);
    request.onerror = (err) => console.error("Request failed:", err);
    request.open("GET", SPORTX_API_URL);
    request.setRequestHeader("accept", "application/json");
    request.send();
}

// Process response from SportX API and fetch additional data from Pinnacle API
function processSportXData(request) {
    if (request.status !== 200) {
        console.error("Failed to fetch data from SportX API:", request.status);
        return;
    }
    const data = JSON.parse(request.responseText);
    const matchups = extractMatchupsFromSportX(data);
    fetchPinnacleData(matchups);
}

// Extract matchups from SportX response
function extractMatchupsFromSportX(data) {
    return data.data.markets.filter((market) => market.type === 342 && new Date() < new Date(market.gameTime * 1000))
        .map((market) => ({
            marketHash: market.marketHash,
            teamOneName: market.teamOneName,
            teamTwoName: market.teamTwoName,
            sportXeventId: market.sportXeventId,
            line: market.line
        }));
}

// Fetch data from Pinnacle API
async function fetchPinnacleData(matchups) {
    try {
        const response = await fetch(PINNACLE_API_URL, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'pinnacle-odds.p.rapidapi.com'
            }
        });
        const data = await response.json();
        const pinnacleEvents = data.events;
        addPinnacleDataToMatchups(matchups, pinnacleEvents);
    } catch (error) {
        console.error("Error fetching data from Pinnacle API:", error);
    }
}

// Add Pinnacle data to SportX matchups
function addPinnacleDataToMatchups(matchups, pinnacleEvents) {
    matchups.forEach(matchup => {
        const event = pinnacleEvents.find(event => event.event_type === "prematch" && event.home === matchup.teamOneName && event.away === matchup.teamTwoName);
        if (event) {
            addOddsToMatchup(matchup, event);
        }
    });
    console.log(JSON.stringify(matchups));
}

// Add odds to a specific matchup based on Pinnacle data
function addOddsToMatchup(matchup, event) {
    const spreads = event.periods.num_0.spreads;
    const matchingSpread = spreads.find(spread => spread.hdp === matchup.line);
    if (matchingSpread) {
        matchup.odds = {
            home: matchingSpread.home,
            away: matchingSpread.away
        };
        matchup.pinnacleEventId = event.event_id;
        adjustTeamNamesBasedOnLine(matchup);
    }
}

// Adjust team names based on the betting line
function adjustTeamNamesBasedOnLine(matchup) {
    const newLine = parseFloat(matchup.line) * -1;
    if (newLine < 0) {
        matchup.teamOneName += " +" + matchup.line;
        matchup.teamTwoName += " " + newLine;
    } else {
        matchup.teamOneName += " " + matchup.line;
        matchup.teamTwoName += " +" + newLine;
    }
    delete matchup.line; // Remove line from matchup object
}

// Start the process
fetchSportXData();
