import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { FileDown, Trash } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { backendApi } from '@/services/backendApi';
import type { docType } from '@/types';
import { downloadFile, generatePDF } from '@/lib/pdf';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const Projects = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);

  const { data: docs, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['docs'],
    queryFn: () => {
      if (!token) return;

      return backendApi
        .getDocs(token)
        .then((res) =>
          res.data
            .sort(
              (a: docType, b: docType) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            )
            .filter((doc: docType) => !doc.deleted)
        ) as Promise<docType[]>;
    }
  });

  const deleteProject = useMutation({
    mutationFn: (docId: string) => {
      return backendApi.deleteDoc({ token, docId });
    },
    onSuccess: () => {
      toast.success('Deleted Successfully');
      queryClient.invalidateQueries({ queryKey: ['docs'] });
    }
  });

  const createProject = useMutation({
    mutationFn: ({
      token,
      name,
      visibility
    }: {
      token?: string;
      name: string;
      visibility: 'private' | 'public';
    }) => {
      return backendApi.createDoc({
        token,
        name: name,
        visibility: visibility
      });
    },
    onSuccess: () => {
      setOpenDialog(false);
      queryClient.invalidateQueries({ queryKey: ['docs'] });
    }
  });

  const downloadPDF = useMutation({
    mutationFn: (docId: string) => {
      return backendApi.compileDoc({
        token,
        docId
      });
    },
    onSuccess: (response, docId) => {
      const pdfBuffer = response.data.pdf.data;

      const uint8Array = new Uint8Array(pdfBuffer);

      const url = generatePDF(uint8Array);

      if (!url) {
        toast.error('Failed to generate PDF URL');
        return;
      }

      downloadFile(url, `project-${docId}.pdf`);
    }
  });

  return (
    <div className="w-full max-w-300 mx-auto mt-10">
      <div className="px-4 flex justify-between items-center">
        <h1 className="scroll-m-20 text-center text-2xl font-heading tracking-tight text-balance">
          Your Projects
        </h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger>Create Project</DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                const data = Object.fromEntries(formData.entries());

                createProject.mutate({
                  token,
                  name: data.name as string,
                  visibility: data.access as 'private' | 'public'
                });
              }}
            >
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>
                  Enter the project name and select the access level for your
                  project.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup className="pb-5">
                <Field>
                  <Label htmlFor="name">Project Name</Label>
                  <Input id="name" name="name" defaultValue="New Project" />
                </Field>
                <Label htmlFor="access">Access</Label>
                <RadioGroup
                  name="access"
                  defaultValue="public"
                  className="w-fit"
                >
                  <Field orientation="horizontal">
                    <RadioGroupItem value="public" id="r1" />
                    <FieldContent>
                      <FieldLabel htmlFor="r1">Public</FieldLabel>
                      <FieldDescription>
                        Anyone with the link can edit this project.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                  <Field orientation="horizontal">
                    <RadioGroupItem value="private" id="r2" />
                    <FieldContent>
                      <FieldLabel htmlFor="r2">Private</FieldLabel>
                      <FieldDescription>
                        Only you can view and edit this project.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </RadioGroup>
              </FieldGroup>
              <DialogFooter>
                <DialogClose>Cancel</DialogClose>
                <Button type="submit" disabled={createProject.isPending}>
                  {createProject.isPending ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Creating...
                    </>
                  ) : (
                    <>Create</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoadingDocs && <>Loading Projects</>}
      {docs && docs.length > 0 && (
        <>
          <ul className="mt-5">
            {docs.map((doc, index) => {
              return (
                <div key={doc._id}>
                  <li className="p-4 flex justify-between items-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                    <div className="flex flex-col justify-center">
                      <Link
                        to={`/edit/${doc._id}`}
                        className="text-xl transition-all flex items-center gap-4"
                      >
                        {doc.name}
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          {doc.visibility}
                        </Badge>
                      </Link>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        onClick={() => downloadPDF.mutate(doc._id)}
                        disabled={downloadPDF.isPending}
                      >
                        {downloadPDF.isPending ? (
                          <Spinner data-icon="inline-start" />
                        ) : (
                          <FileDown />
                        )}
                      </Button>

                      <Button
                        onClick={() => deleteProject.mutate(doc._id)}
                        variant="ghost"
                        disabled={deleteProject.isPending}
                      >
                        {deleteProject.isPending ? (
                          <Spinner data-icon="inline-start" />
                        ) : (
                          <Trash />
                        )}
                      </Button>
                    </div>
                  </li>
                  {index !== docs.length - 1 && <Separator />}
                </div>
              );
            })}
          </ul>

          <p className="text-center mt-10 text-muted-foreground">
            Showing {docs.length} of {docs.length} projects
          </p>
        </>
      )}
      {docs != undefined && docs?.length === 0 && (
        <p className="text-center text-muted-foreground mt-20">
          No projects found.
        </p>
      )}
    </div>
  );
};

export default Projects;
