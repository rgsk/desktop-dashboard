import * as XLSX from 'xlsx';

type SheetOptions = {
  skipFirstRow?: boolean;
};

export async function xlsToJson(
  buffer: Buffer,
  sheetsOptions?: Record<string, SheetOptions>,
) {
  const workbook = XLSX.read(buffer);

  const worksheets = workbook.SheetNames.reduce((obj, sheetName) => {
    const worksheet = workbook.Sheets[sheetName]!;
    if (sheetsOptions?.[sheetName]?.skipFirstRow) {
      const range = XLSX.utils.decode_range(worksheet['!ref']!);
      range.s.r = 1; // <-- zero-indexed, so setting to 1 will skip row 0
      worksheet['!ref'] = XLSX.utils.encode_range(range);
    }

    return {
      ...obj,
      [sheetName]: XLSX.utils.sheet_to_json(worksheet),
    };
  }, {});
  return worksheets;
}

import csv from 'csv-parser';
import { Readable } from 'stream';

// this will only work on server side
export async function csvToJson(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve) => {
    void (async () => {
      const results: any[] = [];
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          resolve(results);
        });
    })();
  });
}

export const analyticsFileKeys = {
  twitterDayWise: 'twitterDayWise' as const,
  twitterTweetWise: 'twitterTweetWise' as const,
  linkedinContent: 'linkedinContent' as const,
  linkedinVisitors: 'linkedinVisitors' as const,
  linkedinFollowers: 'linkedinFollowers' as const,
};

export const analyticsFileParsers = {
  [analyticsFileKeys.twitterDayWise]: csvToJson,
  [analyticsFileKeys.twitterTweetWise]: csvToJson,
  [analyticsFileKeys.linkedinContent]: (buffer: Buffer) =>
    xlsToJson(buffer, {
      Metrics: { skipFirstRow: true },
      'All posts': { skipFirstRow: true },
    }),
  [analyticsFileKeys.linkedinVisitors]: xlsToJson,
  [analyticsFileKeys.linkedinFollowers]: xlsToJson,
};
