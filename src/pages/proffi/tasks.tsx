import Layout from '@/components/layouts/admin';
import { formatDate, ProffiError, ProffiPageHeader, StatusBadge } from '@/components/proffi-admin/common';
import { getProffiAdmin, ProffiTask } from '@/data/proffi-admin';
import { adminOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

export default function ProffiTasks() {
  const [rows, setRows] = useState<ProffiTask[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getProffiAdmin<ProffiTask[]>('/api/admin/tasks')
      .then(setRows)
      .catch((e) => setError(e.response?.data?.detail || e.message));
  }, []);

  return (
    <>
      <ProffiPageHeader title="Заказы Proffi" subtitle="Заявки, созданные заказчиками в приложении." />
      {error ? <ProffiError message={error} /> : null}
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
                  <td className="px-4 py-3">{task.budget ? `${task.budget} ₽` : '-'}</td>
                  <td className="px-4 py-3">{task.applications_count}</td>
                  <td className="px-4 py-3">{task.photos_count}</td>
                  <td className="px-4 py-3 text-body">{formatDate(task.created_at)}</td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td className="px-4 py-8 text-center text-body" colSpan={10}>
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
