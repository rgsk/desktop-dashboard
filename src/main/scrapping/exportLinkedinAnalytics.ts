import puppeteer from 'puppeteer';
import dashboardApi, {
  AnalyticsFileUrls,
  ExportAnalyticsUrls,
  Keys,
} from '../api/dashboardApi';
import { analyticsFileParsers } from '../api/dashboardUtils';
import {
  checkFileExistsInFolder,
  checkFunctionRepeatedly,
  readFilesInAFolder,
} from '../custom';
import { getDownloadPathForAnalytics } from './exportTwitterAnalytics';
import { performLinkedinLogin } from './refechLinkedinFollowersData';

export const exportLinkedinAnalytics = async () => {
  console.log('exportLinkedinAnalytics start');
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      // '--start-maximized', // you can also use '--start-fullscreen'
    ],
  });
  const page = (await browser.pages())[0];
  await page.setViewport({ width: 1300, height: 768 });
  await performLinkedinLogin(page);
  const exportAnalyticsUrls = await dashboardApi.getKey<ExportAnalyticsUrls>(
    Keys.export_analytics_urls,
  );
  if (!exportAnalyticsUrls) {
    throw new Error(`${Keys.export_analytics_urls} key not set`);
  }
  const analyticsUrl = exportAnalyticsUrls.linkedin;
  const suffixes = {
    updates: 'updates',
    visitors: 'visitors',
    followers: 'followers',
  };
  const fileNameCondition = {
    [suffixes.updates]: (fileName: string) => fileName.includes('content'),
    [suffixes.visitors]: (fileName: string) => fileName.includes('visitors'),
    [suffixes.followers]: (fileName: string) => fileName.includes('followers'),
  };

  const downloadPath = getDownloadPathForAnalytics('linkedin');

  const cdpSession = await browser.target().createCDPSession();
  cdpSession.send('Browser.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath,
  });

  for (const suffix in suffixes) {
    await page.goto(analyticsUrl + '/' + suffix, {
      timeout: 0, // to disable timeout
    });
    // Click the export button
    const exportButton = await page.$('.artdeco-button--primary');
    if (exportButton) {
      await exportButton.click();
    }

    // Await for the popup to appear
    const popupExportButton = await page.$('.artdeco-button--primary');

    // Click the popup export button
    if (popupExportButton) {
      // Set the download behavior to save files to the specified path

      await popupExportButton.click();
      await checkFunctionRepeatedly(() => {
        return checkFileExistsInFolder({
          folderPath: downloadPath,
          check: fileNameCondition[suffix],
        });
      }, 1000);
    }
  }
  const analyticsFileUrls =
    (await dashboardApi.getKey<AnalyticsFileUrls>(Keys.analyticsFileUrls)) ??
    ({} as AnalyticsFileUrls);
  const uploadResult = await readFilesInAFolder({ folderPath: downloadPath });
  for (const [fileName, fileBuffer] of Object.entries(uploadResult)) {
    if (fileNameCondition[suffixes.updates](fileName)) {
      analyticsFileUrls.linkedinContent = {
        fileName,
        contents: await analyticsFileParsers['linkedinContent'](fileBuffer),
      };
    } else if (fileNameCondition[suffixes.followers](fileName)) {
      analyticsFileUrls.linkedinFollowers = {
        fileName,
        contents: await analyticsFileParsers['linkedinFollowers'](fileBuffer),
      };
    } else if (fileNameCondition[suffixes.visitors](fileName)) {
      analyticsFileUrls.linkedinVisitors = {
        fileName,
        contents: await analyticsFileParsers['linkedinVisitors'](fileBuffer),
      };
    }
  }
  const result = await dashboardApi.setKey(
    Keys.analyticsFileUrls,
    analyticsFileUrls,
  );
  await browser.close();
  console.log('exportLinkedinAnalytics end');
};
