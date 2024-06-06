import axios from 'axios';
import environmentVars from '../lib/environmentVars';

const url = environmentVars.ORANGEWOOD_SERVER;

const getKey = async <T>(key: string) => {
  const response = await axios.get(`${url}/api/jsonData`, { params: { key } });
  return response.data.value as T | undefined;
};

const setKey = async (key: string, value: any) => {
  const response = await axios.post(`${url}/api/jsonData`, { key, value });
  return response.data;
};

const dashboardApi = { getKey, setKey };

export type FollowersData = Record<string, Record<string, number>>;
export type LinkedinCredentials = {
  email: string;
  password: string;
};
export type TwitterCredentials = {
  username: string;
  password: string;
};
export type TrackPost = Record<
  string,
  { postUrl: string; htmlContent: string; updatedAt: string; postText: string }
>;
export type ExportAnalyticsUrls = {
  twitter: string;
  linkedin: string;
};
export const deletedKey = '-deleted-';
export type LinkedinProfile = {
  name: string;
  username: string;
  updatedAt: string;
  [deletedKey]?: boolean;
};
export type LinkedinProfiles = Record<string, LinkedinProfile>;

export const Keys = {
  linkedin_credentials: 'linkedin_credentials',
  followers_data: 'followers_data',
  linkedin_profiles: 'linkedin_profiles',
  analyticsFileUrls: 'analyticsFileUrls',
  export_analytics_urls: 'export_analytics_urls',
  twitter_credentials: 'twitter_credentials',
  track_post: 'track_post',
};

export type AnalyticsFileUrls = {
  twitterDayWise: any;
  twitterTweetWise: any;
  linkedinContent: any;
  linkedinVisitors: any;
  linkedinFollowers: any;
};

export default dashboardApi;
