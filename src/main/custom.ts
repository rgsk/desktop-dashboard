import fs from 'fs';
import path from 'path';

export const checkFileExistsInFolder = ({
  folderPath,
  check,
}: {
  folderPath: string;
  check: (fileName: string) => boolean;
}) => {
  const fileNames = fs.readdirSync(folderPath);
  for (const fileName of fileNames) {
    if (check(fileName)) {
      return true;
    }
  }
  return false;
};

export function checkFunctionRepeatedly(
  func: () => boolean,
  interval: number,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const checkInterval = setInterval(() => {
      try {
        if (func()) {
          clearInterval(checkInterval);
          resolve();
        }
      } catch (err) {}
    }, interval);
  });
}

export const readFilesInAFolder = async ({
  folderPath,
}: {
  folderPath: string;
}) => {
  let fileNames = fs.readdirSync(folderPath);
  fileNames = fileNames.filter((f) => f !== '.DS_Store');
  const uploadedFilesUrl: Record<string, Buffer> = {};
  await Promise.all(
    fileNames.map(async (fileName) => {
      const filePath = path.join(folderPath, fileName);
      const fileBuffer = await fs.promises.readFile(filePath);
      uploadedFilesUrl[fileName] = fileBuffer;
    }),
  );
  return uploadedFilesUrl;
};
