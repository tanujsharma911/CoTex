import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount
} from '@/components/ui/avatar';
import type { editingUser } from '@cotex/types';

function ShowEditors({ editors }: { editors: editingUser[] }) {
  if (!editors || editors.length <= 1) {
    return null;
  }
  return (
    <AvatarGroup>
      {editors
        .slice(0, Math.min(3, editors.length))
        .map((user, index: number) => {
          const name = user?.name?.toUpperCase().slice(0, 2) || 'NA';
          return (
            <Avatar key={index}>
              <AvatarFallback className="text-foreground">
                {name}
              </AvatarFallback>
            </Avatar>
          );
        })}
      {editors.length > 3 && (
        <AvatarGroupCount>{editors.length - 3}+</AvatarGroupCount>
      )}
    </AvatarGroup>
  );
}
export { ShowEditors };
