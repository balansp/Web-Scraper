const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
      headless:false ,
      defaultViewport:{
        height:914,
        width:1680
      }
  });

  const page = await browser.newPage();

  let scrape =  async  (url) => {
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });
    const $ = cheerio.load(await page.content(), null, false);
    return $('h1').text() ;
  }

  let md = await scrape('https://www.yelp.com/biz/madhuram-fremont'); 

  await page.waitFor(3000);
  await browser.close();
})();