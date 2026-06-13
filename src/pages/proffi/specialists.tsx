import Layout from '@/components/layouts/admin';
import { formatDate, ProffiError, ProffiPageHeader } from '@/components/proffi-admin/common';
import { getProffiAdmin, ProffiUser } from '@/data/proffi-admin';
import { adminOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

export default function ProffiSpecialists() {
  const [rows, setRows] = useState<ProffiUser[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getProffiAdmin<ProffiUser[]>('/api/admin/specialists')
      .then(setRows)
      .catch((e) => setError(e.response?.data?.detail || e.message));
  }, []);

  return (
    <>
      <ProffiPageHeader title="Специалисты Treabo" subtitle="Пользователи приложения с ролью store_owner/specialist." />
      {error ? <ProffiError message={error} /> : null}
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
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td className="px-4 py-8 text-center text-body" colSpan={7}>
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
