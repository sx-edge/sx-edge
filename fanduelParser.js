var fs = require('fs');
//var sport = "french-open";
var sport = "nfl";
var scrapeurl = "https://sbapi.nj.sportsbook.fanduel.com/api/content-managed-page?betexRegion=GBR&capiJurisdiction=intl&currencyCode=USD&exchangeLocale=en_US&includePrices=true&includeRaceCards=false&includeSeo=true&language=en&regionCode=NAMERICA&timezone=America%2FNew_York&includeMarketBlurbs=true&_ak=FhMFpcPWXMeyZxOx&page=CUSTOM&customPageId=nfl";
var temp = "";
var inc = 0;
var finalurl = "";
var check =false;
var delay = 0;
var delayeddelay = 0;
var sellCounter = 0;
var competitionID = 0;
var fanduelOddsLoc = ""; //fanduel thing, update
var eventID = "";
var oldFirstVar = 0;
var NFLteamnames = ["Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills", "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns", "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers", "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs", "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins", "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants", "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers", "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Commanders"];

var FDteamnames = ["Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills", "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns", "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers", "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs", "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins", "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants", "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers", "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Commanders"];

var secondscrapeurl = "https://api.sx.bet/markets/active?moneyline=true&leagueId=243&type=226";
var secondOptions = 0;	
var firstOption = 0;

var firstOptionLoc = 0;
var secondOptionsLoc = 1;

var market = "0x743Bb09A2FEd4614FFEDC62dD9f5dEe3AFD79847"; //update
var conditionID = "0xe17a0a6cf7ba8037e7ff4d21aa52dad1225ceb688e5d7634581a33d470231b8a";

var FONAME = "Tigers" //update first name
var SONAME = "saf"; //update second name

var firstOptionNum = -1; //(locatioon of second odds)
var secondOptionNum = -1; //(location of first odds)

var processed = [];
var output = [];
var listofnames = [];
var listofteamtwonames = [];
var teamtwoinc = 0;
var globalinc = 0;

//checkLink2(scrapeurl);
//process_parlays();
get_parlays();

function get_parlays() {
	try{
	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	var oReq = new XMLHttpRequest();
	oReq.addEventListener("load", generate_parlays, false);

	oReq.open("GET", secondscrapeurl);
	oReq.setDisableHeaderCheck(true);
	oReq.setRequestHeader("accept", "application/json");
	//body = {"marketIds":[fanduelOddsLoc]};
	//body = JSON.stringify(body);
	oReq.send();
	}
	catch (err) {
		console.log(err);
	}
}

function get_sec_parlays(pagekey) {
	try{
	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	var oReq = new XMLHttpRequest();
	oReq.addEventListener("load", generate_parlays, false);

	oReq.open("GET", secondscrapeurl + "&paginationKey=" + pagekey);
	oReq.setDisableHeaderCheck(true);
	oReq.setRequestHeader("accept", "application/json");
	//body = {"marketIds":[fanduelOddsLoc]};
	//body = JSON.stringify(body);
	oReq.send();
	}
	catch (err) {
		console.log(err);
	}
}

function generate_parlays() {	
	//console.log("Starting");
	if (this.status != 200) 
	{	
		console.log("blocked1");
		console.log(this);
		secondOptions = 0;
		firstOption = 0;
	}
	else {
		var myData = JSON.parse(this.responseText);
		var today = new Date();
		let temptoday = + today;
		let longtemptoday = new Date((temptoday / 1000 + 220000 )*1000); //if game is within 18 hours
		let shorttemptoday = new Date((temptoday / 1000 - 19000 )*1000); 
		for (inc in myData.data.markets)
		{
			if (myData.data.markets[inc].leagueLabel == "NFL" && myData.data.markets[inc].type == 226)
			{
				let temp = new Date(myData.data.markets[inc].gameTime * 1000);
				/*if (myData.data.markets[inc].marketHash == "0xf11c18a4abbd47cf87372837d1ec3b33e3fd0be586ce6eda968704a1c5af1f83")
				{
					console.log("Todays date: " + shorttemptoday + ", game Date: " + temp);
					console.log(today < temp && longtemptoday > temp);
					console.log(today > temp && shorttemptoday < temp);
				}*/

				if ((today < temp && longtemptoday > temp) || (today > temp && shorttemptoday < temp))
				{
					listofnames.push( myData.data.markets[inc].marketHash);
					let temptemptemp = "";
					for(innerinc in NFLteamnames)
					{
						if (myData.data.markets[inc].teamOneName.includes(NFLteamnames[innerinc]))
							listofnames.push(FDteamnames[innerinc]);
						if (myData.data.markets[inc].teamTwoName.includes(NFLteamnames[innerinc]))
							listofteamtwonames.push(FDteamnames[innerinc]);
					}
					//console.log("matched" + myData.data.markets[inc].teamOneName + " " + myData.data.markets[inc].marketHash);
				}
			}
		}
		if (myData.data.nextKey == undefined)
			process_parlays();
		else
			get_sec_parlays(myData.data.nextKey);
	}
}

function process_parlays() {
	if (globalinc < listofnames.length)
	{
		if(listofnames[globalinc][0] == '0' && listofnames[globalinc][1] == 'x')
		{
			//console.log(listofnames[globalinc])
			processed.push(listofnames[globalinc]);
			globalinc++;
			process_parlays();
			return;
		}
		firstOptionNum = -1;
		FONAME = listofnames[globalinc];
		SONAME = listofteamtwonames[teamtwoinc];
		teamtwoinc++;
		checkLink2(scrapeurl);
	}
	else 
	{
		//console.log("end of list, increment");
		let processed2 = [];
		for (inc in processed)
		{
			if(processed[inc][0] == '0' && processed[inc][1] == 'x')
			{
				if(processed[parseInt(inc) + 1].length == 2 && processed[parseInt(inc) + 1][1] >= 0)
				{
					processed2.push(processed[inc]); 
					processed2.push(processed[parseInt(inc) + 1]);
				}
			}
			//console.log(processed[inc]);
		}
		console.log(JSON.stringify(processed2));
	}
}

function checkLink2(scrapeurl) {
	try{
	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	var oReq = new XMLHttpRequest();
	oReq.addEventListener("load", newlink2, false);

	oReq.open("GET", scrapeurl);
	oReq.setRequestHeader("accept", "application/json");
	//body = {"marketIds":[fanduelOddsLoc]};
	//body = JSON.stringify(body);
	oReq.send();
	}
	catch (err) {
		console.log(err);
	}
}

function newlink2() {
	//console.log("Starting");
	if (this.status != 200) 
	{
		console.log("blocked2");
		console.log(this);
		secondOptions = 0;
		firstOption = 0;
	}
	else {
		var myData = JSON.parse(this.responseText);
		var today = new Date();
		//console.log(myData);
		for (inc in myData.attachments.events)
		{
			let temp = new Date(myData.attachments.events[inc].openDate);
			//console.log(myData.attachments.events[inc].name);
			//console.log(FONAME + "...." + SONAME);
			if ((myData.attachments.events[inc].name.includes(FONAME) && myData.attachments.events[inc].name.includes(SONAME)) && (myData.attachments.events[inc].competitionId == 12282733 || myData.attachments.events[inc].competitionId == 11432305)) /*&& temp.getDate == today.getDate() && temp.getMonth == today.getMonth()*///)
			{
				let temp = myData.attachments.events[inc].name.split('@');
				//console.log(temp);
				if (temp[0].includes(FONAME))
					firstOptionNum = 0;
				else if (temp[1].includes(FONAME))
					firstOptionNum = 1;
				else if (temp[0].includes(SONAME))
					secondOptionNum = 0;
				else if (temp[1].includes(SONAME))
					secondOptionNum = 1;
				//console.log(myData.attachments.events[inc]);
				competitionID = myData.attachments.events[inc].competitionId;
				eventID = myData.attachments.events[inc].eventId;
				//console.log(competitionID);
				//console.log(eventID);
				//console.log(myData.attachments.events[inc].name);
				break;
			}
		}
		for (inc in myData.layout.coupons)
		{
			if (myData.layout.coupons[inc].competitionIds != undefined)
			if (myData.layout.coupons[inc].competitionIds[0] == competitionID)
			{
				if (myData.layout.coupons[inc]?.display?.[0]?.rows != undefined)
				for (innerinc in myData.layout.coupons[inc].display[0].rows)
				{
					if (myData.layout.coupons[inc].display[0].rows[innerinc].eventId == eventID)
					{
						if (myData.layout.coupons[inc].marketTypes[1] == 'MONEY_LINE')
						{
							fanduelOddsLoc = myData.layout.coupons[inc].display[0].rows[innerinc].marketIds[1];
							//console.log(fanduelOddsLoc);
							processed.push([fanduelOddsLoc,firstOptionNum]); 
							break;
						}
					}
				}
			}
		}
		//console.log(processed);
		globalinc++;
		process_parlays();
		//console.log(myData.attachments.events);
	}
} 
