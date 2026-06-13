import Input from '@/components/ui/input';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'admin_token';

export default function ProffiAdminTokenField() {
  const [token, setToken] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setToken(window.localStorage.getItem(STORAGE_KEY)?.trim() || '');
  }, []);

  function handleChange(value: string) {
    setToken(value);
    if (typeof window === 'undefined') return;
    if (value.trim()) {
      window.localStorage.setItem(STORAGE_KEY, value.trim());
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  return (
    <div className="mt-6 border-t border-border-200 pt-5">
      <Input
        label="Treabo admin token"
        type="password"
        value={token}
        onChange={(e) => handleChange(e.target.value)}
        variant="outline"
        placeholder="Same as PROFFI_ADMIN_TOKEN on API"
        className="mb-1"
      />
      <p className="text-xs text-body">
        Нужен для раздела Treabo. Должен совпадать с{' '}
        <code className="text-xs">PROFFI_ADMIN_TOKEN</code> в pixer-api.
      </p>
    </div>
  );
}
