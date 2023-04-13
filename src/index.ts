import { chromium } from '@playwright/test';
import mongoose from 'mongoose';
var Memcached = require('memcached');
const memcached = new Memcached();

import { News as NewsSchema } from './models/news.model';
const News = mongoose.model('News', NewsSchema);

const scrapper = async (): Promise<string[]> => {
  // Setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await context.route('**.jpg', (route: any )=> route.abort());
  await page.goto('https://www.pravda.com.ua/news/');
  const text = await page.getByRole('link').allInnerTexts();

  const filteredTitles = text.filter((title: string) => title.length > 25 && !title.includes('ПРАВИЛА'));

  await context.close();
  await browser.close();

  return filteredTitles;
};

async function checkForCacheAndSave(titles: string[]) {
  await memcached.get(titles.toString(), function( err: any, data: any ) {
    if (!data) {
      memcached.set(titles.toString(), titles, 10000, function (err: any) {
        if(err) throw new err;
      });
    }
    console.log(data);
  });
}

async function startUp() {
  const memcached = new Memcached();
  /* code to connect with your memecahced server */
  memcached.connect( 'localhost:11211', function( err: any, conn: any ) {
    if (err) {
      console.log(conn.server, 'error while memcached connection!!');
    }
  });

  mongoose.connect('mongodb://127.0.0.1:27017/psi')
  .then(() => console.log('Connected!'));
  setInterval(async () => {
    const scrapperData = await scrapper();
    await checkForCacheAndSave(scrapperData);
    for (const title of scrapperData) {
      const existingNews = await News.findOne({title});
      if (existingNews) { continue; }

      await News.create({title});
    }
  }, 5000);
}

startUp().then();
