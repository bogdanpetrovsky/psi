import { chromium } from '@playwright/test';
import assert from 'assert';

const scrapper = async () => {
  // Setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await context.route('**.jpg', (route: any )=> route.abort());
  await page.goto('https://www.pravda.com.ua/news/');
  const text = await page.getByRole('link').allInnerTexts();
  
  const filteredTitles = text.filter((title: string) => title.length > 25 && !title.includes('ПРАВИЛА'));
  console.log(filteredTitles);

  await context.close();
  await browser.close();
};

async function startUp() {
  setInterval(() => {
    console.log('tick');
    scrapper();
  }, 5000);
}

startUp().then();
