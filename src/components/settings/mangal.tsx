import {
  ActionIcon,
  Box,
  Breadcrumbs,
  Button,
  createStyles,
  Group,
  NumberInput,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { trpc } from '../../utils/trpc';

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
  },

  item: {
    '& + &': {
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
    minWidth: 180,
    width: 180,
  },

  title: {
    lineHeight: 1,
  },
}));

export function SwitchItem({
  configKey,
  initialValue,
  onUpdate,
}: {
  configKey: string;
  initialValue: boolean;
  onUpdate: (configKey: string, value: boolean) => void;
}) {
  const { classes } = useStyles();
  return (
    <Switch
      color="red"
      onChange={(event) => onUpdate(configKey, event.currentTarget.checked)}
      onLabel={<IconCheck size={16} />}
      defaultChecked={initialValue}
      offLabel={<IconX size={16} />}
      className={classes.switch}
      size="lg"
    />
  );
}

export function NumberItem({
  configKey,
  initialValue,
  onUpdate,
}: {
  configKey: string;
  initialValue: number;
  onUpdate: (configKey: string, value: number) => void;
}) {
  const { classes } = useStyles();
  const [value, setValue] = useState(initialValue);

  return (
    <NumberInput
      size="xs"
      className={classes.numberInput}
      value={value}
      onChange={(newValue) => newValue !== undefined && setValue(newValue)}
      onBlur={() => {
        if (value !== initialValue) {
          onUpdate(configKey, value);
        }
      }}
    />
  );
}

export function TextItem({
  configKey,
  initialValue,
  onUpdate,
}: {
  configKey: string;
  initialValue: string | null;
  onUpdate: (configKey: string, value: string) => void;
}) {
  const { classes } = useStyles();
  const [value, setValue] = useState(initialValue || '');

  return (
    <TextInput
      size="xs"
      className={classes.textInput}
      value={value}
      onChange={(event) => event.currentTarget.value !== undefined && setValue(event.currentTarget.value)}
      onBlur={() => {
        if (value !== initialValue) {
          onUpdate(configKey, value);
        }
      }}
    />
  );
}

function ArrayTextItem({
  initialValue,
  onUpdate,
  onRemove,
}: {
  initialValue: string | null;
  onUpdate: (value: string) => void;
  onRemove: () => void;
}) {
  const { classes } = useStyles();
  const [value, setValue] = useState(initialValue || '');

  return (
    <TextInput
      my="sm"
      size="xs"
      className={classes.textInput}
      value={value}
      rightSection={
        <ActionIcon size={18} radius="xl" color="red" variant="filled" onClick={() => onRemove()}>
          <IconX size={16} stroke={1.5} />
        </ActionIcon>
      }
      onChange={(event) => setValue(event.currentTarget.value)}
      onBlur={() => {
        if (value !== initialValue && value) {
          onUpdate(value);
        }
      }}
    />
  );
}

export function ArrayItem({
  configKey,
  initialValue,
  onUpdate,
}: {
  configKey: string;
  initialValue: string[];
  onUpdate: (configKey: string, value: string[]) => void;
}) {
  const [value, setValue] = useState<{ [key: string]: string }>(
    initialValue.reduce((acc, v) => ({ ...acc, [nanoid()]: v }), {}),
  );

  useEffect(() => {
    onUpdate(
      configKey,
      Object.values(value).filter((i) => !!i),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey, value]);

  return (
    <Box>
      {Object.entries(value).map(([key, item]) => {
        return (
          <ArrayTextItem
            // eslint-disable-next-line react/no-array-index-key
            key={key}
            initialValue={item}
            onUpdate={(updated) =>
              setValue({
                ...value,
                [key]: updated,
              })
            }
            onRemove={() => {
              const { [key]: removed, ...rest } = value;

              setValue(rest);
            }}
          />
        );
      })}
      <Button fullWidth onClick={() => setValue({ ...value, [nanoid()]: '' })}>
        Add Url
      </Button>
    </Box>
  );
}

export function MangalSettings() {
  const { classes } = useStyles();
  const settings = trpc.settings.query.useQuery();
  const mangalUpdate = trpc.settings.update.useMutation();

  const handleUpdate = async (key: string, value: boolean | string | number) => {
    await mangalUpdate.mutateAsync({
      key,
      value,
      updateType: 'mangal',
    });
    settings.refetch();
  };

  if (settings.isLoading) {
    return null;
  }

  return (
    <Box>
      {settings.data?.mangalConfig.map((item) => (
        <Group key={item.key} position="apart" className={classes.item} noWrap spacing="xl">
          <div>
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
              {item.key.split('.').map((val) => val.split('_').join(' '))}
            </Breadcrumbs>
            <Text size="xs" color="dimmed">
              {item.description}
            </Text>
          </div>
          {item.type === 'bool' && (
            <SwitchItem configKey={item.key} onUpdate={handleUpdate} initialValue={item.value as boolean} />
          )}
          {item.type === 'int' && (
            <NumberItem configKey={item.key} onUpdate={handleUpdate} initialValue={item.value as number} />
          )}
          {item.type === 'string' && (
            <TextItem configKey={item.key} onUpdate={handleUpdate} initialValue={item.value as string} />
          )}
        </Group>
      ))}
    </Box>
  );
}
