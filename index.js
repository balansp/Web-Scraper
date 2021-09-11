const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');


const DEL = ';';

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
     $('h1').text() ;
    
    const reviewList= 'ul.undefined.list__373c0__vNxqp li ';

    $(reviewList).each((i, el) => {

      const userName = $(el)
        .find('.fs-block a.css-166la90')
        .text();
      const comment = $(el)
        .find('p')
        .text()
        .replace(/\s\s+/g, '');
      
      // Write Row To CSV
      writeStream.write(`${userName} ${DEL} ${comment} ${DEL} \n`);
    });

     //writeStream.write(`${name}; ${comment} \n`);
  
  };

  for(let i=0;i<=30;i+10){
    await scrape('https://www.yelp.com/biz/madhuram-fremont?start=${i}'); 
  }
  

  writeStream.close();
  await page.waitFor(1000);
  await browser.close();
})();
