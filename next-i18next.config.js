const path = require('path');

const defaultLanguage = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'ru';
const availableLanguages = process.env.NEXT_PUBLIC_AVAILABLE_LANGUAGES || 'ru';

const isMultilangEnable =
  process.env.NEXT_PUBLIC_ENABLE_MULTI_LANG === 'true' &&
  !!availableLanguages;

function generateLocales() {
  if (isMultilangEnable) {
    return availableLanguages.split(',').map((l) => l.trim()).filter(Boolean);
  }

  return [defaultLanguage];
}

module.exports = {
  i18n: {
    defaultLocale: defaultLanguage,
    locales: generateLocales(),
    localeDetection: isMultilangEnable,
  },
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
