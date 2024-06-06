import dashboardApi from '../api/dashboardApi';

export const changeFollowersData = async () => {
  const rawFollowersData = await dashboardApi.getKey('followers_data');
  console.log({ rawFollowersData });
  const modifed: typeof rawFollowersData = {};
  for (const key in rawFollowersData) {
    modifed[new Date(key).toISOString()] = rawFollowersData[key]!;
  }
  await dashboardApi.setKey('followers_data', modifed);
  console.log({ modifed });
};
