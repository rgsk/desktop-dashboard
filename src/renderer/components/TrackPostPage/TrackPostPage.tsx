import * as cheerio from 'cheerio';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import dashboardApi, { Keys, TrackPost } from 'src/main/api/dashboardApi';
import {
  getLinkedinProfileUrl,
  getLinkedinUsername,
  nonEmptyStringValidation,
} from 'src/main/lib/common';

import { Copy, Printer } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/renderer/components/ui/table';
import useCopyToClipboard from 'src/renderer/hooks/useCopyToClipboard';
import { useTheme } from 'src/renderer/providers/theme-provider';
import GenericForm from '../HomePage/Children/GenericForm';
import {
  AlertDialogScrapingError,
  useLinkedinProfiles,
} from '../LinkedinLeaderboardPage/LinkedinLeaderboardPage';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { toast } from '../ui/use-toast';
interface TrackPostPageProps {}
const TrackPostPage: React.FC<TrackPostPageProps> = ({}) => {
  // const postUrl =
  //   'https://www.linkedin.com/feed/update/urn:li:activity:7198289355516342272/';
  const [postUrl, setPostUrl] = useState<string>();
  const {
    linkedinProfiles: displayedLinkedinProfiles,
    deletedLinkedinProfiles,
  } = useLinkedinProfiles();
  const { copy, copied } = useCopyToClipboard();

  const [trackedPost, setTrackedPost] = useState<TrackPost[string]>();
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const scrapeTrackPost = useCallback(() => {
    setScrapeLoading(true);
    setScrapeAlertError(undefined);
    window.electron.ipcRenderer.sendMessage('trackPost', {
      postUrl: postUrl,
    });
  }, [postUrl]);
  const refetchTrackPost = useCallback(async () => {
    if (postUrl) {
      const trackPost = await dashboardApi.getKey<TrackPost>(Keys.track_post);
      if (trackPost && trackPost[postUrl]) {
        setTrackedPost(trackPost[postUrl]);
      } else {
        scrapeTrackPost();
      }
    }
  }, [postUrl, scrapeTrackPost]);
  useEffect(() => {
    setTrackedPost(undefined);
  }, [postUrl]);
  const [scrapeAlertOpen, setScrapeAlertOpen] = useState(false);
  const [scrapeAlertError, setScrapeAlertError] = useState<string>();
  useEffect(() => {
    refetchTrackPost();
  }, [refetchTrackPost]);

  const { repostsWithQuote, repostsWithoutQuote } = useMemo(() => {
    if (trackedPost?.htmlContent) {
      const $ = cheerio.load(trackedPost.htmlContent);
      const repostsWithQuote: { name: string; username: string }[] = [];
      $('.update-components-actor__name').each((index, element) => {
        const profileLink = $(element).parent().parent().attr('href');
        const name = $(element)
          .children()
          .first()
          .children()
          .first()
          .text()
          .trim();
        if (name !== 'Orangewood' && profileLink) {
          repostsWithQuote.push({
            name,
            username: getLinkedinUsername(profileLink)!,
          });
        }
      });

      const repostsWithoutQuote: { name: string; username: string }[] = [];

      $('a.ember-view').each((index, element) => {
        if (
          $(element).attr('href')?.startsWith('/in/') &&
          !$(element).closest('.update-components-text').length // we don't want the profile links that are tagged that's why this condition is added
        ) {
          const profileLink = $(element).attr('href');
          if (profileLink) {
            const username = profileLink.slice(4, profileLink.length - 1);
            const name = $(element).text();
            repostsWithoutQuote.push({ name, username });
          }
        }
      });

      // console.log({ repostsWithQuote, repostsWithoutQuote });
      return { repostsWithQuote, repostsWithoutQuote };
    }
    return {};
  }, [trackedPost?.htmlContent]);

  const noReposts = useMemo(() => {
    if (
      repostsWithQuote &&
      repostsWithoutQuote &&
      displayedLinkedinProfiles &&
      deletedLinkedinProfiles
    ) {
      const repostsUserNames = new Set([
        ...repostsWithQuote.map((r) => r.username),
        ...repostsWithoutQuote.map((r) => r.username),
      ]);
      const entries: { name: string; username: string }[] = [];
      for (const username in displayedLinkedinProfiles) {
        if (!repostsUserNames.has(username)) {
          entries.push({
            name: displayedLinkedinProfiles[username].name,
            username,
          });
        }
      }
      for (const username in deletedLinkedinProfiles) {
        if (!repostsUserNames.has(username)) {
          entries.push({
            name: deletedLinkedinProfiles[username].name,
            username,
          });
        }
      }
      return entries;
    }
  }, [
    deletedLinkedinProfiles,
    displayedLinkedinProfiles,
    repostsWithQuote,
    repostsWithoutQuote,
  ]);

  useEffect(() => {
    return window.electron.ipcRenderer.on('trackPost', (obj: any) => {
      setScrapeLoading(false);
      if (obj.isError) {
        setScrapeAlertOpen(true);
        setScrapeAlertError(obj.error.message);
      } else {
        refetchTrackPost();
        toast({
          title: 'Post Details Updated',
        });
      }
    });
  }, [refetchTrackPost]);

  const bodyOfMessage = useMemo(() => {
    if (
      !noReposts ||
      !repostsWithQuote ||
      !repostsWithoutQuote ||
      !trackedPost
    ) {
      return;
    }
    const bold = (s: string) => `*${s}*`;
    let entries: string[] = [];
    entries = [
      ...entries,
      bold(`----------------------------`),
      bold(
        `Total Reposts - ${
          repostsWithQuote.length + repostsWithoutQuote.length
        }`,
      ),
      bold(`----------------------------`),
      bold(`Reposts With Quote - ${repostsWithQuote.length}`),
      ...repostsWithQuote.map((row, i) => {
        const rank = bold(`${i + 1}`);
        const name = bold(row.name);

        return `${rank} - ${name}`;
      }),
      bold(`Total Reposts With Quote - ${repostsWithQuote.length}`),
      bold(`----------------------------`),
      bold(`Reposts Without Quote - ${repostsWithoutQuote.length}`),
      ...repostsWithoutQuote.map((row, i) => {
        const rank = bold(`${i + 1}`);
        const name = bold(row.name);

        return `${rank} - ${name}`;
      }),
      bold(`Total Reposts Without Quote - ${repostsWithoutQuote.length}`),
      bold(`----------------------------`),
      bold(`No Reposts - ${noReposts.length}`),
      ...noReposts.map((row, i) => {
        const rank = bold(`${i + 1}`);
        const name = bold(row.name);

        return `${rank} - ${name}`;
      }),
      bold(`Total No Reposts - ${noReposts.length}`),
      bold(`----------------------------`),
    ];

    entries.unshift(
      bold('Linkedin Post Reposts Details'),
      bold(`Post - ${trackedPost.postText}`),
      bold(`Post URL - ${trackedPost.postUrl}`),
      bold(
        `Last Updated At - ${format(
          new Date(trackedPost.updatedAt),
          `HH:mm, dd MMM, yyyy`,
        )}`,
      ),
    );
    return entries.join('\n\n');
  }, [noReposts, repostsWithQuote, repostsWithoutQuote, trackedPost]);
  const title = trackedPost
    ? `Linkedin Post Reposts Details - ${trackedPost.postText} - ${format(
        new Date(trackedPost.updatedAt),
        `HH-mm, dd MMM, yyyy`,
      )}`
    : '';

  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  const renderTable = (rows: typeof repostsWithQuote) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows?.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <TableLink href={getLinkedinProfileUrl(row.username)}>
                  {row.username}
                </TableLink>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  return (
    <div className="py-4 px-4">
      <div>
        <GenericForm
          fieldsConfig={[
            {
              name: 'postUrl',
              label: 'Post URL',
              validation: nonEmptyStringValidation,
            },
          ]}
          createItem={(data) => {
            setPostUrl(data.postUrl);
          }}
        />
      </div>
      <AlertDialogScrapingError
        open={scrapeAlertOpen}
        onOpenChange={(open) => setScrapeAlertOpen(open)}
        errorMessage={scrapeAlertError ?? ''}
        retry={scrapeTrackPost}
      />

      {trackedPost && (
        <div>
          <div className="h-4"></div>
          <Separator />
          <div className="h-4"></div>
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <div>
                <p className="font-medium">Post: </p>
                <p>{trackedPost.postText}</p>
              </div>
              <div>
                <p className="font-medium">Post URL: </p>
                <p>{postUrl}</p>
              </div>
              <div>
                <p className="font-medium">Last Updated At: </p>
                <p>
                  {format(
                    new Date(trackedPost.updatedAt ?? new Date()),
                    `HH:mm, dd MMM, yyyy`,
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="h-4"></div>
          <div className="mt-4 flex gap-4 justify-between">
            <div className="flex gap-4 ">
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
            </div>
            <div className="flex gap-4">
              <Button
                onClick={scrapeTrackPost}
                variant="outline"
                disabled={scrapeLoading}
              >
                <span>Refetch Post Details</span>
              </Button>
            </div>
          </div>
          <div className="h-4"></div>
          {repostsWithQuote && repostsWithoutQuote && (
            <div>
              <p className="text-xl my-4">
                Total Reposts: (
                {repostsWithQuote.length + repostsWithoutQuote.length})
              </p>
              <div>
                <p className="text-xl my-4">
                  Reposts with Quote ({repostsWithQuote.length})
                </p>
                {renderTable(repostsWithQuote)}
              </div>
              <div>
                <p className="text-xl my-4">
                  Reposts without Quote ({repostsWithoutQuote.length})
                </p>
                {renderTable(repostsWithoutQuote)}
              </div>
              <div>
                <p className="text-xl my-4">
                  No Reposts ({noReposts?.length ?? 0})
                </p>
                {renderTable(noReposts)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default TrackPostPage;

export const TableLink = ({
  href,
  children,
}: {
  href: string;
  children: any;
}) => {
  const { theme } = useTheme();
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={clsx(
        'flex items-center gap-4 hover:underline',
        theme === 'dark' ? 'text-[#71b7fb]' : 'text-[#0a66c2]',
      )}
    >
      <span>{children}</span>
    </a>
  );
};
