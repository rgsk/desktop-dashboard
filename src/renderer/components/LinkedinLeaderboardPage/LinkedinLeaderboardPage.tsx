import { format } from 'date-fns';

import dashboardApi, {
  FollowersData,
  LinkedinProfile,
  LinkedinProfiles,
  deletedKey,
} from 'src/main/api/dashboardApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'src/renderer/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/renderer/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

import {
  Copy,
  Database,
  Download,
  Loader,
  Printer,
  Settings,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/renderer/components/ui/select';
import useCopyToClipboard from 'src/renderer/hooks/useCopyToClipboard';
import { Button } from '../ui/button';

const formatHeaderDate = (date: string) => {
  return 'Dated ' + format(new Date(date), 'dd MMM, yyyy');
};
export const useFollowersData = () => {
  const [rawFollowersData, setRawFollowersData] = useState<FollowersData>();
  const refetchFollowersData = useCallback(async () => {
    const fetched = await dashboardApi.getKey<FollowersData>('followers_data');
    setRawFollowersData(fetched);
  }, []);

  useEffect(() => {
    refetchFollowersData();
  }, [refetchFollowersData]);

  const deleteEntry = useCallback(
    async (date: string) => {
      const newFollowersData = { ...rawFollowersData };
      newFollowersData[date][deletedKey] = -1;
      const result = await dashboardApi.setKey(
        'followers_data',
        newFollowersData,
      );
      setRawFollowersData(result.value);
    },
    [rawFollowersData],
  );
  const restoreEntry = useCallback(
    async (date: string) => {
      const newFollowersData = { ...rawFollowersData };
      delete newFollowersData[date][deletedKey];
      const result = await dashboardApi.setKey(
        'followers_data',
        newFollowersData,
      );
      setRawFollowersData(result.value);
    },
    [rawFollowersData],
  );

  const permanentlyDeleteEntry = useCallback(
    async (date: string) => {
      const newFollowersData = { ...rawFollowersData };
      delete newFollowersData[date];
      const result = await dashboardApi.setKey(
        'followers_data',
        newFollowersData,
      );
      setRawFollowersData(result.value);
    },
    [rawFollowersData],
  );

  const { displayedFollowersData, deletedFollowersData } = useMemo(() => {
    if (!rawFollowersData) {
      return {};
    }

    const displayedFollowersData: typeof rawFollowersData = {};
    const deletedFollowersData: typeof rawFollowersData = {};

    // ensure that deleted entries are not shown
    for (const key in rawFollowersData) {
      if (deletedKey in rawFollowersData[key]) {
        deletedFollowersData[key] = rawFollowersData[key];
      } else {
        displayedFollowersData[key] = rawFollowersData[key];
      }
    }
    return { displayedFollowersData, deletedFollowersData };
  }, [rawFollowersData]);

  return {
    followersData: displayedFollowersData,
    deletedFollowersData,
    refetchFollowersData,
    deleteEntry,
    restoreEntry,
    permanentlyDeleteEntry,
  };
};

export const useLinkedinProfiles = () => {
  const [rawLinkedinProfiles, setRawLinkedinProfiles] =
    useState<Record<string, LinkedinProfile>>();

  const retchLinkedinProfiles = useCallback(async () => {
    const fetched =
      await dashboardApi.getKey<LinkedinProfiles>('linkedin_profiles');
    setRawLinkedinProfiles(fetched);
  }, []);

  const createProfile = useCallback(
    async ({ name, username }: { name: string; username: string }) => {
      const newLinkedinProfiles = {
        ...rawLinkedinProfiles,
        [username]: { name, username, updatedAt: new Date().toISOString() },
      };
      const result = await dashboardApi.setKey(
        'linkedin_profiles',
        newLinkedinProfiles,
      );
      setRawLinkedinProfiles(result.value);
    },
    [rawLinkedinProfiles],
  );

  const deleteProfile = useCallback(
    async ({ username }: { username: string }) => {
      const newLinkedinProfiles = { ...rawLinkedinProfiles };
      newLinkedinProfiles[username][deletedKey] = true;
      const result = await dashboardApi.setKey(
        'linkedin_profiles',
        newLinkedinProfiles,
      );
      setRawLinkedinProfiles(result.value);
    },
    [rawLinkedinProfiles],
  );

  const restoreProfile = useCallback(
    async ({ username }: { username: string }) => {
      const newLinkedinProfiles = { ...rawLinkedinProfiles };
      delete newLinkedinProfiles[username][deletedKey];
      const result = await dashboardApi.setKey(
        'linkedin_profiles',
        newLinkedinProfiles,
      );
      setRawLinkedinProfiles(result.value);
    },
    [rawLinkedinProfiles],
  );

  const permanentlyDeleteProfile = useCallback(
    async ({ username }: { username: string }) => {
      const newLinkedinProfiles = { ...rawLinkedinProfiles };
      delete newLinkedinProfiles[username];
      const result = await dashboardApi.setKey(
        'linkedin_profiles',
        newLinkedinProfiles,
      );
      setRawLinkedinProfiles(result.value);
    },
    [rawLinkedinProfiles],
  );

  useEffect(() => {
    retchLinkedinProfiles();
  }, [retchLinkedinProfiles]);

  const { displayedLinkedinProfiles, deletedLinkedinProfiles } = useMemo(() => {
    if (!rawLinkedinProfiles) {
      return {};
    }
    const displayedLinkedinProfiles: typeof rawLinkedinProfiles = {};
    const deletedLinkedinProfiles: typeof rawLinkedinProfiles = {};
    for (const key in rawLinkedinProfiles) {
      if (!(deletedKey in rawLinkedinProfiles[key])) {
        displayedLinkedinProfiles[key] = rawLinkedinProfiles[key];
      } else {
        deletedLinkedinProfiles[key] = rawLinkedinProfiles[key];
      }
    }
    return { displayedLinkedinProfiles, deletedLinkedinProfiles };
  }, [rawLinkedinProfiles]);

  const sortedLinkedinProfiles = useMemo(() => {
    if (!displayedLinkedinProfiles) {
      return;
    }
    const profiles = Object.values(displayedLinkedinProfiles);
    return profiles.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [displayedLinkedinProfiles]);

  const deletedSortedLinkedinProfiles = useMemo(() => {
    if (!deletedLinkedinProfiles) {
      return;
    }
    const profiles = Object.values(deletedLinkedinProfiles);
    return profiles.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [deletedLinkedinProfiles]);

  return {
    linkedinProfiles: displayedLinkedinProfiles,
    sortedLinkedinProfiles,
    deletedLinkedinProfiles,
    deletedSortedLinkedinProfiles,
    retchLinkedinProfiles,
    createProfile,
    deleteProfile,
    permanentlyDeleteProfile,
    restoreProfile,
  };
};

export const useDateOptions = (followersData: FollowersData | undefined) => {
  const dataOptions = useMemo(() => {
    if (!followersData) {
      return;
    }
    return Object.keys(followersData)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime())
      .map((d) => d.toISOString());
  }, [followersData]);
  return dataOptions;
};

interface LinkedinLeaderboardPageProps {}
const LinkedinLeaderboardPage: FC<LinkedinLeaderboardPageProps> = ({}) => {
  const { copy, copied } = useCopyToClipboard();

  const [baseDate, setBaseDate] = useState<string>();
  const [refetchFollowersDataLoading, setRefetchFollowersDataLoading] =
    useState(false);
  const [fetchFollowersDataAlertOpen, setFetchFollowersDataAlertOpen] =
    useState(false);
  const [fetchFollowersDataError, setFetchFollowersDataError] =
    useState<string>();
  const [configurationDialogOpen, setConfigurationDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>();

  const { followersData, refetchFollowersData } = useFollowersData();
  const { linkedinProfiles } = useLinkedinProfiles();

  const dateOptions = useDateOptions(followersData);

  const rows = useMemo(() => {
    if (!followersData || !baseDate || !currentDate || !linkedinProfiles) {
      return;
    }
    const result: {
      name: string;
      username?: string;
      baseFollowers: number;
      currentFollowers: number;
      change: number;
      missing: boolean;
      baseMissing: boolean;
      currentMissing: boolean;
    }[] = [];
    const baseFollowersMap = followersData[baseDate]!;
    const currentFollowersMap = followersData[currentDate]!;
    for (const profile of Object.values(linkedinProfiles)) {
      const baseMissing = !(profile.username in baseFollowersMap);
      const currentMissing = !(profile.username in currentFollowersMap);
      const missing = baseMissing || currentMissing;
      const baseFollowers = baseFollowersMap[profile.username] ?? 0;
      const currentFollowers = currentFollowersMap[profile.username] ?? 0;
      const change = missing ? 0 : currentFollowers - baseFollowers;
      result.push({
        name: profile.name,
        username: profile.name,
        baseFollowers,
        currentFollowers,
        change,
        missing,
        baseMissing,
        currentMissing,
      });
    }
    result.sort((a, b) => {
      if (a.missing) {
        return 1;
      }
      if (b.missing) {
        return -1;
      }
      return b.change - a.change;
    });
    result.push({
      name: 'Total',
      baseFollowers: result.reduce(
        (s, c) => s + (c.missing ? 0 : c.baseFollowers),
        0,
      ),
      currentFollowers: result.reduce(
        (s, c) => s + (c.missing ? 0 : c.currentFollowers),
        0,
      ),
      change: result.reduce((s, c) => s + (c.missing ? 0 : c.change), 0),
      missing: false,
      baseMissing: false,
      currentMissing: false,
    });
    return result;
  }, [baseDate, currentDate, followersData, linkedinProfiles]);

  const bodyOfMessage = useMemo(() => {
    if (!rows || !currentDate) {
      return;
    }
    const bold = (s: string) => `*${s}*`;
    const entries = rows.map((row, i) => {
      const rank = bold(`${i + 1}`);
      const name = bold(row.name);
      const current = `${format(new Date(currentDate), `do MMM`)} - ${bold(
        row.currentFollowers.toString(),
      )}`;
      const change = `Change - ${bold(
        row.missing ? 'na' : row.change.toString(),
      )}`;
      return `${rank} - ${name} - ${current} - ${change}`;
    });
    entries.unshift(
      bold(
        `Linkedin Leaderboard - ${format(
          new Date(currentDate),
          'do MMM, yyyy',
        )}`,
      ),
    );
    return entries.join('\n\n');
  }, [currentDate, rows]);

  useEffect(() => {
    return window.electron.ipcRenderer.on(
      'refetchFollowersData',
      (obj: any) => {
        setRefetchFollowersDataLoading(false);
        if (obj.isError) {
          setFetchFollowersDataAlertOpen(true);
          setFetchFollowersDataError(obj.error.message);
        } else {
          refetchFollowersData();
          toast({
            title: 'Followers Data fetched',
            description: `for ${format(new Date(), 'dd, MMM yyyy')}`,
            action: (
              <ToastAction
                altText="Configure"
                onClick={() => {
                  setConfigurationDialogOpen(true);
                }}
              >
                Configure
              </ToastAction>
            ),
          });
        }
      },
    );
  }, [refetchFollowersData]);

  const onRefetchFollwersData = () => {
    setRefetchFollowersDataLoading(true);
    setFetchFollowersDataError(undefined);
    window.electron.ipcRenderer.sendMessage('refetchFollowersData');
  };

  const title = `Linkedin Leaderboard ${
    currentDate ? `- ${format(new Date(currentDate!), 'dd, MMM yyyy')}` : ``
  }`;

  useEffect(() => {
    document.title = title;
  }, [title]);

  if (!followersData || !linkedinProfiles || !dateOptions) {
    return <p>Loading...</p>;
  }

  const configuration = () => {
    return (
      <Dialog
        open={configurationDialogOpen}
        onOpenChange={(open) => {
          setConfigurationDialogOpen(open);
        }}
      >
        <DialogTrigger>
          <Button variant="outline">
            <Settings className="mr-2" />
            Configure
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Leaderboard</DialogTitle>
          </DialogHeader>
          <div>
            <div className="mt-4">
              {/* <div className="flex flex-col gap-4">
                {dateOptions.map((d, i) => {
                  return (
                    <div key={i} className="flex gap-4">
                      <p>{format(new Date(d), "dd MMMM, yyyy h:mm a")}</p>
                      <button className="border px-1">Delete</button>
                    </div>
                  );
                })}
              </div> */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <p className="w-[150px]">Base Date:</p>
                  <DateSelect
                    value={baseDate!}
                    onValueChange={setBaseDate}
                    dateOptions={dateOptions}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <p className="w-[150px]">Current Date:</p>
                  <DateSelect
                    value={currentDate!}
                    onValueChange={setCurrentDate}
                    dateOptions={dateOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div>
      <div className="h-4"></div>
      {/* render in pre if we want to show the preview */}
      {/* <pre>{bodyOfMessage}</pre> */}
      <div className="flex justify-between px-4">
        <p className="text-xl">{title}</p>

        <div className="flex gap-4 print:hidden">
          {rows && (
            <>
              <Button
                onClick={() => {
                  void copy(bodyOfMessage!);
                }}
                variant="outline"
              >
                <Copy className="mr-2" />
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button
                onClick={() => {
                  window.print();
                }}
                variant="outline"
              >
                <Printer className="mr-2" />
                Print
              </Button>
            </>
          )}
          {configuration()}
          <AlertDialogScrapingError
            open={fetchFollowersDataAlertOpen}
            onOpenChange={(open) => setFetchFollowersDataAlertOpen(open)}
            errorMessage={fetchFollowersDataError ?? ''}
            retry={onRefetchFollwersData}
          />
          <Button
            disabled={refetchFollowersDataLoading}
            onClick={onRefetchFollwersData}
            variant="outline"
          >
            <Download className="mr-2" />
            <span className="flex items-center gap-2">
              {refetchFollowersDataLoading && <Loader size={16} />}
              <span>Refetch Followers Data</span>
            </span>
          </Button>
          <Link to="/manage-linkedin-leaderboard">
            <Button variant="outline">
              <Database className="mr-2" /> Manage Data
            </Button>
          </Link>
        </div>
      </div>
      <div className="h-4"></div>
      {rows ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Rank</TableHead>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">
                {formatHeaderDate(baseDate!)}
              </TableHead>
              <TableHead className="text-center">
                {formatHeaderDate(currentDate!)}
              </TableHead>
              <TableHead className="text-center">Change (in Number)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="text-right">{i + 1}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right">
                  {row.baseMissing ? '-' : row.baseFollowers}
                </TableCell>
                <TableCell className="text-right">
                  {row.currentMissing ? '-' : row.currentFollowers}
                </TableCell>
                <TableCell className="text-right">
                  {row.missing ? '-' : row.change}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </div>
  );
};
export default LinkedinLeaderboardPage;

interface DateSelectProps {
  dateOptions: string[];
  onValueChange(value: string): void;
  value: string;
}
const DateSelect: FC<DateSelectProps> = ({
  dateOptions,
  value,
  onValueChange,
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={'Select'} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {dateOptions.map((isoDate, i) => {
            return (
              <SelectItem key={i} value={isoDate}>
                {format(new Date(isoDate), 'dd MMMM, yyyy h:mm a')}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { ToastAction } from '../ui/toast';
import { toast } from '../ui/use-toast';

interface AlertDialogScrapingErrorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  retry: () => void;
  errorMessage: string;
}
export const AlertDialogScrapingError: FC<AlertDialogScrapingErrorProps> = ({
  open,
  onOpenChange,
  errorMessage,
  retry,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <span className="text-red-500">Error occurred while Scraping</span>
          </AlertDialogTitle>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Show Details</AccordionTrigger>
              <AccordionContent className="max-h-[200px] overflow-scroll">
                {errorMessage}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={retry}>Retry</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
