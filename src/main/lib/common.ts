import { z } from 'zod';

export const getLinkedinProfileUrl = (username: string) => {
  return `https://www.linkedin.com/in/${username}/`;
};
export function getLinkedinUsername(profileUrl: string): string | null {
  const pattern: RegExp = /(?<=\/in\/)[\w-]+/;
  const match: RegExpMatchArray | null = profileUrl.match(pattern);
  return match ? match[0] : null;
}

export const nonEmptyStringValidation = z.string().min(1, {
  message: 'this field should not be empty',
});
