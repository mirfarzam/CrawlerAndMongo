var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const puppeteer = require('puppeteer');
var MongoClient = require('mongodb').MongoClient;
var createUrl = "";
var mongoURL = "";


function arrayRemove(arr, value) {
   return arr.filter(function(ele){
       return ele.commentId != value;
   });
}

app.get('/', function (req, res) {
  res.render('index');
})

app.get('/searchSupplyCategory', function (req, res) {
  res.render('searchSupplyCategory');
})

app.post('/searchSupplyCategory', function (req, res) {
  var supplyCategory = req.body.supplyCategory;
  MongoClient.connect(mongoURL, function(err, db) {
    if (err) throw err;
    var dbo = db.db("digicrawler");
    dbo.collection("products").find({supplyCategory : supplyCategory.toInt()}).toArray(function(err, result) {
      if (err) throw err;
      res.render('search', {resultarray : result});
      db.close();
    });
  });
})

app.get('/searchInProducts', function (req, res) {
  res.render('searchInProducts');
})


app.post('/searchInProductsresult', function (req, res) {
  var query = {
    price: {
      $gte : 0
    }
  };
  MongoClient.connect(mongoURL, function(err, db) {
  if (err) throw err;
  var dbo = db.db("digicrawler");
  if(req.body.name) query.productName = new RegExp(req.body.name, 'i');
  if(req.body.brand) query.brandName = new RegExp(req.body.brand, 'i');
  if(req.body.category) query.categoryName = new RegExp(req.body.category, 'i');
  if(req.body.supplyCategory) query.supplyCategory = req.body.supplyCategory.toInt();
  if(req.body.greaterThat) query.price.$gte = req.body.greaterThat.toInt();
  if(req.body.lessthan) query.price.$lt = req.body.lessthan.toInt();
  dbo.collection("products").find(query).toArray(function(err, result) {
    if (err) throw err;
    res.render('search', { resultarray : result } );
    db.close();
    });
  });
})

app.get('/product/:id',function(req,res){
    var product_id = req.params.id.substring(4);
    MongoClient.connect(mongoURL, function(err, db) {
    if (err) throw err;
    var dbo = db.db("digicrawler");
    dbo.collection("products").findOne({ "productId" : product_id}, function(err, result) {
      if (err) throw err;
      res.render('productPage', { result : result } );
      db.close();
    });
  });
});

app.get('/deleteproduct/:id',function(req,response){
    var product_id = req.params.id.substring(4);
    var myquery = { "productId" : product_id};
    MongoClient.connect(mongoURL, function(err, db) {
    var dbo = db.db("digicrawler");
    dbo.collection("products").deleteOne(myquery, function(err, obj) {
      if (err) throw err;
      db.close();
      if (err) {
        response.render('Response' ,{response : "Unfortunaitlly, not inserted"});
      } else {
        response.render('Response' ,{response : "The Product is deleted successfully"});
      }
    });
  });
});

app.get('/deleteComment/:dkp/:cid',function(req,response){
    var product_id = req.params.dkp.substring(4);
    var comment_id = req.params.cid.substring(4);
    var myquery = { "productId" : product_id };
    var change = {};
    MongoClient.connect(mongoURL, function(err, db) {
    var dbo = db.db("digicrawler");
    dbo.collection("products").findOne(myquery, function(err, result) {
      if (err) throw err;
      var newComments = arrayRemove(result.comments,comment_id);
      change.comments = newComments;
      var newvalues = { $set : change };
      dbo.collection("products").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 comment deleted");
        db.close();
        response.redirect('/product/dkp-' + product_id);
      });
    });
  });
});

app.post('/newComment/:dkp',function(req,response){
    var product_id = req.params.dkp.substring(4);
    var myquery = { "productId" : product_id };
    var change = {};
    MongoClient.connect(mongoURL, function(err, db) {
    var dbo = db.db("digicrawler");
    dbo.collection("products").findOne(myquery, function(err, result) {
      if (err) throw err;
      var cid = 0;
      for (var i = 0 ; i < result.comments.length ; i++){
        if(result.comments[i].commentId > cid) {
          cid = result.comments[i].commentId + 1;
        }
      }
      var newComment = {
        commentId : cid,
        commenter : req.body.commenter,
        comment : req.body.comment
      };
      result.comments.push(newComment);
      var newvalues = { $set : result };
      dbo.collection("products").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 comment added");
        db.close();
        response.redirect('/product/dkp-' + product_id);
      });
  });
});
});

app.get('/updateproduct/:id',function(req,res){
    var product_id = req.params.id.substring(4);
    MongoClient.connect(mongoURL, function(err, db) {
      var dbo = db.db("digicrawler");
    if (err) throw err;
    var dbo = db.db("digicrawler");
    dbo.collection("products").findOne({ "productId" : product_id}, function(err, result) {
      if (err) throw err;
      res.render('updateProduct', { result : result } );
      db.close();
    });
  });
});

app.post('/updatingproductdata/:id',function(request,response){
    var product_id = request.params.id.substring(4);
    MongoClient.connect(mongoURL, function(err, db) {
      if (err) throw err;
      var dbo = db.db("digicrawler");
      var myquery = { "productId" : product_id };
      var changes = {};
      if(request.body.name) changes.productName = request.body.name;
      if(request.body.image) changes.productImage = request.body.image;
      if(request.body.brand) changes.brandName = request.body.brand;
      if(request.body.category) changes.categoryName = request.body.category;
      if(request.body.price) changes.price = request.body.price.toInt();
      console.log(changes);
      var newvalues = { $set : changes };
      dbo.collection("products").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        db.close();
        response.redirect('/product/dkp-' + product_id);
      });
    });
});

app.get('/AddingProduct', function (req, res) {
  res.render('AddingProduct');
})

app.post('/addproduct', function (req, response) {
  MongoClient.connect(mongoURL, function(err, db) {
    if (err) throw err;
    var dbo = db.db("digicrawler");
    var mysort = { productId: -1 };
    dbo.collection("products").find().sort(mysort).limit(1).toArray(function(err, result) {
      if (err) throw err;
      var tempProductData = {productId : result[0].productId + 1 , productName : req.body.name, categoryName : req.body.category, brandName: req.body.brand,productImage : req.body.image, price : req.body.price.toInt(), supplyCategory : req.body.supplyCategory.toInt()};
      dbo.collection("products").insertOne(tempProductData, function(err, res) {
        if (err) {
          response.render('Response' ,{response : "Unfortunaitlly, not inserted"});
        }else {
          response.render('Response' ,{response : "Heu Buddy, the product is inserted"});
        }
        db.close();
      });
    });
  });
})

app.get('/mongoCreateDatabase', function(req, res){
  MongoClient.connect(createUrl, function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    db.close();
  });
});

app.get('/mongoCreateCollection', function(req, res){
    MongoClient.connect(mongoURL, function(err, db) {
    if (err) throw err;
    var dbo = db.db("digicrawler");
    dbo.createCollection("products", function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
  });
});



String.prototype.toEnglishDigits = function () {
    return this.replace(/[۰-۹]/g, function (w) {
        var persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return persian.indexOf(w);
    });
};

String.prototype.toInt = function () {
    return parseInt(this);
};


app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;
