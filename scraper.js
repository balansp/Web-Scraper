
const SCRPJSON={
  "urlLoop": [
    {
      "name": "google",
      "url": "http://www.google.com/${0}&${1}",
      "urlParameters": [
        {
          "name": "cnt",
          "start": 0,
          "end": 100
        },
        {
          "name": "cnt2",
          "start": 0,
          "end": 100
        }
      ]
    }
  ],
  "urlList":{
    "name": "madhuram",
    "list":[
      "https://www.yelp.com/biz/madhuram-fremont",
      "https://www.yelp.com/biz/madhuram-fremont?start=10",
      "https://www.yelp.com/biz/madhuram-fremont?start=20"
    ]},
  "selectors": [
    {
      "name": "Heading",
      "selector": "h1",
      "type":"text",
      "multiple": false,
    },
    {
      "name": "address",
      "selector": "address",
      "type":"text",
      "multiple": false,
    },
    {
      "name":"Reviews",
      "selector": "ul.undefined.list__373c0__vNxqp li",
      "type":"loop",
      "multiple": false,
      "childSelectors":[
        {
          "name": "User Name",
          "selector": ".fs-block a.css-166la90",
          "type":"text",
          "multiple": true
        },
        {
          "name": "Rating",
          "selector": ".i-stars__373c0___sZu0",
          "type":"attribute",
          "attribute":"aria-label",
          "multiple": false
        }
      ]
    }
   
  ]
}




const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { start } = require('repl');

const DEL = ';';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      height: 914,
      width: 1680
    }
  });
  const page = await browser.newPage();
  
  let scrape = async (url, scrapeDataArr,writeStream) => {
     

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 0
    });

    const $ = cheerio.load(await page.content(), null, false);

    let extractData = (selector)=>{
      scrapeDataArr[selector.name]=scrapeDataArr[selector.name] || [];
      if(selector.type =='text'){
        scrapeDataArr[selector.name].push($(selector.selector).text());
       }
    }
   
    
    let entries=0;
    SCRPJSON.selectors.forEach((selector)=>{
      extractData(selector);
      
       if(selector.type=='loop'){
         $(selector.childSelectors).each((i, sel) => {
           extractData(sel)
            
         });
       }
     
       
    });
    
  };
  
  const writeStream = fs.createWriteStream(SCRPJSON.urlList.name + '.csv');
  writeStream.write(`sep=${DEL}\n`);
  const columns=SCRPJSON.selectors.map((col) => col.name);
  writeStream.write(`${columns}\n`);
  let scrapeDataArr=[];
  for (const url of SCRPJSON.urlList.list) {
    console.log(`Opening ${url}`);
    await scrape(url,scrapeDataArr,writeStream);
  }
  console.log(scrapeDataArr)
  await browser.close();
  console.log(`*********\nCompleted!!!\n*********`);

})();