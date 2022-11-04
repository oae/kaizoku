import { Accordion, Box, Breadcrumbs, createStyles, Group, Text } from '@mantine/core';
import Image from 'next/image';
import { trpc } from '../../utils/trpc';
import { ArrayItem, SwitchItem, TextItem } from './mangal';

const useStyles = createStyles((theme) => ({
  item: {
    '&': {
      paddingTop: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
    },
  },

  switch: {
    '& *': {
      cursor: 'pointer',
    },
  },

  numberInput: {
    maxWidth: 60,
  },

  textInput: {
    maxWidth: 120,
  },

  title: {
    lineHeight: 1,
  },
}));

export function NotificationSettings() {
  const { classes } = useStyles();
  const update = trpc.settings.update.useMutation();
  const settings = trpc.settings.query.useQuery();

  const handleUpdate = async (key: string, value: boolean | string | number | string[]) => {
    await update.mutateAsync({
      key,
      value,
      updateType: 'app',
    });
    await settings.refetch();
  };

  if (settings.isLoading || !settings.data) {
    return null;
  }

  return (
    <Accordion variant="contained">
      <Accordion.Item value="telegram">
        <Accordion.Control icon={<Image src="/brand/telegram.png" width={20} height={20} />}>
          Telegram
        </Accordion.Control>
        <Accordion.Panel>
          <Group position="apart" className={classes.item} spacing="xl" noWrap>
            <Box>
              <Breadcrumbs
                separator="/"
                styles={{
                  separator: {
                    marginLeft: 4,
                    marginRight: 4,
                  },
                  breadcrumb: {
                    textTransform: 'capitalize',
                    fontSize: 13,
                    fontWeight: 500,
                  },
                  root: {
                    marginBottom: 5,
                  },
                }}
              >
                Enabled
              </Breadcrumbs>
              <Text size="xs" color="dimmed">
                Enable Telegram notifications
              </Text>
            </Box>
            <SwitchItem
              configKey="telegramEnabled"
              onUpdate={handleUpdate}
              initialValue={settings.data.appConfig.telegramEnabled}
            />
          </Group>
          <Group position="apart" className={classes.item} spacing="xl" noWrap>
            <Box>
              <Breadcrumbs
                separator="/"
                styles={{
                  separator: {
                    marginLeft: 4,
                    marginRight: 4,
                  },
                  breadcrumb: {
                    textTransform: 'capitalize',
                    fontSize: 13,
                    fontWeight: 500,
                  },
                  root: {
                    marginBottom: 5,
                  },
                }}
              >
                Token
              </Breadcrumbs>
              <Text size="xs" color="dimmed">
                Telegram token
              </Text>
            </Box>
            <TextItem
              configKey="telegramToken"
              onUpdate={handleUpdate}
              initialValue={settings.data.appConfig.telegramToken}
            />
          </Group>
          <Group position="apart" className={classes.item} spacing="xl" noWrap>
            <Box>
              <Breadcrumbs
                separator="/"
                styles={{
                  separator: {
                    marginLeft: 4,
                    marginRight: 4,
                  },
                  breadcrumb: {
                    textTransform: 'capitalize',
                    fontSize: 13,
                    fontWeight: 500,
                  },
                  root: {
                    marginBottom: 5,
                  },
                }}
              >
                Chat Id
              </Breadcrumbs>
              <Text size="xs" color="dimmed">
                Telegram chat id
              </Text>
            </Box>
            <TextItem
              configKey="telegramChatId"
              onUpdate={handleUpdate}
              initialValue={settings.data.appConfig.telegramChatId}
            />
          </Group>
          <Group position="apart" className={classes.item} spacing="xl" noWrap>
            <Box>
              <Breadcrumbs
                separator="/"
                styles={{
                  separator: {
                    marginLeft: 4,
                    marginRight: 4,
                  },
                  breadcrumb: {
                    textTransform: 'capitalize',
                    fontSize: 13,
                    fontWeight: 500,
                  },
                  root: {
                    marginBottom: 5,
                  },
                }}
              >
                Send Silently
              </Breadcrumbs>
              <Text size="xs" color="dimmed">
                Send Telegram notifications silently
              </Text>
            </Box>
            <SwitchItem
              configKey="telegramSendSilently"
              onUpdate={handleUpdate}
              initialValue={settings.data.appConfig.telegramSendSilently}
            />
          </Group>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="apprise">
        <Accordion.Control icon={<Image src="/brand/apprise.png" width={20} height={20} />}>Apprise</Accordion.Control>
        <Accordion.Panel>
          <Group position="apart" className={classes.item} spacing="xl" noWrap>
            <Box>
              <Breadcrumbs
                separator="/"
                styles={{
                  separator: {
                    marginLeft: 4,
                    marginRight: 4,
                  },
                  breadcrumb: {
                    textTransform: 'capitalize',
                    fontSize: 13,
                    fontWeight: 500,
                  },
                  root: {
                    marginBottom: 5,
                  },
                }}
              >
                Enabled
              </Breadcrumbs>
              <Text size="xs" color="dimmed">
                Enable Apprise notifications
              </Text>
            </Box>
            <SwitchItem
              configKey="appriseEnabled"
              onUpdate={handleUpdate}
              initialValue={settings.data.appConfig.appriseEnabled}
            />
          </Group>
          <Group position="apart" className={classes.item} spacing="xl" noWrap>
            <Box>
              <Breadcrumbs
                separator="/"
                styles={{
                  separator: {
                    marginLeft: 4,
                    marginRight: 4,
                  },
                  breadcrumb: {
                    textTransform: 'capitalize',
                    fontSize: 13,
                    fontWeight: 500,
                  },
                  root: {
                    marginBottom: 5,
                  },
                }}
              >
                Host
              </Breadcrumbs>
              <Text size="xs" color="dimmed">
                Apprise host name or ip
              </Text>
            </Box>
            <TextItem
              configKey="appriseHost"
              onUpdate={handleUpdate}
              initialValue={settings.data.appConfig.appriseHost}
            />
          </Group>

          <Group position="apart" className={classes.item} spacing="xl" noWrap>
            <Box>
              <Breadcrumbs
                separator="/"
                styles={{
                  separator: {
                    marginLeft: 4,
                    marginRight: 4,
                  },
                  breadcrumb: {
                    textTransform: 'capitalize',
                    fontSize: 13,
                    fontWeight: 500,
                  },
                  root: {
                    marginBottom: 5,
                  },
                }}
              >
                Urls
              </Breadcrumbs>
              <Text size="xs" color="dimmed">
                Apprise urls
              </Text>
            </Box>
            <ArrayItem
              configKey="appriseUrls"
              onUpdate={handleUpdate}
              initialValue={settings.data.appConfig.appriseUrls}
            />
          </Group>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
