
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface RoleSelectorProps {
  roles: string[];
  setRoles: (roles: string[]) => void;
}

export const RoleSelector = ({ roles, setRoles }: RoleSelectorProps) => {
  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setRoles([...roles, role]);
    } else {
      setRoles(roles.filter(r => r !== role));
    }
  };

  return (
    <div className="space-y-2">
      <Label>Roles</Label>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="teacher"
            checked={roles.includes("teacher")}
            onCheckedChange={(checked) => handleRoleChange("teacher", checked as boolean)}
          />
          <Label htmlFor="teacher">Teacher</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="admin"
            checked={roles.includes("admin")}
            onCheckedChange={(checked) => handleRoleChange("admin", checked as boolean)}
          />
          <Label htmlFor="admin">Admin</Label>
        </div>
      </div>
    </div>
  );
};
