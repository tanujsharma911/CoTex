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
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { backendApi } from '@/services/backendApi';
import { useAuthStore } from '@/store/useAuthStore';
import { useMutation } from '@tanstack/react-query';

const Files = ({ docId }: { docId: string }) => {
  const [fileTree, setFileTree] = useState<string[]>([]);
  const { token } = useAuthStore();

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

  const getFileTree = useMutation({
    mutationFn: async () => {
      const response = await backendApi.getProjectFiles({ docId, token });
      return response.data;
    },
    onSuccess: (data) => {
      setFileTree(data);
    },
    onError: (error) => {
      console.error('Get File Tree ::', error);
      //TODO: Proper error handling
    }
  });

  useEffect(() => {
    getFileTree.mutate();
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-end px-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-lg"
          onClick={async () => {
            getFileTree.mutate();
          }}
        >
          <RefreshCcw size={14} />
        </Button>
      </div>
      {fileTree
        .sort((a, b) => b.length - a.length)
        .map((item) => renderItem(item))}
    </div>
  );
};

const Triggers = ({ setActiveTab }) => {
  return (
    <div className="flex flex-col w-12 items-center gap-2 pt-2">
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={() =>
          setActiveTab((prev) => (prev !== 'files' ? 'files' : undefined))
        }
      >
        <File />
      </Button>
    </div>
  );
};

const Provider = ({ children, className, docId }) => {
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  return (
    <div
      className={cn(
        className,
        activeTab ? 'grid-cols-[auto_auto_1fr]' : 'grid-cols-[auto_1fr]'
      )}
    >
      <Triggers setActiveTab={setActiveTab} />
      {activeTab && (
        <div className="w-48 p-1 border rounded-lg mr-2">
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
