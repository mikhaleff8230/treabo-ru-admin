import Layout from '@/components/layouts/admin';
import { ProffiError, ProffiPageHeader } from '@/components/proffi-admin/common';
import { getProffiAdmin, putProffiAdmin, TreaboResponseSettings } from '@/data/proffi-admin';
import { adminOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FormEvent, useEffect, useState } from 'react';

const defaults: TreaboResponseSettings = {
  free_daily_limit: 5,
  default_response_price_mdl: 15,
  is_active: true,
};

export default function TreaboResponseSettingsPage() {
  const [form, setForm] = useState<TreaboResponseSettings>(defaults);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function load() {
    getProffiAdmin<TreaboResponseSettings>('/api/admin/response-settings')
      .then((data) => setForm({ ...defaults, ...data }))
      .catch((e) => setError(e.response?.data?.detail || e.message));
  }

  useEffect(load, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const data = await putProffiAdmin<TreaboResponseSettings>('/api/admin/response-settings', {
        free_daily_limit: Number(form.free_daily_limit || 0),
        default_response_price_mdl: Number(form.default_response_price_mdl || 0),
        is_active: form.is_active,
      });
      setForm({ ...defaults, ...data });
      setSaved(true);
    } catch (e: any) {
      setError(e.response?.data?.message || e.response?.data?.detail || e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ProffiPageHeader
        title="Настройки откликов Treabo"
        subtitle="Здесь задается дневной лимит бесплатных откликов мастера и базовая цена платного отклика."
      />
      {error ? <ProffiError message={error} /> : null}
      {saved ? (
        <div className="mb-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          Настройки сохранены
        </div>
      ) : null}

      <form onSubmit={submit} className="max-w-3xl rounded border border-border-200 bg-light p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-heading">Бесплатных откликов в сутки</span>
            <input
              type="number"
              min={0}
              className="w-full rounded border border-border-200 px-3 py-2"
              value={form.free_daily_limit}
              onChange={(e) => setForm({ ...form, free_daily_limit: Number(e.target.value) })}
            />
            <span className="mt-2 block text-xs text-body">
              По умолчанию 5. После исчерпания лимита будет показан платный попап.
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-heading">Базовая цена отклика, MDL</span>
            <input
              type="number"
              min={0}
              className="w-full rounded border border-border-200 px-3 py-2"
              value={form.default_response_price_mdl}
              onChange={(e) => setForm({ ...form, default_response_price_mdl: Number(e.target.value) })}
            />
            <span className="mt-2 block text-xs text-body">
              Используется как дефолт. У конкретного заказа цена может быть своей.
            </span>
          </label>
        </div>

        <label className="mt-5 flex items-center gap-2 text-sm font-semibold text-heading">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Настройки активны
        </label>

        <button className="mt-6 rounded bg-accent px-5 py-3 font-semibold text-light" disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </form>
    </>
  );
}

TreaboResponseSettingsPage.authenticate = {
  permissions: adminOnly,
};
TreaboResponseSettingsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
