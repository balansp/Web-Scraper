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
    
        // $('.post-preview').each((i, el) => {
    //   const title = $(el)
    //     .find('.post-title')
    //     .text()
    //     .replace(/\s\s+/g, '');
    //   const link = $(el)
    //     .find('a')
    //     .attr('href');
    //   const date = $(el)
    //     .find('.post-date')
    //     .text()
    //     .replace(/,/, '');

    //   // Write Row To CSV
    //   writeStream.write(`${title}, ${link}, ${date} \n`);
    // });
    
     writeStream.write(`${name}; ${comment} \n`);
    
  }

  await scrape('https://www.yelp.com/biz/madhuram-fremont'); 

  
  await page.waitFor(3000);
  await browser.close();
})();
