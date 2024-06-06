import { format } from 'date-fns';
import {
  getLinkedinProfileUrl,
  getLinkedinUsername,
} from 'src/main/lib/common';
import {
  useDateOptions,
  useFollowersData,
  useLinkedinProfiles,
} from '../LinkedinLeaderboardPage/LinkedinLeaderboardPage';

import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';

import { useForm } from 'react-hook-form';

import { useMemo, useState } from 'react';
import { Checkbox } from '../ui/checkbox';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/renderer/components/ui/table';

import { Button } from '../ui/button';

import clsx from 'clsx';
import { useTheme } from 'src/renderer/providers/theme-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

import { MdAdd, MdDelete, MdEdit } from 'react-icons/md';

import { ArchiveRestore, Loader } from 'lucide-react';

import { LinkedinProfile } from 'src/main/api/dashboardApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface ManageLinkedinLeaderboardPageProps {}
const ManageLinkedinLeaderboardPage: React.FC<
  ManageLinkedinLeaderboardPageProps
> = ({}) => {
  const {
    followersData,
    deletedFollowersData,
    deleteEntry,
    permanentlyDeleteEntry,
    restoreEntry,
  } = useFollowersData();
  const { theme } = useTheme();
  const [showActionsFD, setShowActionsFD] = useState(false);
  const [binMode, setBinMode] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const dateOptions = useDateOptions(
    binMode ? deletedFollowersData : followersData,
  );
  const [showActionsLP, setShowActionsLP] = useState(false);
  const {
    sortedLinkedinProfiles,
    deletedSortedLinkedinProfiles,
    createProfile,
    deleteProfile,
    restoreProfile,
    permanentlyDeleteProfile,
  } = useLinkedinProfiles();

  const [deletedUsername, setDeletedUsername] = useState<string>();

  const [deletedFollowersEntryDate, setDeletedFollowersEntryDate] =
    useState<string>();

  const listedLinkedinProfiles = useMemo(() => {
    const result =
      (binMode ? deletedSortedLinkedinProfiles : sortedLinkedinProfiles) ?? [];
    return result.filter(
      ({ name, username }) =>
        name.toLowerCase().includes(searchInput.toLowerCase()) ||
        username.toLowerCase().includes(searchInput.toLowerCase()),
    );
  }, [
    binMode,
    deletedSortedLinkedinProfiles,
    searchInput,
    sortedLinkedinProfiles,
  ]);

  return (
    <div>
      <div className="flex px-4 justify-end">
        <Button
          onClick={() => {
            setBinMode((prev) => !prev);
          }}
        >
          {binMode ? <span>Exit Bin</span> : <span>Bin</span>}
        </Button>
      </div>

      <Tabs defaultValue="followers_data">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="followers_data">Followers Data</TabsTrigger>
          <TabsTrigger value="linkedin_profiles">Linkedin Profiles</TabsTrigger>
        </TabsList>
        <TabsContent value="followers_data">
          <div className="flex justify-end px-4 py-4">
            {!binMode && (
              <ShowActionsCheckbox
                showActions={showActionsFD}
                setShowActions={setShowActionsFD}
              />
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {(showActionsFD || binMode) && (
                  <TableHead className="text-center">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(dateOptions ?? []).map((date, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {format(new Date(date), 'dd MMMM, yyyy, h:mm a')}
                  </TableCell>
                  {(showActionsFD || binMode) && (
                    <TableCell>
                      <div className="flex gap-4 justify-end">
                        {binMode && (
                          <RestoreButton
                            onClick={() => {
                              restoreEntry(date);
                            }}
                          />
                        )}

                        {binMode ? (
                          <PermanentlyDeleteButton
                            loading={deletedFollowersEntryDate === date}
                            onClick={async () => {
                              // permanently delete
                              setDeletedFollowersEntryDate(date);
                              await permanentlyDeleteEntry(date);
                              setDeletedFollowersEntryDate(undefined);
                            }}
                          />
                        ) : (
                          <DeleteButton
                            onClick={async () => {
                              setDeletedFollowersEntryDate(date);
                              await deleteEntry(date);
                              setDeletedFollowersEntryDate(undefined);
                            }}
                            loading={deletedFollowersEntryDate === date}
                          >
                            Delete
                          </DeleteButton>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="linkedin_profiles">
          <div className="flex justify-between px-4 py-4 gap-8">
            <ChangeProfile
              createProfile={createProfile}
              mode="create"
              button={
                <Button variant="outline">
                  <MdAdd size={20} className="mr-2" />
                  Create
                </Button>
              }
            />
            <div className="flex gap-4">
              <div className="w-[20vw]">
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                  }}
                />
              </div>
              {!binMode && (
                <ShowActionsCheckbox
                  showActions={showActionsLP}
                  setShowActions={setShowActionsLP}
                />
              )}
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                {(showActionsLP || binMode) && (
                  <TableHead className="text-center">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {listedLinkedinProfiles.map((profile, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center">{i + 1}</TableCell>
                  <TableCell>{profile.name}</TableCell>
                  <TableCell>
                    <a
                      href={getLinkedinProfileUrl(profile.username)}
                      target="_blank"
                      rel="noreferrer"
                      className={clsx(
                        'flex items-center gap-4 hover:underline',
                        theme === 'dark' ? 'text-[#71b7fb]' : 'text-[#0a66c2]',
                      )}
                    >
                      <span>{profile.username}</span>
                    </a>
                  </TableCell>
                  {(showActionsLP || binMode) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-4">
                        {!binMode && (
                          <ChangeProfile
                            createProfile={createProfile}
                            mode="edit"
                            editedProfile={profile}
                            button={
                              <Button variant="outline">
                                <span className="flex items-center gap-2">
                                  <MdEdit
                                    size={16}
                                    color={
                                      theme === 'dark' ? '#71b7fb' : '#0a66c2'
                                    }
                                  />
                                  <span>Edit</span>
                                </span>
                              </Button>
                            }
                          />
                        )}

                        {binMode && (
                          <RestoreButton
                            onClick={() => {
                              restoreProfile({ username: profile.username });
                            }}
                          />
                        )}

                        {binMode ? (
                          <PermanentlyDeleteButton
                            loading={deletedUsername === profile.username}
                            onClick={async () => {
                              setDeletedUsername(profile.username);
                              await permanentlyDeleteProfile({
                                username: profile.username,
                              });
                              setDeletedUsername(undefined);
                            }}
                          />
                        ) : (
                          <DeleteButton
                            loading={deletedUsername === profile.username}
                            onClick={async () => {
                              setDeletedUsername(profile.username);
                              await deleteProfile({
                                username: profile.username,
                              });
                              setDeletedUsername(undefined);
                            }}
                          >
                            Delete
                          </DeleteButton>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default ManageLinkedinLeaderboardPage;

interface ShowActionsCheckboxProps {
  showActions: boolean;
  setShowActions: React.Dispatch<React.SetStateAction<boolean>>;
}
const ShowActionsCheckbox: React.FC<ShowActionsCheckboxProps> = ({
  showActions,
  setShowActions,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="show-actions"
        checked={showActions}
        onCheckedChange={() => {
          setShowActions((prev) => !prev);
        }}
      />
      <label
        htmlFor="show-actions"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Show Actions
      </label>
    </div>
  );
};

export function CheckboxDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <label
        htmlFor="terms"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </label>
    </div>
  );
}

interface RestoreButtonProps {
  onClick: () => void;
}
const RestoreButton: React.FC<RestoreButtonProps> = ({ onClick }) => {
  const { theme } = useTheme();

  return (
    <Button variant="outline" onClick={onClick}>
      <ArchiveRestore
        size={16}
        className="mr-2"
        color={theme === 'dark' ? '#71b7fb' : '#0a66c2'}
      />
      Restore
    </Button>
  );
};

interface DeleteButtonProps {
  onClick?: () => void;
  loading: boolean;
  children: string;
}
const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  loading,
  children,
}) => {
  return (
    <Button variant="outline" onClick={onClick} disabled={loading}>
      <span className="flex items-center gap-2">
        {loading ? <Loader size={16} /> : <MdDelete size={16} color="red" />}{' '}
        <span>{children}</span>
      </span>
    </Button>
  );
};

interface PermanentlyDeleteButtonProps {
  loading: boolean;
  onClick: () => void;
}
const PermanentlyDeleteButton: React.FC<PermanentlyDeleteButtonProps> = ({
  loading,
  onClick,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DeleteButton loading={loading}>Permanently Delete</DeleteButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClick}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

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
  name: z.string().min(1, {
    message: ' ',
  }),
  username: z.string().min(1, {
    message: ' ',
  }),
});

interface ProfileFormProps {
  closeForm: () => void;
  createProfile: ({
    name,
    username,
  }: {
    name: string;
    username: string;
  }) => Promise<void>;
  editedProfile?: LinkedinProfile;
}
const ProfileForm: React.FC<ProfileFormProps> = ({
  closeForm,
  createProfile,
  editedProfile,
}) => {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editedProfile?.name,
      username: editedProfile?.username,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const name = values.name;
    const usernameOrProfileURL = values.username;

    const parsedUsername = getLinkedinUsername(usernameOrProfileURL);
    const finalUsername = parsedUsername ?? usernameOrProfileURL;

    await createProfile({ name, username: finalUsername });
    closeForm();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {editedProfile ? null : (
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username / Profile URL</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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

interface ChangeProfileProps {
  createProfile: ({
    name,
    username,
  }: {
    name: string;
    username: string;
  }) => Promise<void>;
  mode: 'create' | 'edit';
  button: React.ReactNode;
  editedProfile?: LinkedinProfile;
}
const ChangeProfile: React.FC<ChangeProfileProps> = ({
  createProfile,
  mode,
  button,
  editedProfile,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
      }}
    >
      <DialogTrigger asChild>{button}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create' : 'Edit'} Profile
          </DialogTitle>
        </DialogHeader>
        <ProfileForm
          closeForm={() => {
            setOpen(false);
          }}
          createProfile={createProfile}
          editedProfile={editedProfile}
        />
      </DialogContent>
    </Dialog>
  );
};
