import * as debug from 'debug';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';

dotenv.config();

const navg = debug('this:navigation');
const capt = debug('this:capture');

async function main() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

  const nav = async (page: puppeteer.Page) => {
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    navg(`Navigated to ${page.url()}`);
  };

  const capture = async (page: puppeteer.Page, filename: string) => {
    await page.screenshot({ path: `./results/${filename}.png` });
    capt(`Captured ${filename}`);
  };

  const loginProcess = async () => {
    if (!fs.existsSync('./results/login')) {
      fs.mkdirSync('./results/login');
    }
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    await page.goto('https://www.yanolja.com');
    navg('Navigated to /');
    const myPageButton = await page.waitForSelector('a[href="/mypage"]');
    await myPageButton.click();

    await nav(page);
    const loginPageButton = await page.waitForSelector('a[href*="/login"]');
    await loginPageButton.click();

    await nav(page);
    const idInput = await page.waitForSelector('input[name=id]');
    const pwInput = await page.$('input[type=password]');
    await idInput.type(process.env.USERNAME);
    await pwInput.type(process.env.PASSWORD);
    await capture(page, 'login/1');
    await pwInput.press('Enter');

    await nav(page);
    await capture(page, 'login/2');
  };

  const RDPPurchaseProcess = async () => {
    if (!fs.existsSync('./results/RDP')) {
      fs.mkdirSync('./results/RDP');
    }
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    await page.goto('https://www.yanolja.com');
    navg('Navigated to /');
    const hotelButton = await page.waitForSelector('a[href="/hotel"]');
    await hotelButton.click();

    await nav(page);
    const firstHotelItem = await page.waitForSelector(
      'section > h2 + nav + div > a'
    );
    await firstHotelItem.click();

    await nav(page);
    await capture(page, 'RDP/1');
    const firstRoom = await page.waitForSelector(
      'section#select-dates + section > div'
    );
    await firstRoom.click();

    await nav(page);
    await capture(page, 'RDP/2');
  };

  await Promise.all([loginProcess(), RDPPurchaseProcess()]);
  await browser.close();

  return 'Done!';
}

if (!fs.existsSync('./results')) {
  fs.mkdirSync('results');
}
main().then(console.log, console.error);
