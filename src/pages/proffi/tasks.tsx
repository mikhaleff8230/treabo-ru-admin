import Layout from '@/components/layouts/admin';
import { formatDate, ProffiError, ProffiPageHeader, StatusBadge } from '@/components/proffi-admin/common';
import { deleteProffiAdmin, getProffiAdmin, postProffiAdmin, ProffiTask, ProffiUser } from '@/data/proffi-admin';
import { adminOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FormEvent, useEffect, useState } from 'react';

type TreaboCategory = {
  id: string;
  name_ru: string;
};

const emptyTaskForm = {
  title: '',
  description: '',
  category: '',
  city: 'Chișinău',
  address: '',
  budget: '',
  response_price_mdl: '15',
  deadline: 'По договоренности',
  customer_id: '',
};

export default function ProffiTasks() {
  const [rows, setRows] = useState<ProffiTask[]>([]);
  const [customers, setCustomers] = useState<ProffiUser[]>([]);
  const [categories, setCategories] = useState<TreaboCategory[]>([]);
  const [form, setForm] = useState(emptyTaskForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function loadTasks() {
    getProffiAdmin<ProffiTask[]>('/api/admin/tasks')
      .then(setRows)
      .catch((e) => setError(e.response?.data?.detail || e.message));
  }

  useEffect(() => {
    loadTasks();
    getProffiAdmin<ProffiUser[]>('/api/admin/customers').then((data) => {
      setCustomers(data);
      setForm((current) => ({ ...current, customer_id: current.customer_id || data[0]?.id || '' }));
    });
    getProffiAdmin<TreaboCategory[]>('/api/admin/categories').then((data) => {
      setCategories(data);
      setForm((current) => ({ ...current, category: current.category || data[0]?.id || '' }));
    });
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await postProffiAdmin<ProffiTask>('/api/admin/tasks', {
        ...form,
        customer_id: Number(form.customer_id),
        budget: form.budget ? Number(form.budget) : null,
        response_price_mdl: form.response_price_mdl ? Number(form.response_price_mdl) : 15,
      });
      setForm({ ...emptyTaskForm, customer_id: form.customer_id, category: form.category, city: form.city });
      loadTasks();
    } catch (e: any) {
      setError(e.response?.data?.message || e.response?.data?.detail || e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Удалить заявку?')) return;
    await deleteProffiAdmin(`/api/admin/tasks/${encodeURIComponent(id)}`);
    loadTasks();
  }

  return (
    <>
      <ProffiPageHeader title="Заказы Treabo" subtitle="Заявки, созданные заказчиками в приложении или вручную из админки." />
      {error ? <ProffiError message={error} /> : null}

      <form onSubmit={submit} className="mb-6 grid gap-3 rounded border border-border-200 bg-light p-5 md:grid-cols-4">
        <input className="rounded border border-border-200 px-3 py-2" placeholder="Название заявки" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <select className="rounded border border-border-200 px-3 py-2" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} required>
          <option value="">Заказчик</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.name} {customer.phone ? `(${customer.phone})` : ''}</option>
          ))}
        </select>
        <select className="rounded border border-border-200 px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
          <option value="">Категория</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name_ru || category.id}</option>
          ))}
        </select>
        <input className="rounded border border-border-200 px-3 py-2" placeholder="Город" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        <input className="rounded border border-border-200 px-3 py-2" placeholder="Адрес" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input className="rounded border border-border-200 px-3 py-2" placeholder="Бюджет MDL" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
        <input className="rounded border border-border-200 px-3 py-2" placeholder="Цена отклика MDL" value={form.response_price_mdl} onChange={(e) => setForm({ ...form, response_price_mdl: e.target.value })} />
        <input className="rounded border border-border-200 px-3 py-2" placeholder="Срок" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        <textarea className="rounded border border-border-200 px-3 py-2 md:col-span-3" placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <button className="rounded bg-accent px-4 py-2 font-semibold text-light" disabled={saving || !customers.length || !categories.length}>
          {saving ? 'Сохранение...' : 'Создать заявку'}
        </button>
      </form>

      <div className="overflow-hidden rounded border border-border-200 bg-light">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-body">
              <tr>
                <th className="px-4 py-3">id</th>
                <th className="px-4 py-3">Заказ</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Заказчик</th>
                <th className="px-4 py-3">Специалист</th>
                <th className="px-4 py-3">Город</th>
                <th className="px-4 py-3">Бюджет</th>
                <th className="px-4 py-3">Отклики</th>
                <th className="px-4 py-3">Фото</th>
                <th className="px-4 py-3">Создан</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((task) => (
                <tr key={task.id} className="border-t border-border-100 align-top">
                  <td className="px-4 py-3 text-body">{task.id}</td>
                  <td className="min-w-[260px] px-4 py-3">
                    <div className="font-medium text-heading">{task.title || '-'}</div>
                    <div className="mt-1 line-clamp-2 text-xs text-body">{task.address || task.description || ''}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge value={task.status} /></td>
                  <td className="px-4 py-3">
                    <div>{task.customer_name || '-'}</div>
                    <div className="text-xs text-body">{task.customer_phone || ''}</div>
                  </td>
                  <td className="px-4 py-3">{task.accepted_specialist_name || '-'}</td>
                  <td className="px-4 py-3">{task.city || '-'}</td>
                  <td className="px-4 py-3">{task.budget ? `${task.budget} MDL` : '-'}</td>
                  <td className="px-4 py-3">{task.applications_count}</td>
                  <td className="px-4 py-3">{task.photos_count}</td>
                  <td className="px-4 py-3 text-body">{formatDate(task.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => remove(task.id)} className="text-red-600">Удалить</button>
                  </td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td className="px-4 py-8 text-center text-body" colSpan={11}>
                    Заказов пока нет
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

ProffiTasks.authenticate = {
  permissions: adminOnly,
};
ProffiTasks.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
