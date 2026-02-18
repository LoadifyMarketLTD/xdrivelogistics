import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Eye, EyeOff, Phone, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (signInError) throw signInError;

      if (data.user) {
        // Success!
        setSuccess('Autentificare reușită! Bine ai revenit!');
        setLoginEmail('');
        setLoginPassword('');
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Autentificare eșuată. Verifică email-ul și parola.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (registerPassword !== registerConfirmPassword) {
      setError('Parolele nu coincid');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        setSuccess('Contul a fost creat! Verifică email-ul pentru confirmare.');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
        
        // Switch to login tab after 3 seconds
        setTimeout(() => {
          setActiveTab('login');
          setSuccess(null);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Înregistrare eșuată. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

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

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-500">{success}</p>
          </div>
        )}

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
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Adresă Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nume@exemplu.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
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
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-5"
              >
                {loading ? 'Se încarcă...' : 'Intră în Cont'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-white">Adresă Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="nume@exemplu.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
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
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={6}
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
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  required
                  className="bg-secondary border-border text-white placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex items-start gap-2 text-sm">
                <input type="checkbox" required className="rounded border-border bg-secondary mt-0.5" />
                <span className="text-muted-foreground">
                  Sunt de acord cu{' '}
                  <a href="#" className="text-orange-500 hover:text-orange-400">Termenii și Condițiile</a>
                  {' '}și{' '}
                  <a href="#" className="text-orange-500 hover:text-orange-400">Politica de Confidențialitate</a>
                </span>
              </div>
              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-5"
              >
                {loading ? 'Se creează...' : 'Creează Cont'}
              </Button>
            </form>
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
