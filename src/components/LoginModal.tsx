import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Truck, Phone } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const handleSignIn = () => {
    onClose();
    window.location.href = '/login';
  };

  const handleRegister = () => {
    onClose();
    window.location.href = '/register';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            XDrive Logistics
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Sign in or create an account to access the platform
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-5"
            onClick={handleSignIn}
          >
            Sign In
          </Button>
          <Button
            variant="outline"
            className="w-full font-semibold py-5 border-border text-white hover:bg-secondary"
            onClick={handleRegister}
          >
            Create Account
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-2">Need help?</p>
          <a
            href="tel:07423272138"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium"
          >
            <Phone className="w-4 h-4" />
            Call 07423 272138
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
