url = "https://www.digikala.com/product/dkp-" + data[i].attribs['data-id'];
request(url, function(error, response, html){
    if(!error){
        var $ = cheerio.load(html);
        var tempProductData = {productId : data[i].attribs['data-id'], productName : "", CategoryName : "", BrandName: "",productImage : "", comments:[]}
        $('.c-product__title').filter(function(){
          var data = $(this);
          tempProductData.productName = data.text();
        });
        $('.product-brand-title').filter(function(){
          var data = $(this);
          tempProductData.BrandName = data.text();
        });
        $('.product-brand-title').filter(function(){
          var data = $(this);
          tempProductData.BrandName = data.text();
        });
    }
});


// $('.c-product__directory').filter(function(){
//   var data = $(this);
//   tempProductData.BrandName = data.children('ul').children('li').eq(0).children('a').text();
//   tempProductData.CategoryName = data.children('ul').children('li').eq(1).children('a').text();
// });
// $('.js-gallery-img').filter(function(){
//   var data = $(this);
//   tempProductData.productImage = data.attr('src');
// });
// $('.js-price-value').filter(function(){
//   var data = $(this);
//   tempProductData.productImage = data.text();
// });




// async function getPic(crawlerProductId) {
//   var j = 0;
//     while (j < 576) {
//       const URL = 'https://www.digikala.com/product/dkp-' + crawlerProductId[j] + '/' ;
//       puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(async browser => {
//           const page = await browser.newPage();
//           await page.setViewport({width: 320, height: 600})
//           await page.setUserAgent('Batman')
//           await page.goto(URL);
//           const result = await page.evaluate(() => {
//               try {
//                   return window.ecpd2;
//               } catch(err) {
//                   reject(err.toString());
//               }
//           });
//
//           // let's close the browser
//           await browser.close();
//           j++;
//           console.log(result);
//           process.exit();
//       }).catch(function(error) {
//           console.error(error);
//           process.exit();
//       });
//     }
// };



// const URL = 'https://www.digikala.com/product/dkp-' + data[i].attribs['data-id'] + '/' ;
// puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(async browser => {
//     const page = await browser.newPage();
//     await page.setViewport({width: 320, height: 600})
//     await page.setUserAgent('Batman')
//     await page.goto(URL);
//     const result = await page.evaluate(() => {
//         try {
//             return window.ecpd2;
//         } catch(err) {
//             reject(err.toString());
//         }
//     });
//     await browser.close();
//     console.log(result);
//     process.exit();
// }).catch(function(error) {
//     console.error(error);
//     process.exit();
// });
