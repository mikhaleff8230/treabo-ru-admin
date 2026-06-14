import Layout from '@/components/layouts/admin';
import { formatDate, ProffiError, ProffiPageHeader } from '@/components/proffi-admin/common';
import {
  deleteProffiAdmin,
  getProffiAdmin,
  postProffiAdmin,
  ProffiUser,
  putProffiAdmin,
} from '@/data/proffi-admin';
import { adminOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FormEvent, useEffect, useState } from 'react';

const emptyForm = {
  name: '',
  phone: '+373',
  email: '',
  city: 'Chișinău',
  services: '',
  password: 'Treabo12345',
};

export default function ProffiSpecialists() {
  const [rows, setRows] = useState<ProffiUser[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    getProffiAdmin<ProffiUser[]>('/api/admin/specialists')
      .then(setRows)
      .catch((e) => setError(e.response?.data?.detail || e.message));
  }

  useEffect(load, []);

  function edit(user: ProffiUser) {
    setEditingId(user.id);
    setForm({
      name: user.name || '',
      phone: user.phone || '+373',
      email: user.email || '',
      city: user.city || 'Chișinău',
      services: user.services?.join(', ') || '',
      password: '',
    });
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      role: 'specialist',
      services: form.services
        .split(',')
        .map((service) => service.trim())
        .filter(Boolean),
      password: form.password || undefined,
    };

    try {
      if (editingId) {
        await putProffiAdmin<ProffiUser>(`/api/admin/users/${encodeURIComponent(editingId)}`, payload);
      } else {
        await postProffiAdmin<ProffiUser>('/api/admin/users', payload);
      }
      reset();
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || e.response?.data?.detail || e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Удалить специалиста?')) return;
    await deleteProffiAdmin(`/api/admin/users/${encodeURIComponent(id)}`);
    if (editingId === id) reset();
    load();
  }

  return (
    <>
      <ProffiPageHeader title="Специалисты Treabo" subtitle="Мастера, которые откликаются на заявки." />
      {error ? <ProffiError message={error} /> : null}

      <form onSubmit={submit} className="mb-6 grid gap-3 rounded border border-border-200 bg-light p-5 md:grid-cols-6">
        <input
          className="rounded border border-border-200 px-3 py-2"
          placeholder="Имя"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="rounded border border-border-200 px-3 py-2"
          placeholder="Телефон +373"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <input
          className="rounded border border-border-200 px-3 py-2"
          placeholder="Email, можно пусто"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="rounded border border-border-200 px-3 py-2"
          placeholder="Город"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <input
          className="rounded border border-border-200 px-3 py-2"
          placeholder={editingId ? 'Новый пароль, можно пусто' : 'Пароль'}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required={!editingId}
        />
        <button className="rounded bg-accent px-4 py-2 font-semibold text-light" disabled={saving}>
          {saving ? 'Сохранение...' : editingId ? 'Сохранить' : 'Добавить'}
        </button>
        <input
          className="rounded border border-border-200 px-3 py-2 md:col-span-4"
          placeholder="Услуги через запятую: санузел, плитка, сантехника"
          value={form.services}
          onChange={(e) => setForm({ ...form, services: e.target.value })}
        />
        {editingId ? (
          <button type="button" onClick={reset} className="rounded bg-gray-100 px-4 py-2 font-semibold">
            Отмена
          </button>
        ) : null}
      </form>

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
                <th className="px-4 py-3">Услуги</th>
                <th className="px-4 py-3">Создан</th>
                <th className="px-4 py-3"></th>
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
                  <td className="px-4 py-3">{user.services?.length ? user.services.join(', ') : '-'}</td>
                  <td className="px-4 py-3 text-body">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => edit(user)} className="me-4 text-accent">
                      Редактировать
                    </button>
                    <button type="button" onClick={() => remove(user.id)} className="text-red-600">
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td className="px-4 py-8 text-center text-body" colSpan={8}>
                    Данных пока нет
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

ProffiSpecialists.authenticate = {
  permissions: adminOnly,
};
ProffiSpecialists.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
