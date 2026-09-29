import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Locale, Persona, UserSettings } from '@bible-app/core';

const SETTINGS_KEY = 'bible_app_settings';

const DEFAULT: UserSettings = {
  locale: 'zh-Hant',
  bibleVersion: 'cuv_trust',
  secondaryLocale: 'en',
  secondaryBibleVersion: 'kjv',
  persona: 'kids',
  remindersEnabled: false,
  reminderHour: 7,
};

interface SettingsContextValue extends UserSettings {
  setLocale: (l: Locale) => void;
  setPersona: (p: Persona) => void;
  toggleBilingual: () => void;
  bilingual: boolean;
  setRemindersEnabled: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((raw) => {
      if (raw) {
        try {
          setSettings({ ...DEFAULT, ...JSON.parse(raw) });
        } catch {
          /* keep default */
        }
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback(async (next: UserSettings) => {
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }, []);

  const setLocale = useCallback(
    (locale: Locale) => persist({ ...settings, locale }),
    [settings, persist]
  );

  const setPersona = useCallback(
    (persona: Persona) => persist({ ...settings, persona }),
    [settings, persist]
  );

  const toggleBilingual = useCallback(() => {
    const hasSecondary = !!settings.secondaryLocale;
    persist({
      ...settings,
      secondaryLocale: hasSecondary ? undefined : 'en',
      secondaryBibleVersion: hasSecondary ? undefined : 'kjv',
    });
  }, [settings, persist]);

  const setRemindersEnabled = useCallback(
    async (remindersEnabled: boolean) => {
      await persist({ ...settings, remindersEnabled });
      if (Platform.OS === 'web') return;
      const { scheduleDailyReminder, cancelReminders } = await import('../notifications/reminders');
      if (remindersEnabled) {
        await scheduleDailyReminder(settings.reminderHour);
      } else {
        await cancelReminders();
      }
    },
    [settings, persist]
  );

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF9F0' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        bilingual: !!settings.secondaryLocale,
        setLocale,
        setPersona,
        toggleBilingual,
        setRemindersEnabled,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
