
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const puppeteer = require('puppeteer');
var MongoClient = require('mongodb').MongoClient;
var createUrl = "mongodb://WFrMDNn:qogIsyi6o1TgszD@h3.2kloud.ir:27018/test?authMechanism=DEFAULT&authSource=admin";
var mongoURL = "mongodb://WFrMDNn:qogIsyi6o1TgszD@h3.2kloud.ir:27018/digicrawler?authMechanism=DEFAULT&authSource=admin";
const async = require("async");


var categoryPages = ['/category-cell-phone-pouch-cover/',
                    '/category-beauty/','/category-car-accessory-parts/',
                    '/category-mens-apparel/','/category-video-audio-entertainment/',
                  '/book-and-media/publication/','/category-health-and-bathroom-tools/',
                  '/category-travel-accessories/'];

// var categoryPages = ['/category-travel-accessories/'];
var pageNumberQuryString = "?pageno=2&sortby=4";

String.prototype.toEnglishDigits = function () {
    return this.replace(/[۰-۹]/g, function (w) {
        var persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return persian.indexOf(w);
    });
};

String.prototype.toInt = function () {
    return parseInt(this);
};

function CommenterExtractor(comment){
  return comment.substring(5).substring(comment.indexOf('در') - 6 , 0 );
}


var crawlerProductId = [];


var q = async.queue(function(task, callback) {
    crawlerProductPage(task);
    callback();
}, 3);

// assign a callback
q.drain = function() {
    console.log('all items have been processed');
};


var p = async.queue(function(task, callback) {
    crawlerComments(task);
    callback();
}, 3);

// assign a callback
p.drain = function() {
    console.log('all items have been processed');
};



var pointer = 0;


function digiCrawler(){
  for (var i = 0; i < categoryPages.length; i++) {
    url = "https://www.digikala.com/search" + categoryPages[i];
    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            $('.c-product-box').filter(function(){
              var data = $(this);
              for (var m = 0; m < data.length; m++) {
                var dkp = data[m].attribs['data-id'];
                crawlerProductId.push(data[m].attribs['data-id']);

                if(crawlerProductId.length == 288){
                  break;
                }
                else {
                  q.push(dkp, function(err) {
                      console.log("pushing : " + dkp);
                  });
                  console.log(crawlerProductId.length);
                }
              }
            });
        }
    });
    url = "https://www.digikala.com/search" + categoryPages[i]+ pageNumberQuryString;
    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            $('.c-product-box').filter(function(){
              var data = $(this);
              for (var k = 0; k < data.length; k++) {
                var dkp = data[k].attribs['data-id'];
                crawlerProductId.push(data[k].attribs['data-id']);
                if(crawlerProductId.length == 576){
                  break;
                }
                else {
                  q.push(dkp, function(err) {
                      console.log("pushing : " + dkp);
                  });
                  console.log(crawlerProductId.length);
                }
              }
            });
        }
    });
  }
}

// function productCrawler(dkp){
//   crawlerProductPage(dkp);
//   crawlerComments(dkp);
// }

function crawlerProductPage(dkp){
    var url = "https://www.digikala.com/product/dkp-" + dkp;
    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            var tempProductData = {productId : dkp, supplyCategory : 8, productName : "", categoryName : "", brandName: "",productImage : "", price : ""}
            $('.c-product').filter(function(){
              var data = $(this);
              tempProductData.productName = data.children('.c-product__info').children('.c-product__headline').children('.c-product__title').text().trim();
              tempProductData.productImage = data.children('.c-product__gallery').children('.c-gallery').children('.c-gallery__item').children('.c-gallery__img').children('.js-gallery-img').attr('data-src');
              tempProductData.brandName = data.children('.c-product__info').children('.c-product__attributes').children('.c-product__config').children('.c-product__directory').children('ul').children('li').eq(0).children().eq(1).text();
              tempProductData.categoryName = data.children('.c-product__info').children('.c-product__attributes').children('.c-product__config').children('.c-product__directory').children('ul').children('li').eq(1).children().eq(1).text();
              tempProductData.price = data.children('.c-product__info').children('.c-product__attributes').children('.c-product__config').children('.c-price').children('.c-price__value').children('.js-price-value').text().trim().replace(/,/i, '').replace(/,/i, '').toEnglishDigits().toInt();
              insertMongo(tempProductData);
              p.push(dkp, function(err) {
                  console.log("pushing : " + dkp);
              });
            });
        }
    });
}

function crawlerComments(dkp){
  var url = "https://www.digikala.com/ajax/product/comments/" + dkp;
  request(url, function(error, response, html){
      if(!error){
          var $ = cheerio.load(html);
          var comments = [];
          var count = 0;
          $('ul.c-comments__list > li > section > div.article').filter(function(){
            var data = $(this);
            var comment = {
              commentId : ++count,
              commenter : CommenterExtractor(data.children('div.header').children('div').children('span').text()),
              comment : data.children('p').text()
            };
            comments.push(comment);
          });
          var crawlerComment = {
            productId : dkp,
            comments : comments
          }
          addCommentsMongo(crawlerComment);
      }
  });
}

function insertMongo(insertedThing){
  MongoClient.connect(mongoURL, function(err, db) {
    if (err) throw err;
    var dbo = db.db("digicrawler");
    dbo.collection("products").insertOne(insertedThing, function(err, res) {
      if (err) throw err;
      console.log(insertedThing.productId + " inserted");
      db.close();
    });
  });
}

function addCommentsMongo(insertedThing){
  MongoClient.connect(mongoURL, function(err, db) {
    if (err) throw err;
    var dbo = db.db("digicrawler");
    var myquery = { "productId" : insertedThing.productId };
    var newvalues = { $set: {comments: insertedThing.comments } };
    dbo.collection("products").updateOne(myquery, newvalues, function(err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });
  });
}


digiCrawler();
