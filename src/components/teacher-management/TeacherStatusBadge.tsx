import { Badge } from "@/components/ui/badge";
import { Clock, Archive, CheckCircle } from "lucide-react";

interface TeacherStatusBadgeProps {
  status: 'active' | 'archived';
  lastActiveAt?: string | null;
  className?: string;
}

const TeacherStatusBadge = ({ status, lastActiveAt, className }: TeacherStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: 'Active',
          className: 'bg-green-100 text-green-800 hover:bg-green-100'
        };
      case 'archived':
        return {
          variant: 'outline' as const,
          icon: Archive,
          text: 'Archived',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: Clock,
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const formatLastActive = (dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const lastActiveText = formatLastActive(lastActiveAt);

  return (
    <div className="flex flex-col gap-1">
      <Badge 
        variant={config.variant} 
        className={`${config.className} ${className} flex items-center gap-1 w-fit`}
      >
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
      {lastActiveText && status !== 'archived' && (
        <span className="text-xs text-gray-500">
          Last active: {lastActiveText}
        </span>
      )}
    </div>
  );
};

export default TeacherStatusBadge;