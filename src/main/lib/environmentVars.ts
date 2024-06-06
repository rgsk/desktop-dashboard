import { z } from 'zod';

const AppEnvironmentEnum = z.enum([
  'development',
  'staging',
  'production',
  'test', // jest sets the environment as test so this is added
]);

export type AppEnvironment = z.infer<typeof AppEnvironmentEnum>;

const environmentVarsSchema = z.object({
  ORANGEWOOD_SERVER: z.string(),
  APP_ENV: AppEnvironmentEnum,
});

const production: z.infer<typeof environmentVarsSchema> = {
  ORANGEWOOD_SERVER: 'https://orangewood-dashboard.vercel.app',
  APP_ENV: 'production',
};
const development: z.infer<typeof environmentVarsSchema> = {
  ORANGEWOOD_SERVER: 'http://localhost:3000',
  APP_ENV: 'development',
};

environmentVarsSchema.parse(production);
environmentVarsSchema.parse(development);

const isProduction = true;

const environmentVars = isProduction ? production : development;

export default environmentVars;
