import { spawn } from 'child_process';
import * as fs from 'fs';
import { newSportX, Environments } from "@sportx-bet/sportx-js";

async function initializeSportX() {
  try {
    return await newSportX(
      Environments.SxMainnet,
      "https://rpc.sx.technology/",
      "wallet secure variable"
    );
  } catch (error) {
    console.error("Failed to initialize SportX:", error);
    process.exit(1);
  }
}

const sportX = await initializeSportX();
let masterArray = [];

async function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const process = spawn('node', [scriptName]);
    let dataString = '';

    process.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(JSON.parse(dataString));
      } else {
        reject(new Error(`${scriptName} failed to run successfully.`));
      }
    });
  });
}

async function orchestration() {
  const scripts = [
    "pinnacle-basketballgetMarketID.js",
    "pinnacle-basketballSPREADgetMarketID.js",
  ];

  try {
    for (const script of scripts) {
      const data = await runScript(script);
      masterArray = masterArray.concat(data);
    }
    processMasterArray();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

function processMasterArray() {
  if (masterArray.length === 0) {
    console.error("Master array is empty.");
    process.exit(1);
  }

  masterArray = masterArray.filter(subArray => subArray.length === 7);
  verifyMasterArray(0);
}

async function verifyMasterArray(index) {
  if (index >= masterArray.length) {
    finalizeAndWriteResults();
    return;
  }

  const marketData = masterArray[index];
  try {
    const orders = await sportX.getOrders([marketData[0]]);
    processOrdersForMarket(marketData, orders);
    verifyMasterArray(index + 1);
  } catch (error) {
    console.error(`Failed to get orders for market ${marketData[0]}:`, error);
    verifyMasterArray(index + 1);
  }
}

function processOrdersForMarket(marketData, orders) {
  // Implement the logic to process each market's orders.
  // This can be adjusted based on the specific requirements for order processing.
  // For example, update `marketData` based on orders, calculate odds, etc.
}

function finalizeAndWriteResults() {
  const processedData = {
    detailed_markets: masterArray,
    // Further processing based on masterArray and potentially other data
  };

  const dataString = JSON.stringify(processedData, null, 4);
  fs.writeFile("data.json", dataString, (err) => {
    if (err) {
      console.error("Failed to write data.json:", err);
      process.exit(1);
    } else {
      console.log('Data processing complete, file saved as data.json');
      process.exit(0);
    }
  });
}

orchestration();
