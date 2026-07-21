import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import type { editingUser } from "@/types";

function ShowEditors({ users }: { users: editingUser[] }) {
  if (!users || users.length <= 1) {
    return null;
  }
  return (
    <AvatarGroup>
      {users.slice(0, Math.min(3, users.length)).map((user, index: number) => {
        const name = user?.name?.toUpperCase().slice(0, 2) || "NA";
        return (
          <Avatar key={index}>
            <AvatarFallback className="text-zinc-900 dark:text-white">
              {name}
            </AvatarFallback>
          </Avatar>
        );
      })}
      {users.length > 3 && (
        <AvatarGroupCount>{users.length - 3}+</AvatarGroupCount>
      )}
    </AvatarGroup>
  );
}
export { ShowEditors };
