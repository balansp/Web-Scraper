const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');

const DEL = ';';
const DIR = './output';
const scrapeURLList = [
  {
    url:'https://www.yelp.com/biz/madhuram-fremont',
    pages:15,
    startFrom:0
  }/*,{
    url:'https://www.yelp.com/biz/bombay-street-food-fremont',
    pages:5,
    startFrom:0
  },{
    url:'https://www.yelp.com/biz/ashwins-kitchen-newark',
    pages:12,
    startFrom:0
  },{
    url:'https://www.yelp.com/biz/keeku-da-dhaba-fremont-2',
    pages:17,
    startFrom:0
  },,{
    url:'https://www.yelp.com/biz/veg-n-chaat-cuisine-fremont-2',
    pages:42,
    startFrom:0
  },{
    url:'https://www.yelp.com/biz/biryani-pot-newark',
    pages:47,
    startFrom:0
  },{
    url:'https://www.yelp.com/biz/paradise-biryani-pointe-fremont',
    pages:54,
    startFrom:0
  },{
    url:'https://www.yelp.com/biz/biryani-bowl-fremont-7',
    pages:78,
    startFrom:0
  },{
    url:'https://www.yelp.com/biz/pakwan-restaurant-fremont-2',
    pages:92,
    startFrom:0
  },{
    url:'https://www.yelp.com/biz/chaat-bhavan-fremont-fremont-3',
    pages:119,
    startFrom:0
  },{
    url:'https://www.yelp.com/biz/shalimar-restaurant-fremont',
    pages:155,
    startFrom:0
  }*/
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      height: 914,
      width: 1680
    }
  });
  const page = await browser.newPage();

  let scrape = async (url, pageNo, writeStream) => {

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 0
    });

    await page.waitForSelector('[aria-label="Amenities and More"] button');
    await page.click('[aria-label="Amenities and More"] button');

    const $ = cheerio.load(await page.content(), null, false);

    let arrAmenities = [];
    let strAmenities = "";

    $('[aria-label="Amenities and More"] .gutter-2__373c0__1fwxZ  .arrange-unit__373c0__2u2cR.arrange-unit-fill__373c0__3cIO5.border-color--default__373c0__2s5dW').each((i, el) => {
      arrAmenities.push($(el).find('.css-1h1j0y3').text());
    });

    strAmenities = arrAmenities.join(', ');

      $('ul.undefined.list__373c0__vNxqp li').each((i, el) => {
            console.log('Extracting review:' + (i + 1));
            let scrapeDataArr = [], cnt = 0;
            let scrapeDataStr = '';

            let firstItem = (pageNo == 1 && i == 0)
            //URL
            scrapeDataArr[cnt++] = (i == 0) ? page.url() : '';

            //Hotel Name
            scrapeDataArr[cnt++] = (firstItem) ? $('h1').text() : '';

            //Address
            scrapeDataArr[cnt++] = (firstItem) ? $('address').text() : '';

            //Amenities
            scrapeDataArr[cnt++] = (firstItem) ? strAmenities : '';

            //Page No
            scrapeDataArr[cnt++] = pageNo;

            //UserName
            scrapeDataArr[cnt++] = $(el)
              .find('.fs-block a.css-166la90')
              .text();

            //Date
            scrapeDataArr[cnt++] = $(el)
              .find('.gutter-1__373c0__3zF2l .css-e81eai')
              .text();

            //Ratings
            scrapeDataArr[cnt++] = $(el)
              .find('.i-stars__373c0___sZu0')
              .attr('aria-label')

            //Number of Review
            scrapeDataArr[cnt++] = $(el)
              .find('.user-passport-stats__373c0__2nBtY [aria-label="Reviews"] .css-1dgkz3l')
              .text()

            //Number of Friends 
            scrapeDataArr[cnt++] = $(el)
              .find('.user-passport-stats__373c0__2nBtY [aria-label="Friends"] .css-1dgkz3l')
              .text()

            //Number of Photos 
            scrapeDataArr[cnt++] = $(el)
              .find('.user-passport-stats__373c0__2nBtY [aria-label="Photos"] .css-1dgkz3l')
              .text()

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

  for (let s = 0; s < scrapeURLList.length; s++) {
    let str = scrapeURLList[s].url;
    let hotelName = str.substr(str.lastIndexOf("/") + 1, str.length);
    let dir = './output';
    if(!fs.existsSync(dir)){
       fs.mkdirSync(dir);
    }
    let writeStream = fs.createWriteStream(`${dir}/${hotelName}.csv`);
    writeStream.write(`sep=;\n`);

    let column = [];
    column.push('URL')
    column.push('Restaurant Name');
    column.push('Address');
    column.push('Amenities');
    column.push('Page No');
    column.push('User Name');
    column.push('Date');
    column.push('Rating');
    column.push('No of Reviews');
    column.push('No of Friends');
    column.push('No of Photos');
    column.push('Comments');

    let strColumn = column.join(DEL);
    if(!fs.existsSync(DIR)){
       fs.mkdirSync(DIR);
    }
    writeStream = fs.createWriteStream(`${DIR}/${hotelName}.csv`);
    writeStream.write(`${strColumn}\n`);

    for (let i = scrapeURLList[s].startFrom; i < scrapeURLList[s].pages; i++) {
      let url = `${scrapeURLList[s].url}?start=${i * 10}`;
      console.log(`Opening URL:${url} [${i+1}/${scrapeURLList[s].pages}]`);
      await scrape(url, i + 1, writeStream);
    }
    writeStream.close();
  }

  //await page.waitFor(1000);
  await browser.close();
  console.log(`***************`);
  console.log("Completed!!! :)");
  console.log(`***************`);
})();
