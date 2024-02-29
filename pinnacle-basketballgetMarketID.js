const fetch = require('node-fetch');

// Define constants for API URLs and headers
const pinnacleApiUrl = "https://pinnacle-odds.p.rapidapi.com/kit/v1/markets?sport_id=3&is_have_odds=true";
const sportXApiUrl = "https://api.sx.bet/markets/active?onlyMainLine=true&sportIds=1&type=226";

// Pinnacle API headers
const pinnacleApiHeaders = {
    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY_HERE',
    'X-RapidAPI-Host': 'pinnacle-odds.p.rapidapi.com'
};

// Fetches data from SportX API
async function fetchSportXData() {
    try {
        const response = await fetch(sportXApiUrl, { headers: { 'Accept': 'application/json' } });
        if (response.ok) {
            const data = await response.json();
            processSportXData(data);
        } else {
            console.error('Failed to fetch from SportX:', response.status);
        }
    } catch (error) {
        console.error('Error fetching SportX data:', error);
    }
}

// Processes data received from SportX and fetches data from Pinnacle
function processSportXData(data) {
    const matchups = data.data.markets.map(market => ({
        marketHash: market.marketHash,
        teamOneName: market.teamOneName,
        teamTwoName: market.teamTwoName,
        sportXeventId: market.sportXeventId
    }));

    // Optionally handle pagination with data.data.nextKey if needed
    fetchPinnacleData(matchups);
}

// Fetches data from Pinnacle API
async function fetchPinnacleData(matchups) {
    try {
        const response = await fetch(pinnacleApiUrl, { method: 'GET', headers: pinnacleApiHeaders });
        if (response.ok) {
            const data = await response.json();
            matchPinnacleData(data.events, matchups);
        } else {
            console.error('Failed to fetch from Pinnacle:', response.status);
        }
    } catch (error) {
        console.error('Error fetching Pinnacle data:', error);
    }
}

// Matches Pinnacle data with SportX matchups
function matchPinnacleData(pinnacleEvents, matchups) {
    pinnacleEvents.forEach(event => {
        matchups.forEach(matchup => {
            if (event.event_type === "prematch" && event.home === matchup.teamOneName && event.away === matchup.teamTwoName) {
                matchup.pinnacleOdds = {
                    home: event.periods.num_0.money_line.home,
                    away: event.periods.num_0.money_line.away
                };
                matchup.pinnacleEventId = event.event_id;
            }
        });
    });
    console.log(JSON.stringify(matchups));
}

// Starts the process
fetchSportXData();
