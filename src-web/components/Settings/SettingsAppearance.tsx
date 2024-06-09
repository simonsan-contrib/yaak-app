import React from 'react';
import { useActiveWorkspace } from '../../hooks/useActiveWorkspace';
import { useResolvedAppearance } from '../../hooks/useResolvedAppearance';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
import { useSettings } from '../../hooks/useSettings';
import { useThemes } from '../../hooks/useThemes';
import { useUpdateSettings } from '../../hooks/useUpdateSettings';
import { trackEvent } from '../../lib/analytics';
import { clamp } from '../../lib/clamp';
import { isThemeDark } from '../../lib/theme/window';
import type { ButtonProps } from '../core/Button';
import { Checkbox } from '../core/Checkbox';
import { Editor } from '../core/Editor';
import type { IconProps } from '../core/Icon';
import { Icon } from '../core/Icon';
import { IconButton } from '../core/IconButton';
import type { SelectProps } from '../core/Select';
import { Select } from '../core/Select';
import { Separator } from '../core/Separator';
import { HStack, VStack } from '../core/Stacks';

const fontSizes = [
  8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
].map((n) => ({ label: `${n}`, value: `${n}` }));

const buttonColors: ButtonProps['color'][] = [
  'primary',
  'info',
  'success',
  'notice',
  'warning',
  'danger',
  'secondary',
  'default',
];

const icons: IconProps['icon'][] = [
  'info',
  'box',
  'update',
  'alert',
  'arrowBigRightDash',
  'download',
  'copy',
  'magicWand',
  'settings',
  'trash',
  'sparkles',
  'pencil',
  'paste',
  'search',
  'sendHorizontal',
];

export function SettingsAppearance() {
  const workspace = useActiveWorkspace();
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const appearance = useResolvedAppearance();
  const { themes } = useThemes();
  const activeTheme = useResolvedTheme();

  if (settings == null || workspace == null) {
    return null;
  }

  const lightThemes: SelectProps<string>['options'] = themes
    .filter((theme) => !isThemeDark(theme))
    .map((theme) => ({
      label: theme.name,
      value: theme.id,
    }));

  const darkThemes: SelectProps<string>['options'] = themes
    .filter((theme) => isThemeDark(theme))
    .map((theme) => ({
      label: theme.name,
      value: theme.id,
    }));

  return (
    <VStack space={2} className="mb-4">
      <Select
        size="sm"
        name="interfaceFontSize"
        label="Font Size"
        labelPosition="left"
        value={`${settings.interfaceFontSize}`}
        options={fontSizes}
        onChange={(v) => updateSettings.mutate({ interfaceFontSize: parseInt(v) })}
      />
      <Select
        size="sm"
        name="editorFontSize"
        label="Editor Font Size"
        labelPosition="left"
        value={`${settings.editorFontSize}`}
        options={fontSizes}
        onChange={(v) => updateSettings.mutate({ editorFontSize: clamp(parseInt(v) || 14, 8, 30) })}
      />
      <Checkbox
        checked={settings.editorSoftWrap}
        title="Wrap Editor Lines"
        onChange={(editorSoftWrap) => updateSettings.mutate({ editorSoftWrap })}
      />

      <Separator className="my-4" />

      <Select
        name="appearance"
        label="Appearance"
        labelPosition="top"
        size="sm"
        value={settings.appearance}
        onChange={(appearance) => {
          trackEvent('appearance', 'update', { appearance });
          updateSettings.mutateAsync({ appearance });
        }}
        options={[
          { label: 'Automatic', value: 'system' },
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ]}
      />
      <HStack space={2}>
        {(settings.appearance === 'system' || settings.appearance === 'light') && (
          <Select
            hideLabel
            leftSlot={<Icon icon="sun" />}
            name="lightTheme"
            label="Light Theme"
            size="sm"
            className="flex-1"
            value={activeTheme.light.id}
            options={lightThemes}
            onChange={(themeLight) => {
              trackEvent('theme', 'update', { theme: themeLight, appearance: 'light' });
              updateSettings.mutateAsync({ ...settings, themeLight });
            }}
          />
        )}
        {(settings.appearance === 'system' || settings.appearance === 'dark') && (
          <Select
            hideLabel
            name="darkTheme"
            className="flex-1"
            label="Dark Theme"
            leftSlot={<Icon icon="moon" />}
            size="sm"
            value={activeTheme.dark.id}
            options={darkThemes}
            onChange={(themeDark) => {
              trackEvent('theme', 'update', { theme: themeDark, appearance: 'dark' });
              updateSettings.mutateAsync({ ...settings, themeDark });
            }}
          />
        )}
      </HStack>

      <VStack
        space={3}
        className="mt-3 w-full bg-background p-3 border border-dashed border-background-highlight rounded overflow-x-auto"
      >
        <HStack className="text-fg font-bold" space={2}>
          Theme Preview{' '}
          <Icon icon={appearance === 'dark' ? 'moon' : 'sun'} className="text-fg-subtle" />
        </HStack>
        <HStack space={1.5} className="w-full">
          {buttonColors.map((c, i) => (
            <IconButton
              key={c}
              color={c}
              size="2xs"
              iconSize="xs"
              icon={icons[i % icons.length]!}
              iconClassName="text-fg"
              title={`${c}`}
            />
          ))}
          {buttonColors.map((c, i) => (
            <IconButton
              key={c}
              color={c}
              variant="border"
              size="2xs"
              iconSize="xs"
              icon={icons[i % icons.length]!}
              iconClassName="text-fg"
              title={`${c}`}
            />
          ))}
        </HStack>
        <Editor
          defaultValue={[
            'let foo = { // Demo code editor',
            '  foo: ("bar" || "baz" ?? \'qux\'),',
            '  baz: [1, 10.2, null, false, true],',
            '};',
          ].join('\n')}
          heightMode="auto"
          contentType="application/javascript"
        />
      </VStack>
    </VStack>
  );
}