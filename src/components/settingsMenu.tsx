import { ActionIcon, Box, Divider, Drawer, Kbd, ScrollArea, Title } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { useState } from 'react';
import { IntegrationSettings } from './settings/integration';
import { MangalSettings } from './settings/mangal';
import { NotificationSettings } from './settings/notification';
import { SwitchTheme } from './settings/switchTheme';

function SettingsMenu() {
  return (
    <Box pr={20}>
      <Divider
        sx={{ fontWeight: 'bolder' }}
        variant="dashed"
        my="xs"
        label={
          <>
            <Title mr="xs" order={3}>
              Theme
            </Title>
            <Kbd mr="xs">Shift</Kbd> +{' '}
            <Kbd px="xs" ml="xs">
              T
            </Kbd>
          </>
        }
      />
      <SwitchTheme />
      <Divider
        mt={40}
        sx={{ fontWeight: 'bolder' }}
        variant="dashed"
        my="xs"
        label={<Title order={3}>Notification</Title>}
      />
      <NotificationSettings />
      <Divider
        mt={40}
        sx={{ fontWeight: 'bolder' }}
        variant="dashed"
        my="xs"
        label={<Title order={3}>Integration</Title>}
      />
      <IntegrationSettings />
      <Divider mt={40} sx={{ fontWeight: 'bolder' }} variant="dashed" my="xs" label={<Title order={3}>Mangal</Title>} />
      <MangalSettings />
    </Box>
  );
}

export function SettingsMenuButton() {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Title inline>Settings</Title>}
        padding="md"
        size="xl"
        position="right"
      >
        <ScrollArea sx={{ height: 'calc(100vh - 100px)' }}>
          <SettingsMenu />
        </ScrollArea>
      </Drawer>
      <ActionIcon
        variant="transparent"
        sx={(theme) => ({
          backgroundColor: theme.white,
          color: theme.black,
          '&:hover': {
            backgroundColor: theme.colors.gray[0],
          },
        })}
        onClick={() => setOpened(true)}
        size="lg"
      >
        <IconSettings size={18} strokeWidth={2} />
      </ActionIcon>
    </>
  );
}
