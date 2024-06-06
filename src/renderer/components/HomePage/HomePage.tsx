import { useEffect, useState } from 'react';
import dashboardApi, {
  ExportAnalyticsUrls,
  Keys,
  LinkedinCredentials,
  TwitterCredentials,
} from 'src/main/api/dashboardApi';
import { nonEmptyStringValidation } from 'src/main/lib/common';
import environmentVars from 'src/main/lib/environmentVars';
import GenericForm from './Children/GenericForm';

interface HomePageProps {}
const HomePage: React.FC<HomePageProps> = ({}) => {
  const [linkedinCredentials, setLinkedinCredentials] =
    useState<LinkedinCredentials>();
  const [twitterCredentials, setTwitterCredentials] =
    useState<TwitterCredentials>();
  const [exportAnalyticsUrls, setExportAnalyticsUrls] =
    useState<ExportAnalyticsUrls>();
  const [dataFetched, setDataFetched] = useState(false);
  useEffect(() => {
    (async () => {
      const _twitterCredentials = await dashboardApi.getKey<TwitterCredentials>(
        Keys.twitter_credentials,
      );
      const _linkedinCredentials =
        await dashboardApi.getKey<LinkedinCredentials>(
          Keys.linkedin_credentials,
        );
      const _exportAnalyticsUrls =
        await dashboardApi.getKey<ExportAnalyticsUrls>(
          Keys.export_analytics_urls,
        );
      setTwitterCredentials(_twitterCredentials);
      setLinkedinCredentials(_linkedinCredentials);
      setExportAnalyticsUrls(_exportAnalyticsUrls);
      setDataFetched(true);
    })();
  }, []);
  return (
    <div>
      <pre>{JSON.stringify(environmentVars, null, 4)}</pre>
      {dataFetched && (
        <div>
          <div className="px-2">
            <p className="text-xl mb-4">Linkedin Credentials</p>
            <GenericForm
              closeForm={() => {}}
              createItem={async (data) => {
                await dashboardApi.setKey(Keys.linkedin_credentials, data);
              }}
              editedItem={linkedinCredentials}
              fieldsConfig={[
                {
                  name: 'email',
                  label: 'Email',
                  validation: nonEmptyStringValidation,
                },
                {
                  name: 'password',
                  label: 'Password',
                  type: 'password',
                  validation: nonEmptyStringValidation,
                },
              ]}
            />
          </div>
          <div className="px-2">
            <p className="text-xl mb-4">Twitter Credentials</p>
            <GenericForm
              closeForm={() => {}}
              createItem={async (data) => {
                await dashboardApi.setKey(Keys.twitter_credentials, data);
              }}
              editedItem={twitterCredentials}
              fieldsConfig={[
                {
                  name: 'username',
                  label: 'Username',
                  validation: nonEmptyStringValidation,
                },
                {
                  name: 'password',
                  label: 'Password',
                  type: 'password',
                  validation: nonEmptyStringValidation,
                },
              ]}
            />
          </div>
          <div className="px-2">
            <p className="text-xl mb-4">Export Analytics Urls</p>
            <GenericForm
              closeForm={() => {}}
              createItem={async (data) => {
                await dashboardApi.setKey(Keys.export_analytics_urls, data);
              }}
              editedItem={exportAnalyticsUrls}
              fieldsConfig={[
                {
                  name: 'twitter',
                  label: 'Twitter',
                  validation: nonEmptyStringValidation,
                },
                {
                  name: 'linkedin',
                  label: 'Linkedin',
                  validation: nonEmptyStringValidation,
                },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default HomePage;
