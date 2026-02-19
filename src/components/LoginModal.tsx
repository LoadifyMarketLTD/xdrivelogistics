import { useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Eye, EyeOff, Phone } from 'lucide-react';
import { type AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

function isApiKeyError(error: AuthError): boolean {
  return error.message != null && error.message.toLowerCase().includes('api key')
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Handle login submission
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    if (!isSupabaseConfigured) {
      window.location.href = '/login';
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        if (isApiKeyError(error)) {
          window.location.href = '/login';
          return;
        }
        setLoginError(error.message || 'Email sau parolă greșită. Vă rugăm să încercați din nou.');
      } else if (data.user) {
        // Successfully logged in - close modal and show success
        onClose();
        // Note: In production, use proper routing (React Router or Next.js router)
        // For now, redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setLoginError('A apărut o eroare. Vă rugăm să încercați din nou.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle registration submission
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterLoading(true);

    if (!isSupabaseConfigured) {
      window.location.href = '/register';
      return;
    }

    // Validation
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Parolele nu se potrivesc.');
      setRegisterLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError('Parola trebuie să aibă cel puțin 6 caractere.');
      setRegisterLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
      });

      if (error) {
        if (isApiKeyError(error)) {
          window.location.href = '/register';
          return;
        }
        setRegisterError(error.message || 'A apărut o eroare la înregistrare.');
      } else if (data.user) {
        setRegisterSuccess('Contul a fost creat cu succes! Verificați emailul pentru confirmare.');
        // Clear form
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
      }
    } catch (err) {
      setRegisterError('A apărut o eroare. Vă rugăm să încercați din nou.');
    } finally {
      setRegisterLoading(false);
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
                  className="bg-secondary border-border text-white placeholder:text-muted-foreground"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={loginLoading}
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={loginLoading}
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
                <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="remember-me" className="rounded border-border bg-secondary" />
                  <span className="text-muted-foreground">Ține-mă minte</span>
                </label>
                <a href="#" className="text-orange-500 hover:text-orange-400">
                  Ai uitat parola?
                </a>
              </div>
              {loginError && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                  {loginError}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-5"
                disabled={loginLoading}
              >
                {loginLoading ? 'Se încarcă...' : 'Intră în Cont'}
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
                  className="bg-secondary border-border text-white placeholder:text-muted-foreground"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  disabled={registerLoading}
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
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    disabled={registerLoading}
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
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  required
                  disabled={registerLoading}
                />
              </div>
              <div className="flex items-start gap-2 text-sm">
                <input type="checkbox" id="terms-accept" className="rounded border-border bg-secondary mt-0.5" required />
                <label htmlFor="terms-accept" className="text-muted-foreground">
                  Sunt de acord cu{' '}
                  <a href="#" className="text-orange-500 hover:text-orange-400">Termenii și Condițiile</a>
                  {' '}și{' '}
                  <a href="#" className="text-orange-500 hover:text-orange-400">Politica de Confidențialitate</a>
                </label>
              </div>
              {registerError && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                  {registerError}
                </div>
              )}
              {registerSuccess && (
                <div className="p-3 rounded-md bg-green-500/10 border border-green-500/50 text-green-500 text-sm">
                  {registerSuccess}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-5"
                disabled={registerLoading}
              >
                {registerLoading ? 'Se creează contul...' : 'Creează Cont'}
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
