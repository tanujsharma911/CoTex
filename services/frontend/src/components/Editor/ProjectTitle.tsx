import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { PenLine, PenOff, Save } from "lucide-react";
import { Input } from "../ui/input";
import type { docType } from "@/types";
import { toast } from "sonner";
import { backendApi } from "@/services/backendApi";
import { useAuthStore } from "@/store/useAuthStore";

const ProjectTitle = ({
  docId,
  docData,
}: {
  docId: string;
  docData?: docType;
}) => {
  const { token } = useAuthStore();

  const [projectName, setProjectName] = useState<string>(
    docData?.name || "Undefined",
  );
  const [editingProjectName, setIsEditingProjectName] =
    useState<boolean>(false);

  const updateDocData = async (data: Partial<docType>) => {
    if (!token) return;
    if (!docId) return;

    try {
      await backendApi.updateDoc({
        token,
        docId,
        data,
      });
      toast.success("Document updated successfully");
      setIsEditingProjectName(false);
    } catch (error) {
      console.log("Update document error:", error);
      toast.error("Failed to update document");
    }
  };

  useEffect(() => {
    if (docData?.name) {
      setProjectName(docData.name);
    }
  }, [docData]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={"ghost"}
        size="icon-sm"
        className="mx-0"
        onClick={() => setIsEditingProjectName((prev) => !prev)}
      >
        {editingProjectName ? <PenOff className="" /> : <PenLine />}
      </Button>
      {editingProjectName ? (
        <div className="flex items-center gap-2">
          <Input
            className="text-xl"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <Button onClick={() => updateDocData({ name: projectName })}>
            <Save />
          </Button>
        </div>
      ) : (
        <h1 className="font-medium truncate overflow-hidden text-ellipsis">
          {projectName}
        </h1>
      )}
    </div>
  );
};

export { ProjectTitle };
