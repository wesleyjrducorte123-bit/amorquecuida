import { useState } from 'react';
import { Heart, Loader2, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function AdminLogin() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(error);
      } else {
        const { error, needsProfile } = await signUp(email, password);
        if (error) setError(error);
        else if (needsProfile) {
          setInfo(
            'Conta criada, mas ainda não é administradora. Peça a um administrador existente para conceder acesso, ou crie a primeira conta quando nenhum admin existir.'
          );
        } else {
          setInfo('Conta criada e promovida a administradora. Faça login para continuar.');
          setMode('login');
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 shadow-lg">
            <Heart className="h-6 w-6 fill-white text-white" />
          </span>
          <h1 className="text-xl font-bold">Painel Administrativo</h1>
          <p className="text-sm text-white/60">Salve Africa — CMS</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-2xl">
          <div className="mb-4 flex rounded-lg bg-stone-100 p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                mode === 'login' ? 'bg-white text-stone-900 shadow' : 'text-stone-500'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                mode === 'signup' ? 'bg-white text-stone-900 shadow' : 'text-stone-500'
              }`}
            >
              Criar conta
            </button>
          </div>

          {mode === 'signup' && (
            <p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
              A primeira conta criada torna-se automaticamente administradora.
              Contas seguintes precisam ser aprovadas por um admin existente.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                placeholder="admin@exemplo.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                Senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-sm text-rose-600">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-lg bg-emerald-50 p-2 text-xs text-emerald-700">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-white/40">
          Acesso restrito a administradores autorizados.
        </p>
      </div>
    </div>
  );
}
