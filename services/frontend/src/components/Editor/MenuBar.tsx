import { Copy, Download, Home, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
import ProjectSettingsDialog from '../ProjectSettingsDialog';
import { ShowEditors } from './ShowEditors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import type { MenuBarProps } from '@/types';
import { Spinner } from '../ui/spinner';
import { Link } from 'react-router';

const MenuBar = (props: MenuBarProps) => {
  const { editors, docData, compileCode, downloadPDF, fetchDocData } = props;

  return (
    <div className="absolute left-0 top-0 right-0 z-10 h-12 px-3 pb-0 grid grid-cols-3 items-center">
      <div className="flex items-center gap-3">
        <Link to={'/'} className="hover:bg-accent p-1.5 rounded-lg">
          <Home size={18} />
        </Link>
        <h1 className="font-medium truncate overflow-hidden text-ellipsis">
          {docData?.name || 'Undefined'}
        </h1>
      </div>
      <div className="flex justify-center gap-2">
        <ButtonGroup>
          <Button
            className="cursor-pointer"
            onClick={() => compileCode.mutate()}
            disabled={compileCode.isPending}
            variant={'outline'}
          >
            {compileCode.isPending && <Spinner data-icon="inline-start" />}
            {compileCode.isPending ? 'Generating...' : 'Generate PDF'}
          </Button>
          <Button onClick={() => downloadPDF.mutate()} variant={'outline'}>
            <Download />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <ProjectSettingsDialog
            docData={docData}
            fetchDocData={fetchDocData}
          />
        </ButtonGroup>
      </div>

      <div className="flex justify-end gap-2">
        <ShowEditors editors={editors} />

        <Dialog>
          <DialogTrigger
            variant={'ghost'}
            className="hover:bg-zinc-100 hover:dark:bg-zinc-800 px-2 rounded-lg"
          >
            <UserPlus className="size-4" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Collaborator</DialogTitle>
              <DialogDescription className="grid grid-cols-1">
                Share this document with others by sending them the link. They
                will be able to edit the document in real-time. But make sure
                visibility is set to public.
              </DialogDescription>
              <p className="mt-5">Share Link</p>
              <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                <code className="relative rounded overflow-scroll scroll bg-muted px-[0.3rem] font-mono text-sm h-fit font-medium">
                  {window.location.href}
                </code>
                <Button
                  variant={'outline'}
                  size={'icon-sm'}
                  onClick={() =>
                    navigator.clipboard.writeText(window.location.href)
                  }
                >
                  <Copy />
                </Button>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MenuBar;
