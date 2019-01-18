# DigiCrawler
###### created by Mehdi Arebilipour

This project is a simple crawler on Digikala which try two gather data for 8 different main Digikala SupplyCategory which you can see in nav bar and gather data from first 2 result search of those supply categories. then the GUI lets you to search, add, update and delete each product. And also you can delete comments or add new Comments.

## Setting up MongoDB

MongoDB is a cross-platform document-oriented database program. This application use powerful MongoDB node which is running on 2Kloud.ir servers. for simple using of this application you can just use them. and you can use mongo express gui from this link :
```
http://h3.2kloud.ir:8082
```

### Database Sharding

For using sharding concept you can run the services in mongo-docker-compose.yml by using this command :
```
docker-compose -f mongo-docker-compose up -d
```
 then follow the rules of [link text itself]: https://dzone.com/articles/composing-a-sharded-mongodb-on-docker

## Running Crawler

for storing data in mongodb, first, you need to run the crawler by this command
```
node crawler.js
```
this crawler check first 2 pages of search result on supply categories the store data of each product in mongo. after crawling product_id I used [async](https://caolan.github.io/async/docs.html#series) to make a queue for requests.
additionally, I user [cheerio](https://cheerio.js.org/) to make my crawler and use jquery selectors for finding elements.

## Running Website

after storing data in Mongo you just need to run the website application.
```
node server.js
```

### enjoy it!
