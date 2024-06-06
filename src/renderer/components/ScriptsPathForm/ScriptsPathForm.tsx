import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';

import { Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useLocalStorageState from 'src/renderer/hooks/useLocalStorageState';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

const formSchema = z.object({
  refetchFollowersDataFilePath: z.string(),
});

interface ScriptsPathFormProps {
  onFilled?: () => void;
}
const ScriptsPathForm: React.FC<ScriptsPathFormProps> = ({ onFilled }) => {
  const [scriptsPath, setScriptsPath] = useLocalStorageState('scriptsPath', {
    refetchFollowersDataFilePath: '',
  });

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      refetchFollowersDataFilePath: scriptsPath.refetchFollowersDataFilePath,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    setScriptsPath((prev) => ({
      ...prev,
      refetchFollowersDataFilePath: values.refetchFollowersDataFilePath,
    }));
    onFilled?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="refetchFollowersDataFilePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Refetch Followers Data File Path</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="h-2"></div>
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            <span className="flex items-center gap-2">
              {form.formState.isSubmitting && <Loader size={16} />}
              <span>Submit</span>
            </span>
          </Button>
        </div>
      </form>
    </Form>
  );
};
export default ScriptsPathForm;
