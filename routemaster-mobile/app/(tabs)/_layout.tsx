import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
        }
      }}>
      
      {/* 1. SOLDA: ANA SAYFA */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />

      {/* 2. ORTADA: YENİ ROTA (GEZİ EKLEME) */}
      <Tabs.Screen
        name="create"
        options={{
          title: 'Yeni Rota',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>➕</Text>,
        }}
      />

      {/* 3. SAĞDA: PROFİL */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />

      {/* GİZLİ EKRAN: explore.tsx (Eğer kullanılmıyorsa alt menüde çıkmasını engeller) */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />

    </Tabs>
  );
}
