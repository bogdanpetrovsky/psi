import { chromium } from '@playwright/test';
import assert from 'assert';

(async () => {
  // Setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // The actual interesting bit
  await context.route('**.jpg', (route: any )=> route.abort());
  await page.goto('https://www.pravda.com.ua/news/');
  console.log(await page.title());
  const text = await page.getByRole('link').allInnerTexts();
  console.log(text);


  assert(true); // 👎 not a Web First assertion

  await context.close();
  await browser.close();
})()
