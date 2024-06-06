import { format } from 'date-fns';
import puppeteer from 'puppeteer';
import dashboardApi, {
  AnalyticsFileUrls,
  ExportAnalyticsUrls,
  Keys,
  TwitterCredentials,
} from '../api/dashboardApi';
import { analyticsFileParsers } from '../api/dashboardUtils';
import {
  checkFileExistsInFolder,
  checkFunctionRepeatedly,
  readFilesInAFolder,
} from '../custom';

export const getDownloadPathForAnalytics = (type: 'twitter' | 'linkedin') => {
  const fileDate = format(new Date(), 'yyyy-MM-dd_hh-mm-ss_a');
  const downloadPath =
    process.platform === 'win32'
      ? `${process.env.USERPROFILE}\\Downloads\\${type}-analytics\\${fileDate}`
      : `${process.env.HOME}/Downloads/${type}-analytics/${fileDate}`;
  return downloadPath;
};

export const exportTwitterAnalytics = async () => {
  console.log('exportTwitterAnalytics start');
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      // '--start-maximized', // you can also use '--start-fullscreen'
    ],
  });
  const page = (await browser.pages())[0];
  await page.setViewport({ width: 1300, height: 768 });
  const exportAnalyticsUrls = await dashboardApi.getKey<ExportAnalyticsUrls>(
    Keys.export_analytics_urls,
  );

  await page.goto(exportAnalyticsUrls.twitter, {
    timeout: 0, // to disable timeout
  });
  const twitterCredentials = await dashboardApi.getKey<TwitterCredentials>(
    Keys.twitter_credentials,
  );
  await page.waitForSelector('input[name="text"]');
  await page.type('input[name="text"]', twitterCredentials.username);
  await page.keyboard.press('Enter');

  await page.waitForSelector('input[name="password"]');
  await page.type('input[name="password"]', twitterCredentials.password);

  await page.keyboard.press('Enter');
  await page.waitForNavigation();
  await page.waitForSelector('span.ladda-label');
  await page.click(`span.ladda-label`);
  const downloadPath = getDownloadPathForAnalytics('twitter');
  const cdpSession = await browser.target().createCDPSession();
  cdpSession.send('Browser.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath,
  });

  await page.waitForSelector('button[data-type="by_tweet"]');
  await page.click('button[data-type="by_tweet"]');

  const fileNameCondition = {
    twitterTweetWise: (fileName: string) =>
      fileName.includes('tweet_activity_metrics'),
    twitterDayWise: (fileName: string) =>
      fileName.includes('daily_tweet_activity_metrics'),
  };

  await checkFunctionRepeatedly(() => {
    return checkFileExistsInFolder({
      folderPath: downloadPath,
      check: fileNameCondition.twitterTweetWise,
    });
  }, 1000);

  await page.waitForSelector('span.ladda-label');
  await page.click(`span.ladda-label`);

  await page.waitForSelector('button[data-type="by_day"]');
  await page.click('button[data-type="by_day"]');
  await checkFunctionRepeatedly(() => {
    return checkFileExistsInFolder({
      folderPath: downloadPath,
      check: fileNameCondition.twitterDayWise,
    });
  }, 1000);
  const analyticsFileUrls =
    (await dashboardApi.getKey<AnalyticsFileUrls>(Keys.analyticsFileUrls)) ??
    {};
  console.log({ analyticsFileUrls });
  const uploadResult = await readFilesInAFolder({ folderPath: downloadPath });
  for (const [fileName, fileBuffer] of Object.entries(uploadResult)) {
    if (fileNameCondition.twitterDayWise(fileName)) {
      analyticsFileUrls.twitterDayWise = {
        fileName,
        contents: await analyticsFileParsers['twitterDayWise'](fileBuffer),
      };
    } else if (fileNameCondition.twitterTweetWise(fileName)) {
      analyticsFileUrls.twitterTweetWise = {
        fileName,
        contents: await analyticsFileParsers['twitterTweetWise'](fileBuffer),
      };
    }
  }
  const result = await dashboardApi.setKey(
    Keys.analyticsFileUrls,
    analyticsFileUrls,
  );
  await browser.close();
  console.log('exportTwitterAnalytics finished');
};
