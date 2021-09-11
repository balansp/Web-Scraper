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

  await page.goto('https://www.yelp.com/biz/madhuram-fremont', {
    waitUntil: 'networkidle0',
  });

  
  // await page.evaluate(() => {
  //   document.querySelector('.pagination__373c0__2LZaJ').scrollIntoView();
  // });

 
  const content = await page.content();
  //console.log(content);
  const $ = cheerio.load(content);
  console.log($.html());


// //  const selector = '.hide-below-b__373c0__3e53i.css-7vz7be';
//   await page.waitForSelector('.pagination-link-component__373c0__37Woa.css-166la90');
//   await page.click('.pagination-link-component__373c0__37Woa.css-166la90');




await page.waitFor(3000);

 await browser.close();
})();