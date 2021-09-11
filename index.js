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

  const writeStream = fs.createWriteStream('scrapedData.csv');
  writeStream.write(`sep=;\n`);
  writeStream.write(`Name;Rating;Comments\n`);

  let scrape =  async  (url) => {
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });
    
    
    const $ = cheerio.load(await page.content(), null, false);
     $('h1').text() ;
    
    const reviewList= 'ul.undefined.list__373c0__vNxqp li ';

    $(reviewList).each((i, el) => {
      let scrapeDataArr =[],  cnt=0;
      let scrapeDataStr = '';
      //UserName
       scrapeDataArr[cnt++] = $(el)
        .find('.fs-block a.css-166la90') 
        .text();

      //Ratings

      scrapeDataArr[cnt++] = $(el)
          .find('.i-stars__373c0___sZu0')
          .attr('aria-label')
          

      //Number of Review

      //Number of friends


      //Comments
      scrapeDataArr[cnt++] = $(el)
      .find('p')
      .text()
      .replace(/\s\s+/g, '');


      scrapeDataStr =  scrapeDataArr.join(DEL)

      // Write Row To CSV
      writeStream.write(`${scrapeDataStr}\n`);
    });

     //writeStream.write(`${name}; ${comment} \n`);
  
  };

  for(let i=0;i<=30;i=i+10){
    console.log(`https://www.yelp.com/biz/madhuram-fremont?start=${i}`)
    await scrape(`https://www.yelp.com/biz/madhuram-fremont?start=${i}`); 
  }
  

  writeStream.close();
  await page.waitFor(1000);
  await browser.close();
})();
