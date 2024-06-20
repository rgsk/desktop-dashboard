import { hoursToMilliseconds } from 'date-fns';
import puppeteer, { Page } from 'puppeteer';
import dashboardApi, {
  FollowersData,
  Keys,
  LinkedinCredentials,
  LinkedinProfiles,
} from '../api/dashboardApi';
import { getLinkedinProfileUrl } from '../lib/common';

export const performLinkedinLogin = async (page: Page) => {
  await page.goto('https://in.linkedin.com/', {
    timeout: 0, // to disable timeout
  });
  const linkedinCredentials = await dashboardApi.getKey<LinkedinCredentials>(
    Keys.linkedin_credentials,
  );
  if (!linkedinCredentials) {
    throw new Error(`${Keys.linkedin_credentials} key not set`);
  }
  try {
    const signInWithEmailLinkSelector =
      'a[href="https://www.linkedin.com/login"]';
    const button = await page.waitForSelector(signInWithEmailLinkSelector, {
      timeout: 2000,
    });
    button?.click();
  } catch (e) {
    // if there's no login button we might be shown old interface
  }
  // Find and interact with the email input field
  await page.waitForSelector('input[name="session_key"]');
  await page.type('input[name="session_key"]', linkedinCredentials.email);

  // Find and interact with the password input field
  await page.waitForSelector('input[name="session_password"]');
  await page.type(
    'input[name="session_password"]',
    linkedinCredentials.password,
  );

  // Simulate pressing the "Enter" key
  await page.keyboard.press('Enter');

  await page.waitForSelector('div.share-box-feed-entry__closed-share-box', {
    timeout: hoursToMilliseconds(1),
  });
};

export const refechLinkedinFollowersData = async () => {
  console.log('refechLinkedinFollowersData start');
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      // '--start-maximized', // you can also use '--start-fullscreen'
    ],
  });
  const page = (await browser.pages())[0];
  await page.setViewport({ width: 1300, height: 768 });

  await performLinkedinLogin(page);

  console.log('performLinkedinLogin complete');

  const getFollowersForProfile = async (profileUrl: string) => {
    await page.goto(profileUrl, {
      timeout: 0, // to disable timeout
    });
    const element = await page.waitForFunction(patternInElementsText, {
      timeout: hoursToMilliseconds(1),
    });
    const elementText = (await (
      await element.getProperty('textContent')
    ).jsonValue()) as string;
    // console.log({ elementText });
    const followers = parseInt(
      elementText.match(/(\d|,)+/)![0].replace(/,/g, ''),
    );
    return followers;
  };

  const linkedinProfiles = await dashboardApi.getKey<LinkedinProfiles>(
    Keys.linkedin_profiles,
  );

  const currentFollowers: Record<string, number> = {};

  for (const username in linkedinProfiles) {
    const profileUrl = getLinkedinProfileUrl(username);
    const followers = await getFollowersForProfile(profileUrl);
    currentFollowers[username] = followers;
  }

  const followersData =
    (await dashboardApi.getKey<FollowersData>(Keys.followers_data)) || {};

  followersData[new Date().toISOString()] = currentFollowers;
  await dashboardApi.setKey(Keys.followers_data, followersData);
  await browser.close();
  console.log('refechLinkedinFollowersData end');
};

// Define a function to check for the desired text in the elements
const patternInElementsText = () => {
  const elements = Array.from(
    document.querySelectorAll('.pvs-header__optional-link'),
  );
  for (const element of elements) {
    if (element.textContent && element.textContent.includes('followers')) {
      return element;
    }
  }
};
