const fs = require("fs");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");

// exports.handler = async (event) => {
const handler = async (event) => {
  let url = "";
  // console.log({ event });
  let argumentName = process.env.url
  console.log({ argumentName });
  // let argumentName = event.url;

  if (argumentName) {
    // let args = argumentName.split("=");
    // if (args && args[0] === "--url") {
    //   if (args[1].startsWith("http://") || args[1].startsWith("https://")) {
    //     url = args[1];
    //   } else {
    //     url = "https://" + args[1];
    //   }
    // }

    if (
      argumentName.startsWith("http://") ||
      argumentName.startsWith("https://")
    ) {
      url = argumentName;
    } else {
      url = "https://" + argumentName;
    }
  }

  if (!url) {
    console.log("No URL provided");
    return;
  }

  let currentTime = Date.now();

  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

  const jsonOption = {
    logLevel: "info",
    output: "json",
    onlyCategories: ["performance"],
    port: chrome.port,
  };

  const htmlOption = {
    logLevel: "info",
    output: "html",
    onlyCategories: ["performance"],
    port: chrome.port,
  };

  const runnerResultHtml = await lighthouse(url, htmlOption);
  const runnerResultJson = await lighthouse(url, jsonOption);

  const reportHtml = runnerResultHtml.report;
  const reportJson = runnerResultJson.report;
  fs.writeFileSync(`./artifacts/lnreport_${currentTime}.html`, reportHtml);
  fs.writeFileSync(`./artifacts/lnreport_${currentTime}.json`, reportJson);

  // `.lhr` is the Lighthouse Result as a JS object
  console.log("Report is done for", runnerResultHtml.lhr.finalUrl);
  console.log(
    "Performance score was",
    runnerResultHtml.lhr.categories.performance.score * 100
  );

  await chrome.kill();
  return;
};

// handler({
//   url: "duckduckgo.com",
// });
handler();
