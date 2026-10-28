import { useEffect, useState } from 'react';
import PublicSite from '@/components/PublicSite';
import AdminApp from '@/admin/AdminApp';

function getRoute(): 'public' | 'admin' {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  return pathname === '/acesso-admin' ? 'admin' : 'public';
}

function App() {
  const [route, setRoute] = useState<'public' | 'admin'>(getRoute());

  useEffect(() => {
    const onPop = () => setRoute(getRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (route === 'admin') {
    return <AdminApp />;
  }
  return <PublicSite />;
}

export default App;
