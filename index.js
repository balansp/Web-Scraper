const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');

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
    const writeStream = fs.createWriteStream('scrapedData.csv');
    writeStream.write(`sep=;\n`);
    writeStream.write(`Name;Comments\n`);
    
    const $ = cheerio.load(await page.content(), null, false);
    return $('h1').text() ;
    
     writeStream.write(`${name}; ${comment} \n`);
    
  }

  await scrape('https://www.yelp.com/biz/madhuram-fremont'); 

  
  await page.waitFor(3000);
  await browser.close();
})();
