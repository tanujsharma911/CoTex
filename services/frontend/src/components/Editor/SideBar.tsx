import { ChevronRightIcon, File, FileIcon, FolderIcon } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type FileTreeItem = { name: string } | { name: string; items: FileTreeItem[] };

const Files = () => {
  const fileTree: FileTreeItem[] = [
    {
      name: 'components',
      items: [
        {
          name: 'ui',
          items: [
            { name: 'button.tsx' },
            { name: 'card.tsx' },
            { name: 'dialog.tsx' },
            { name: 'input.tsx' },
            { name: 'select.tsx' },
            { name: 'table.tsx' }
          ]
        },
        { name: 'login-form.tsx' },
        { name: 'register-form.tsx' }
      ]
    },
    {
      name: 'lib',
      items: [{ name: 'utils.ts' }, { name: 'cn.ts' }, { name: 'api.ts' }]
    },
    {
      name: 'hooks',
      items: [
        { name: 'use-media-query.ts' },
        { name: 'use-debounce.ts' },
        { name: 'use-local-storage.ts' }
      ]
    },
    {
      name: 'types',
      items: [{ name: 'index.d.ts' }, { name: 'api.d.ts' }]
    },
    {
      name: 'public',
      items: [{ name: 'favicon.ico' }, { name: 'logo.svg' }, { name: 'images' }]
    },
    { name: 'app.tsx' },
    { name: 'layout.tsx' },
    { name: 'globals.css' },
    { name: 'package.json' },
    { name: 'tsconfig.json' },
    { name: 'README.md' },
    { name: '.gitignore' }
  ];
  const renderItem = (fileItem: FileTreeItem) => {
    if ('items' in fileItem) {
      return (
        <Collapsible key={fileItem.name}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="group w-full justify-start transition-none hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronRightIcon className="transition-transform group-data-[state=open]:rotate-90" />
              <FolderIcon />
              {fileItem.name}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 ml-5 style-lyra:ml-4">
            <div className="flex flex-col gap-1">
              {fileItem.items.map((child) => renderItem(child))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }
    return (
      <Button
        key={fileItem.name}
        variant="link"
        size="sm"
        className="w-full justify-start gap-2 text-foreground"
      >
        <FileIcon />
        <span>{fileItem.name}</span>
      </Button>
    );
  };

  return (
    <div className="flex flex-col gap-1 border rounded-lg mr-2">
      Files
      {fileTree.map((item) => renderItem(item))}
    </div>
  );
};

const SideBar = ({ setActiveTab }) => {
  return (
    <div className="flex flex-col items-center gap-2 pt-2">
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

const Provider = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  return (
    <div
      className={cn(
        'grid h-[calc(100vh-48px)]',
        activeTab != undefined
          ? 'grid-cols-[46px_200px_1fr]'
          : 'grid-cols-[46px_1fr]'
      )}
    >
      <SideBar setActiveTab={setActiveTab} />
      {activeTab === 'files' && <Files />}
      {children}
    </div>
  );
};

SideBar.Provider = Provider;

export default SideBar;
