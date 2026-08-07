import { Settings } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from './ui/field';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useEffect, useState } from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { backendApi } from '@/services/backendApi';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import type { UseMutationResult } from '@tanstack/react-query';
import type { docType } from '@cotex/types';

const ProjectSettingsDialog = ({
  docData,
  fetchDocData
}: {
  docData?: docType;
  fetchDocData: UseMutationResult<any, any, void, unknown>;
}) => {
  const { token } = useAuthStore();

  const [projectName, setProjectName] = useState<string>(
    docData?.name || 'Undefined'
  );
  const [access, setAccess] = useState<string>('public');
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token || !docData) return;

    setLoading(true);
    try {
      await backendApi.updateDoc({
        token,
        docId: docData._id.toString(),
        data: {
          name: projectName,
          visibility: access
        } as Partial<docType>
      });

      toast.success('Document updated successfully');
      setOpenDialog(false);
      fetchDocData.mutate();
    } catch (error) {
      console.log('Update document error:', error);
      toast.error('Failed to update document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setProjectName(docData?.name || 'Undefined');
    setAccess(docData?.visibility || 'public');
  }, [docData]);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger variant={'outline'}>
        <Settings className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription className="grid grid-cols-1">
            Edit project settings like name and visibility.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </Field>
            <Label htmlFor="access">Access</Label>
            <RadioGroup
              name="access"
              value={access}
              onValueChange={setAccess}
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
          <Button type="submit" disabled={loading} className="mt-5">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSettingsDialog;
