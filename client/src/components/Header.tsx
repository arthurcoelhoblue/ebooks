import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

export default function Header({ onMenuClick, showMenu = false }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logout realizado com sucesso!");
      window.location.href = "/";
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          {showMenu && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <Link href={isAuthenticated ? "/dashboard" : "/"}>
            <a className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/ebookstudio-icon.png" 
                alt="EbookStudio" 
                className="h-10 w-10"
              />
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Ebook
                </span>
                <span className="text-2xl font-bold text-blue-500">
                  Studio
                </span>
              </div>
            </a>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && user && (
            <>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

