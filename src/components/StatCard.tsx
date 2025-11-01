import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatCardProps {
  title: string;
  icon: LucideIcon;
  emptyMessage: string;
  actionLabel: string;
  onAction?: () => void;
}

const StatCard = ({ title, icon: Icon, emptyMessage, actionLabel, onAction }: StatCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-sm uppercase tracking-wide">{title}</h3>
        </div>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground mb-4">{emptyMessage}</p>
          <Button 
            variant="outline" 
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={onAction}
          >
            <span className="mr-2">⊕</span>
            {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
