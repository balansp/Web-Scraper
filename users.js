const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const express = require("express");
const router = express.Router();
const app = express();


 
const DEL = ';';
const DIR = './output';

let scrapeJSON ,scrapeURLList;

module.exports = {
  scraper : async function(scrapeJSON,connection) {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      height: 914,
      width: 1680
    }
  });
  const page = await browser.newPage();
  const logger = (msg) =>{
      console.log(msg);
      connection.sendUTF(msg);
  };
  logger("Loading Urls from json...");
  // scrapeJSON = await fs.readFileSync('scrapeList.json', 'utf8');
   scrapeJSON = JSON.parse(scrapeJSON);
  scrapeURLList =scrapeJSON.urls;

  console.log("URL loaded");
  let scrape = async (url, pageNo, writeStream) => {

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 0
    });

    
    const $ = cheerio.load(await page.content(), null, false);

    let arrAmenities = [];
    let strAmenities = "";

 
    strAmenities = arrAmenities.join(', ');

      $('ul.ylist.ylist-bordered.reviews > li').each((i, el) => {
            logger('Extracting review:' + (i + 1));
            let scrapeDataArr = [], cnt = 0;
            let scrapeDataStr = '';

            let firstItem = (pageNo == 1 && i == 0);


            //URL
            scrapeDataArr[cnt++] = (i == 0) ? page.url() : '';

            //Page No
             scrapeDataArr[cnt++] = pageNo;

            //User Name
            scrapeDataArr[cnt++] = (firstItem) ? $('div.user-profile_info.arrange_unit > h1').text() : '';

            //Userid
            let restURL=new URL(page.url());
            scrapeDataArr[cnt++] = (firstItem) ? restURL.origin +'/'+ restURL.searchParams.get("userid") : '';

            //No of Friends
            scrapeDataArr[cnt++] = (firstItem) ? $('ul.user-passport-stats > li.friend-count strong').text() : '';

            //	No of Reviews 
            scrapeDataArr[cnt++] = (firstItem) ? $('ul.user-passport-stats > li.review-count strong').text() : '';

             // No of Photos	
             scrapeDataArr[cnt++] = (firstItem) ? $('ul.user-passport-stats > li.photo-count strong').text() : '';

            // Restaurant Name
            scrapeDataArr[cnt++] = $(el)
              .find('.media-title span')
              .text();
              

            //Website	Address	Ph No	Ratings	Date	Comments
            scrapeDataArr[cnt++] = $(el)
            .find('.media-title a')
            .attr('href');

            //address
            scrapeDataArr[cnt++] = $(el)
              .find('address')
              .text()
              .replace(/\s\s+/g, '');

            //Ratings
            scrapeDataArr[cnt++] = $(el)
              .find('.i-stars')
              .attr('title')
              .replace(/\s\s+/g, '');

            //Date
            scrapeDataArr[cnt] = $(el).find('.review-content > .biz-rating > .rating-qualifier small').remove();
            scrapeDataArr[cnt++] = $(el)
            .find('.review-content > .biz-rating > .rating-qualifier')
            .text()
            .replace(/\s\s+/g, '');

            //Comments
            scrapeDataArr[cnt++] = $(el)
            .find('p')
            .text()
            .replace(/\s\s+/g, '');

            scrapeDataStr = scrapeDataArr.join(DEL)

            // Write Row To CSV
            writeStream.write(`${scrapeDataStr}\n`);
    });
  };
   if(scrapeURLList.length<=0) return;
  for (let s = 0; s < scrapeURLList.length; s++) {
    let strColumn = scrapeJSON.columns.join(DEL);
    if(!fs.existsSync(DIR)){
       fs.mkdirSync(DIR);
    }
    writeStream = fs.createWriteStream(`${DIR}/${scrapeURLList[s].outputCSV}`);
    writeStream.write(`sep=;\n`);
    writeStream.write(`${strColumn}\n`);

    for (let i = scrapeURLList[s].startFrom; i < scrapeURLList[s].pages; i++) {
      let url = `${scrapeURLList[s].url}&rec_pagestart=${i * 10}`;
      logger(`Opening URL:${url} [${i+1}/${scrapeURLList[s].pages}]`);
      await scrape(url, i + 1, writeStream);
    }
    writeStream.close();
    logger(`Saved @ ${DIR}/${scrapeURLList[s].outputCSV}`);
  }

  //await page.waitFor(1000);
  await browser.close();
  logger(`************************`);
  logger("All task completed!!! :)");
  logger(`************************`);
}
}

