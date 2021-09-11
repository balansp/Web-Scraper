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

  let column=[];
  column.push('Restaurant Name');
  column.push('Page No');
  column.push('Name');
  column.push('Date');
  column.push('Rating');
  column.push('no of Reviews');
  column.push('no of Friends');
  column.push('no of Photos');
  column.push('Amenities');
  column.push('Comments');

  let strColumn = column.join(DEL);

  writeStream.write(`${strColumn}\n`);

  let scrape =  async  (url,pageNo) => {

    await page.goto(url, {
      waitUntil: 'networkidle0',
    });
    
    await page.click('[aria-label="Amenities and More"] button');

    
    const $ = cheerio.load(await page.content(), null, false);


    let arrAmenities=[];
    let strAmenities="";
     
   $('[aria-label="Amenities and More"] .gutter-2__373c0__1fwxZ  .arrange-unit__373c0__2u2cR.arrange-unit-fill__373c0__3cIO5.border-color--default__373c0__2s5dW').each((i, el) => {
        arrAmenities.push($(el).find('.css-1h1j0y3').text());
    });

    strAmenities = arrAmenities.join(', ')

     
    

    $('ul.undefined.list__373c0__vNxqp li').each((i, el) => {
      let scrapeDataArr =[],  cnt=0;
      let scrapeDataStr = '';

      //Hotel Name
      scrapeDataArr[cnt++] = $('h1').text() ;

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

      scrapeDataArr[cnt++] =  strAmenities;

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

  let scrapeURLList = [
    {
      url:'https://www.yelp.com/biz/madhuram-fremont',
      pages:15
    },{
      url:'https://www.yelp.com/biz/chaat-bhavan-fremont-fremont-3',
      pages:119
    },{
      url:'https://www.yelp.com/biz/ashwins-kitchen-newark',
      pages:12
    },{
      url:'https://www.yelp.com/biz/pakwan-restaurant-fremont-2',
      pages:92
    },{
      url:'https://www.yelp.com/biz/biryani-pot-newark',
      pages:47
    },{
      url:'https://www.yelp.com/biz/veg-n-chaat-cuisine-fremont-2',
      pages:42
    },{
      url:'https://www.yelp.com/biz/bombay-street-food-fremont',
      pages:5
    },{
      url:'https://www.yelp.com/biz/biryani-bowl-fremont-7',
      pages:78
    },{
      url:'https://www.yelp.com/biz/paradise-biryani-pointe-fremont',
      pages:54
    },{
      url:'https://www.yelp.com/biz/keeku-da-dhaba-fremont-2',
      pages:17
    },{
      url:'https://www.yelp.com/biz/shalimar-restaurant-fremont',
      pages:155
    },
    
  ];
  
  for(let s=0;s<scrapeURLList.length;s++){
      for(let i=0;i<=scrapeURLList[s].pages;i++){
        let url=`${scrapeURLList[s].url}?start=${i*10}`;
        console.log(url);
        await scrape(url,i+1); 
      }
  }

  writeStream.close();
  //await page.waitFor(1000);
  await browser.close();
})();

