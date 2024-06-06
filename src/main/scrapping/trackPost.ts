import puppeteer from 'puppeteer';
import dashboardApi, { Keys, TrackPost } from '../api/dashboardApi';
import { performLinkedinLogin } from './refechLinkedinFollowersData';

export const trackPost = async ({ postUrl }: { postUrl: string }) => {
  console.log('trackPost start');
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      // '--start-maximized', // you can also use '--start-fullscreen'
    ],
  });
  const page = (await browser.pages())[0];
  await page.setViewport({ width: 1300, height: 768 });
  await performLinkedinLogin(page);
  await page.goto(postUrl, {
    timeout: 0, // to disable timeout
  });
  const postTextElement = await page.waitForSelector('.update-components-text');
  let postText = await page.evaluate(
    (element) => element?.textContent,
    postTextElement,
  );
  postText = postText?.trim();
  await page.waitForSelector('li.social-details-social-counts__item');
  const socialCountButtons = await page.$$(
    'li.social-details-social-counts__item',
  );

  await socialCountButtons[socialCountButtons.length - 1].click();
  const container = await page.waitForSelector('div.artdeco-modal__content');

  // console.log(socialCountButtons);

  const content = await new Promise((resolve, reject) => {
    container
      ?.evaluate((element) => {
        return new Promise((innerResolve) => {
          const header = document.querySelector(
            '#feed-shared-reposts-modal__header',
          );
          const match = header?.textContent?.match(/(\d+)\s+reposts/);
          const numberOfReposts = match ? parseInt(match[1], 10) : null;
          const interval = setInterval(() => {
            const horizontalDividers = document.getElementsByClassName(
              'artdeco-divider feed-shared-reposts-modal__update-divider',
            );

            if (
              !numberOfReposts ||
              horizontalDividers.length >= numberOfReposts
            ) {
              innerResolve(element.innerHTML);
              clearInterval(interval);
            } else {
              element.scrollBy({
                top: element.scrollHeight - element.clientHeight,
                behavior: 'instant',
              });
            }
          }, 1000);
        });
      })
      .then(resolve)
      .catch(reject);
  });
  const previousTrackPost = await dashboardApi.getKey<TrackPost>(
    Keys.track_post,
  );
  const result = await dashboardApi.setKey(Keys.track_post, {
    ...previousTrackPost,
    [postUrl]: {
      postText: postText,
      htmlContent: content,
      postUrl,
      updatedAt: new Date().toISOString(),
    } as TrackPost[string],
  });
  console.log({ 'result.id': result.id });
  await browser.close();
  console.log('trackPost end');
};
