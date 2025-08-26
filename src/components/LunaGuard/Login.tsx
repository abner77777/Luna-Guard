import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Car, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useKeyboardAvoid } from '@/hooks/useKeyboardAvoid';

interface LoginProps {
  onLogin: () => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [shakeForm, setShakeForm] = useState(false);
  const { signIn } = useAuth();
  const { isKeyboardVisible, keyboardHeight } = useKeyboardAvoid();

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 500);
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await signIn(email, password);

      if (!result?.error) {
        onLogin();
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-container flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-primary/10">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo and Header */}
        <div className={`text-center space-y-4 transition-all duration-300 ${isKeyboardVisible ? 'scale-90' : 'scale-100'}`}>
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-bounce-in">
            <Car size={40} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Luna-guard
            </h1>
            <p className="text-muted-foreground mt-2">
              Control y monitoreo vehicular inteligente
            </p>
          </div>
        </div>

        {/* Auth Form */}
        <Card className={`card-premium ${shakeForm ? 'animate-shake' : ''}`}>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              Iniciar Sesión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

          </CardContent>
        </Card>

        {/* Features */}
        <div className={`w-full space-y-3 transition-all duration-300 ${isKeyboardVisible ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <h3 className="text-center text-sm font-medium text-muted-foreground">
            Características destacadas
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs justify-items-center">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Monitoreo en tiempo real</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Control remoto</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span>Alertas de seguridad</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span>Historial completo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};