import Layout from '@/components/layouts/admin';
import { formatDate, ProffiError, ProffiPageHeader } from '@/components/proffi-admin/common';
import { getProffiAdmin, postProffiAdmin, ProffiUser } from '@/data/proffi-admin';
import { adminOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FormEvent, useEffect, useState } from 'react';

export default function ProffiCustomers() {
  const [rows, setRows] = useState<ProffiUser[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '+373', email: '', city: 'Chișinău', password: 'Treabo12345' });
  const [saving, setSaving] = useState(false);

  function load() {
    getProffiAdmin<ProffiUser[]>('/api/admin/customers')
      .then(setRows)
      .catch((e) => setError(e.response?.data?.detail || e.message));
  }

  useEffect(load, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await postProffiAdmin<ProffiUser>('/api/admin/users', { ...form, role: 'customer' });
      setForm({ name: '', phone: '+373', email: '', city: form.city, password: 'Treabo12345' });
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || e.response?.data?.detail || e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ProffiPageHeader title="Заказчики Treabo" subtitle="Пользователи приложения с ролью customer." />
      {error ? <ProffiError message={error} /> : null}
      <form onSubmit={submit} className="mb-6 grid gap-3 rounded border border-border-200 bg-light p-5 md:grid-cols-6">
        <input className="rounded border border-border-200 px-3 py-2" placeholder="Имя" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="rounded border border-border-200 px-3 py-2" placeholder="Телефон +373" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input className="rounded border border-border-200 px-3 py-2" placeholder="Email, можно пусто" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="rounded border border-border-200 px-3 py-2" placeholder="Город" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input className="rounded border border-border-200 px-3 py-2" placeholder="Пароль" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="rounded bg-accent px-4 py-2 font-semibold text-light" disabled={saving}>{saving ? 'Сохранение...' : 'Добавить'}</button>
      </form>
      <UsersTable rows={rows} />
    </>
  );
}

function UsersTable({ rows }: { rows: ProffiUser[] }) {
  return (
    <div className="overflow-hidden rounded border border-border-200 bg-light">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-body">
            <tr>
              <th className="px-4 py-3">id</th>
              <th className="px-4 py-3">Имя</th>
              <th className="px-4 py-3">Телефон</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Город</th>
              <th className="px-4 py-3">Создан</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((user) => (
              <tr key={user.id} className="border-t border-border-100">
                <td className="px-4 py-3 text-body">{user.id}</td>
                <td className="px-4 py-3 font-medium text-heading">{user.name || '-'}</td>
                <td className="px-4 py-3">{user.phone || '-'}</td>
                <td className="px-4 py-3">{user.email || '-'}</td>
                <td className="px-4 py-3">{user.city || '-'}</td>
                <td className="px-4 py-3 text-body">{formatDate(user.created_at)}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td className="px-4 py-8 text-center text-body" colSpan={6}>
                  Данных пока нет
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ProffiCustomers.authenticate = {
  permissions: adminOnly,
};
ProffiCustomers.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
