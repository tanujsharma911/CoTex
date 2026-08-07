import {
  ChevronRightIcon,
  File,
  FileIcon,
  FolderIcon,
  RefreshCcw
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { backendApi } from '@/services/backendApi';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Files = ({ docId }: { docId?: string }) => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const renderItem = (fileItem: string) => {
    const files = fileItem.split('/').filter(Boolean);
    console.log(files);

    if (files.length == 1) {
      return (
        <Button
          key={files[0]}
          variant="link"
          size="sm"
          className="w-full justify-start gap-2 text-foreground"
        >
          <FileIcon />
          <span>{files[0]}</span>
        </Button>
      );
    }
    return (
      <Collapsible key={files[0]}>
        <CollapsibleTrigger
          className={
            'group w-full flex items-center gap-1 transition-none text-sm hover:bg-accent hover:text-accent-foreground'
          }
        >
          <ChevronRightIcon
            size={16}
            className="transition-transform group-data-[state=open]:rotate-90"
          />
          <FolderIcon size={16} />
          {files[0]}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 ml-5 style-lyra:ml-4">
          <div className="flex flex-col gap-1">
            {files.slice(1).map((child) => renderItem(child))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const fileTree = useQuery({
    queryKey: ['file_tree'],
    queryFn: async () => {
      if (!docId) throw new Error('docId is required to fetch file tree');

      const response = await backendApi.getProjectFiles({ docId, token });
      return response.data;
    }
  });

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col gap-1">
        <div className="flex justify-end p-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-lg"
            onClick={async () => {
              queryClient.invalidateQueries({ queryKey: ['file_tree'] });
            }}
          >
            <RefreshCcw size={14} />
          </Button>
        </div>
        {fileTree.data
          ?.sort((a: string, b: string) => b.length - a.length)
          .map((item: string) => renderItem(item))}
      </div>
      <div className="bg-amber-400/20 text-amber-950 text-xs p-1 motion-translate-y-out-100 motion-delay-5000">
        Note: Some of the feature of files are under development
      </div>
    </div>
  );
};

const Provider = ({
  children,
  className,
  docId
}: {
  children: React.ReactNode;
  className: string;
  docId?: string;
}) => {
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  return (
    <div
      className={cn(
        className,
        activeTab ? 'grid-cols-[auto_auto_1fr]' : 'grid-cols-[auto_1fr]'
      )}
    >
      <div className="flex flex-col w-12 items-center gap-2 pt-2">
        <Button
          variant={activeTab === 'files' ? 'secondary' : 'ghost'}
          size="icon-lg"
          onClick={() =>
            setActiveTab((prev) => (prev !== 'files' ? 'files' : undefined))
          }
        >
          <File />
        </Button>
      </div>
      {activeTab && (
        <div className="w-48 border rounded-lg mr-2 overflow-hidden">
          {activeTab === 'files' && <Files docId={docId} />}
        </div>
      )}
      {children}
    </div>
  );
};

const SideBar = {
  Provider
};

export default SideBar;
