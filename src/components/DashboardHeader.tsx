import { Calendar } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Calendar className="h-4 w-4" />
        <span className="text-sm capitalize">{currentDate}</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold">
        {getGreeting()}, {userName}! 👋
      </h1>
      <p className="text-muted-foreground mt-2">
        Tudo sob controle por aí? Aqui está o status da operação até agora:
      </p>
    </div>
  );
};

export default DashboardHeader;
