const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const DEL = ';';

let url = `https://www.imdb.com/search/title/?countries=in&languages=ml&count=250`;
         //https://www.imdb.com/search/title/?countries=in&languages=ml&count=250


function getStars($,elm){
  return  $(elm).find('.ratings-bar + .text-muted + p').text().trim().replace(/\n/g, '') || $(elm).find('.lister-item-header + p + p + p').text().trim().replace(/\n/g, '') ; 
}

function getDescription($,elm){
  return  $(elm).find('.ratings-bar + p.text-muted').text().trim().replace(/\n/g, '') || $(elm).find('.lister-item-header + p + p').text().trim().replace(/\n/g, '') ; 
}
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
    defaultViewport: {
      height: 914,
      width: 1680
    }
  });
  
  const page = await browser.newPage();
  console.log('Opening url',url)
  await page.goto(url, {
    waitUntil: 'networkidle0',
    timeout: 0
  });
  console.log('Page Loaded!!!');
  const writeStream = fs.createWriteStream('imdb.csv');
  writeStream.write(`sep=${DEL}\n`);
  
  const $ = cheerio.load(await page.content(), null, false);

  let $looper = $('.lister-item') // h3  a
  let legend=['','Name','Year','Rating','Votes','Director & Stars','Description'];
  let dataArr=[''],dataStr='';

  $looper.each((i, elm) =>{
    dataArr.push(  $(elm).find('h3 a').text().trim() ); //Movie Name
    dataArr.push(  $(elm).find('.lister-item-year').text().trim().replace(/[()]/g,'') ); //Year
    dataArr.push(  $(elm).find('.ratings-imdb-rating').text().trim() ); //Rating
    dataArr.push(  $(elm).find('.sort-num_votes-visible > span + span[name="nv"]').text().trim() ); //Votes 
    dataArr.push(  getStars($,elm)); //Director & Stars
    dataArr.push(  getDescription($,elm) ); //Description
    dataArr.push('\n'); 
  });
  
  dataStr = legend.join(DEL) + '\n'; 
  dataStr =  dataStr + dataArr.join(DEL);
 
writeStream.write(dataStr)
  console.log('Done') 
})();
