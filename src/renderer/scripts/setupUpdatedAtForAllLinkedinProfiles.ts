import dashboardApi from '../api/dashboardApi';

export const setupUpdatedAtForAllLinkedinProfiles = async () => {
  const linkedinProfiles = await dashboardApi.getKey('linkedin_profiles');
  const obj: any = {};
  for (const key in linkedinProfiles) {
    obj[key] = {
      ...linkedinProfiles[key],
      updatedAt: new Date().toISOString(),
    };
  }
  const result = await dashboardApi.setKey('linkedin_profiles', obj);
  console.log(result);
};
