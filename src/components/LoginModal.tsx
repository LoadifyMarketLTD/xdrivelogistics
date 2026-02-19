import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Eye, EyeOff, Phone } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            {activeTab === 'login' ? 'Bine ai revenit!' : 'Creează Cont'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {activeTab === 'login'
              ? 'Intră în contul tău XDrive Logistics'
              : 'Înregistrează-te gratuit pe platformă'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="login" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Autentificare
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Înregistrare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Adresă Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nume@exemplu.com"
                className="bg-secondary border-border text-white placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Parolă</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="bg-secondary border-border text-white placeholder:text-muted-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border bg-secondary" />
                <span className="text-muted-foreground">Ține-mă minte</span>
              </label>
              <a href="#" className="text-orange-500 hover:text-orange-400">
                Ai uitat parola?
              </a>
            </div>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-5">
              Intră în Cont
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-white">Adresă Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="nume@exemplu.com"
                className="bg-secondary border-border text-white placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-white">Parolă</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="bg-secondary border-border text-white placeholder:text-muted-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-confirm" className="text-white">Confirmă Parola</Label>
              <Input
                id="reg-confirm"
                type="password"
                placeholder="••••••••"
                className="bg-secondary border-border text-white placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="rounded border-border bg-secondary mt-0.5" />
              <span className="text-muted-foreground">
                Sunt de acord cu{' '}
                <a href="#" className="text-orange-500 hover:text-orange-400">Termenii și Condițiile</a>
                {' '}și{' '}
                <a href="#" className="text-orange-500 hover:text-orange-400">Politica de Confidențialitate</a>
              </span>
            </div>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-5">
              Creează Cont
            </Button>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-2">Ai nevoie de ajutor?</p>
          <a
            href="tel:07423272138"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium"
          >
            <Phone className="w-4 h-4" />
            Sună la 07423 272138
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
