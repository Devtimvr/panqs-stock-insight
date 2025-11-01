import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  iconBg?: string;
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, iconBg = "bg-accent" }: MetricCardProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl md:text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`${iconBg} p-3 rounded-xl`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="font-medium">
              {trend === 'up' ? 'Em alta' : trend === 'down' ? 'Em baixa' : 'Estável'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
