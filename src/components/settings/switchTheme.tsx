import { Box, Center, SegmentedControl, useMantineColorScheme } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { IconMoon, IconPalette, IconSun } from '@tabler/icons-react';
import { getCookie, setCookie } from 'cookies-next';
import { useEffect, useState } from 'react';

export function SwitchTheme() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const preferredColorScheme = useColorScheme();
  const [value, setValue] = useState<string>('auto');

  useEffect(() => {
    const followSystem = getCookie('follow-system') === '1';
    if (followSystem) {
      setValue('auto');
    } else {
      setValue(colorScheme);
    }
  }, [colorScheme]);

  return (
    <SegmentedControl
      sx={{ display: 'flex' }}
      size="sm"
      value={value}
      onChange={(val: 'light' | 'dark' | 'auto') => {
        setValue(val);
        setCookie('follow-system', val === 'auto' ? '1' : '0');
        toggleColorScheme(val === 'auto' ? preferredColorScheme : val);
      }}
      data={[
        {
          value: 'auto',
          label: (
            <Center>
              <IconPalette size={16} strokeWidth={1.5} />
              <Box ml={10}>Auto</Box>
            </Center>
          ),
        },
        {
          value: 'light',
          label: (
            <Center>
              <IconSun size={16} strokeWidth={1.5} />
              <Box ml={10}>Light</Box>
            </Center>
          ),
        },
        {
          value: 'dark',
          label: (
            <Center>
              <IconMoon size={16} strokeWidth={1.5} />
              <Box ml={10}>Dark</Box>
            </Center>
          ),
        },
      ]}
    />
  );
}
