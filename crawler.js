const puppeteer = require("puppeteer");
const chalk = require("chalk");
const { msToMin } = require("./utils");
const url = "https://frontendmasters.com";
const SECONDES = 1000;
let stopInterval;

module.exports = async ({ user, pass, courses, id }) => {
  console.log(chalk.green("You are using frontendmaster-downloader \n"));
  console.log(chalk.green("Try the login ... \n"));
  const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox']})
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.108 Safari/537.36"
  );
  await page.goto(url + "/login");

  await page.waitFor(2 * SECONDES);

  await page.waitForSelector("#username");
  const username = await page.$("#username");
  await username.type(user);
  const password = await page.$("#password");
  
  await password.type(pass);
  const button = await page.$("button");
  await button.click();
  console.log(chalk.green(user + " logged \n"));
  console.log(chalk.green("First scrape all the links... \n"));

  await page.waitFor(30  * SECONDES);
  await page.goto(url + "/courses/" + courses);
  console.log(chalk.green(url + "/courses/" + courses));

  let links = await page.evaluate((courses) => {
    const anchors = Array.from(document.querySelectorAll(".CourseToc a"));
    return anchors
      .map(anchor => {
        return `${anchor.href}`;
      })
      .filter(text => {
        return text.split('/')[4] === courses;
      });
  }, courses);
  console.log(links);

  var videoLinks = [];
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    await page.goto(link);
    await page.waitFor(3  * SECONDES);
    let bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log(bodyHTML);
  const videoLink = await page.evaluate(()=> {
      const video = Array.from(document.querySelectorAll("video")).pop();
      console.log(video)
      return video.src;
    });
    let fileName = i;
    videoLinks.push({fileName, videoLink});
  }

  console.log(videoLinks);
  return videoLinks;
}
 
let remainTime;
function timeout(ms) {
  remainTime = ms;
  interval(ms, 1000);
  return new Promise(resolve => setTimeout(resolve, ms));
}

function interval(totalTime, intervalTime) {
  stopInterval = setInterval(loggeRemainingTime, intervalTime);
  function loggeRemainingTime() {
    remainTime = remainTime - intervalTime;
    let time = msToMin(remainTime);
    console.log(chalk.blue(time + "min remaining \n"));
  }
}
