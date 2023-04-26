import express from 'express';
import path from "path";

import mongoose from 'mongoose';
var Memcached = require('memcached');
const memcached = new Memcached();

import { News as NewsSchema } from './models/news.model';
import { INews } from './models/News';
const News = mongoose.model('News', NewsSchema);

export const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use(express.static("src/views"));

async function main() {
  try{
    await mongoose.connect("mongodb://127.0.0.1:27017/psi");
    app.listen(3000);
    console.log("Successfully started on port 3000...");
  }
  catch(err) {
    return console.log(err);
  }
}

app.get("/like/:id", async (req, res) => {
  const newsItem = await News.findById(req.params.id);
  if (!newsItem) { return res.redirect('/page:1'); }

  if (!newsItem.likes) { newsItem.likes = 0; }
  newsItem.likes++;
  await newsItem.save();

  res.redirect('/page:1');
});

app.get("/dislike/:id", async (req, res) => {
  const newsItem = await News.findById(req.params.id);
  if (!newsItem) { return res.redirect('/page:1'); }

  if (!newsItem.dislikes) { newsItem.dislikes = 0; }
  newsItem.dislikes++;
  await newsItem.save();

  res.redirect('/page:1');
});

app.get("/", async (req, res) => {
  res.redirect('/page:1');
});

app.get("/:options", async (req, res) => {
  const params = dumbRoutingHelper(req.params.options);
  const pageNumber = parseInt(params.page as any) || 1;

  // memcached.get(JSON.stringify(params), async function( err: any, data: any ) {
  //   let titles: INews[] = [];
  //   if (!data) {
  //     titles = await fetchNews(params);
  //     memcached.set(JSON.stringify(params), titles, 150, function (err: any) {
  //       if (err) console.log(err);
  //     });
  //   } else {
  //     titles = data;
  //   }
  //   console.log(titles);
  //   res.render("search", { results: titles, searchValue: params.name, pageNumber });
  // });
  let titles: INews[] = await fetchNews(params);
  res.render("search", { results: titles, searchValue: params.name, pageNumber });
});

function dumbRoutingHelper(routeParams: string): { [key: string]: string | number } {
  const paramsValues = routeParams.split(',');
  const params: { [key: string]: string | number } = { };

  paramsValues.forEach((paramValue) => {
    const expressionParts = paramValue.split(':');
    if (expressionParts[1] && parseInt(expressionParts[1])) {
      params[expressionParts[0]] = parseInt(expressionParts[1]);
    } else {
      params[expressionParts[0]] = expressionParts[1];
    }
  });

  return params;
}

async function fetchNews(params: { [key: string]: string | number }): Promise<INews[]> {
  const formattedResults: INews[] = [];
  const pageNumber = parseInt(params.page as any) || 1;
  delete params['favicon.ico'];

  let results = await News.find(
    { title: { $regex: params.name || '' } },
    {},
    { limit: 25, skip: (pageNumber - 1) * 25 }
  ).sort({createdAt: -1}).lean();


  results.forEach((news) => formattedResults.push({
    _id: news._id,
    // @ts-ignore
    title: news.title,
    createdAt: news.createdAt.toLocaleString(),
    likes: news.likes || 0,
    dislikes: news.dislikes || 0,
  }));

  return formattedResults;
}

main().then();
process.on("SIGINT", async() => {
  await mongoose.disconnect();
  process.exit();
});
