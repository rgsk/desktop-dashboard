import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Input } from '../../ui/input';

interface FieldConfig {
  name: string;
  label: string;
  type?: string;
  validation?: z.ZodType<any, any>;
}

interface GenericFormProps {
  closeForm?: () => void;
  createItem: (data: Record<string, any>) => void;
  editedItem?: any;
  fieldsConfig: FieldConfig[];
}

const GenericForm: React.FC<GenericFormProps> = ({
  closeForm,
  createItem,
  editedItem,
  fieldsConfig,
}) => {
  const formSchema = z.object(
    fieldsConfig.reduce((acc, field) => {
      // @ts-ignore
      acc[field.name] = field.validation;
      return acc;
    }, {}),
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...Object.fromEntries(
        fieldsConfig.map((field) => [
          field.name,
          editedItem ? editedItem[field.name] : '',
        ]),
      ),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createItem(values);
    closeForm?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        {fieldsConfig.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            // @ts-ignore
            name={field.name}
            render={({ field: renderField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input {...renderField} type={field.type} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="h-2"></div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
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

export default GenericForm;
