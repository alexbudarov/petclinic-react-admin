import polyglotI18nProvider from 'ra-i18n-polyglot';
import en from 'ra-language-english';
import de from 'ra-language-german';
import {myAddonMessages} from "./addon/myAddonMessages";

const translations = {
    en: {...en, ...myAddonMessages.en},
    de: {...de, ...myAddonMessages.de}
};

export const i18nProvider = polyglotI18nProvider(
  locale => translations[locale],
  'en', // default locale
  [
    { locale: 'en', name: 'English' },
    { locale: 'de', name: 'German' }
  ],
);