import { chromium } from '@playwright/test';
var amqp = require('amqplib/callback_api');

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

async function startUp() {
  amqp.connect('amqp://localhost', {}, function(error0: any, connection: any) {
    if (error0) { throw error0;
    }
    connection.createChannel(function(error1: any, channel: any) {
      if (error1) { throw error1; }

      const queue = 'scrapper';
      channel.assertQueue(queue, { durable: false });

      setInterval(async () => {
        const scrapperData = await scrapper();
        const msg = JSON.stringify(scrapperData);

        channel.sendToQueue(queue, Buffer.from(msg));
        console.log(" [x] Sent %s", msg);
      }, 5000);
    });
  });
}

startUp().then();
