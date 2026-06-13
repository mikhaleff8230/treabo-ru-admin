import Layout from '@/components/layouts/admin';
import { ProffiError, ProffiPageHeader } from '@/components/proffi-admin/common';
import { deleteProffiAdmin, getProffiAdmin, postProffiAdmin } from '@/data/proffi-admin';
import { adminOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FormEvent, useEffect, useState } from 'react';

type TreaboCategory = {
  id: string;
  icon?: string | null;
  name_ru: string;
  name_ro: string;
};

const emptyForm = {
  id: '',
  icon: 'MoreHorizontal',
  name_ru: '',
  name_ro: '',
};

export default function TreaboCategories() {
  const [rows, setRows] = useState<TreaboCategory[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    getProffiAdmin<TreaboCategory[]>('/api/admin/categories')
      .then(setRows)
      .catch((e) => setError(e.response?.data?.detail || e.message));
  }

  useEffect(load, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await postProffiAdmin<TreaboCategory>('/api/admin/categories', form);
      setForm(emptyForm);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || e.response?.data?.detail || e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Удалить категорию?')) return;
    await deleteProffiAdmin(`/api/admin/categories/${encodeURIComponent(id)}`);
    load();
  }

  return (
    <>
      <ProffiPageHeader title="Категории Treabo" subtitle="Базовые категории услуг для заявок, AI и фильтров." />
      {error ? <ProffiError message={error} /> : null}

      <form onSubmit={submit} className="mb-6 grid gap-3 rounded border border-border-200 bg-light p-5 md:grid-cols-5">
        <input className="rounded border border-border-200 px-3 py-2" placeholder="slug" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} required />
        <input className="rounded border border-border-200 px-3 py-2" placeholder="Иконка" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
        <input className="rounded border border-border-200 px-3 py-2" placeholder="Название RU" value={form.name_ru} onChange={(e) => setForm({ ...form, name_ru: e.target.value })} required />
        <input className="rounded border border-border-200 px-3 py-2" placeholder="Denumire RO" value={form.name_ro} onChange={(e) => setForm({ ...form, name_ro: e.target.value })} required />
        <button className="rounded bg-accent px-4 py-2 font-semibold text-light" disabled={saving}>
          {saving ? 'Сохранение...' : 'Добавить'}
        </button>
      </form>

      <div className="overflow-hidden rounded border border-border-200 bg-light">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-body">
            <tr>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Иконка</th>
              <th className="px-4 py-3">RU</th>
              <th className="px-4 py-3">RO</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border-100">
                <td className="px-4 py-3 font-medium text-heading">{row.id}</td>
                <td className="px-4 py-3">{row.icon || '-'}</td>
                <td className="px-4 py-3">{row.name_ru}</td>
                <td className="px-4 py-3">{row.name_ro}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(row.id)} className="text-red-600">Удалить</button>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td className="px-4 py-8 text-center text-body" colSpan={5}>Категорий пока нет</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

TreaboCategories.authenticate = {
  permissions: adminOnly,
};
TreaboCategories.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
