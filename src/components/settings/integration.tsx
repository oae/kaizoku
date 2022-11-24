import { Accordion, Box, Breadcrumbs, createStyles, Group, Image, Text } from '@mantine/core';
import { trpc } from '../../utils/trpc';
import { SwitchItem, TextItem } from './mangal';

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

export function IntegrationSettings() {
  const { classes } = useStyles();
  const update = trpc.settings.update.useMutation();
  const settings = trpc.settings.query.useQuery();

  const handleUpdate = async (key: string, value: boolean | string | number) => {
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
      <Accordion.Item value="komga">
        <Accordion.Control icon={<Image src="/brand/komga.png" width={20} height={20} />}>Komga</Accordion.Control>
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
                Enable Komga integration to trigger library scan and metadata refresh tasks
              </Text>
            </Box>
            <SwitchItem
              configKey="komgaEnabled"
              onUpdate={handleUpdate}
              initialValue={settings.data.appConfig.komgaEnabled}
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
                Komga host or ip
              </Text>
            </Box>
            <TextItem configKey="komgaHost" onUpdate={handleUpdate} initialValue={settings.data.appConfig.komgaHost} />
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
                Email
              </Breadcrumbs>
              <Text size="xs" color="dimmed">
                Komga user
              </Text>
            </Box>
            <TextItem configKey="komgaUser" onUpdate={handleUpdate} initialValue={settings.data.appConfig.komgaUser} />
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
                Password
              </Breadcrumbs>
              <Text size="xs" color="dimmed">
                Komga user password
              </Text>
            </Box>
            <TextItem
              configKey="komgaPassword"
              onUpdate={handleUpdate}
              initialValue={settings.data.appConfig.komgaPassword}
            />
          </Group>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="kavita">
        <Accordion.Control icon={<Image src="/brand/kavita.png" width={20} height={20} />}>Kavita</Accordion.Control>
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
                Enable Kavita integration to trigger library scan and metadata refresh tasks
              </Text>
            </Box>
            <SwitchItem
              configKey="kavitaEnabled"
              onUpdate={handleUpdate}
              initialValue={settings.data.appConfig.kavitaEnabled}
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
                Kavita host or ip
              </Text>
            </Box>
            <TextItem
              configKey="kavitaHost"
              onUpdate={handleUpdate}
              initialValue={settings.data.appConfig.kavitaHost}
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
                Username
              </Breadcrumbs>
              <Text size="xs" color="dimmed">
                Kavita user
              </Text>
            </Box>
            <TextItem
              configKey="kavitaUser"
              onUpdate={handleUpdate}
              initialValue={settings.data.appConfig.kavitaUser}
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
                Password
              </Breadcrumbs>
              <Text size="xs" color="dimmed">
                Kavita user password
              </Text>
            </Box>
            <TextItem
              configKey="kavitaPassword"
              onUpdate={handleUpdate}
              initialValue={settings.data.appConfig.kavitaPassword}
            />
          </Group>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
