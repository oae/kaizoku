import {
  ActionIcon,
  Badge,
  Button,
  Code,
  createStyles,
  Divider,
  Grid,
  Group,
  Image,
  LoadingOverlay,
  Popover,
  Select,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { getHotkeyHandler } from '@mantine/hooks';
import { useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { Prisma } from '@prisma/client';
import { IconCheck, IconEdit, IconGitMerge, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { z } from 'zod';
import { getCronLabel, isCronValid } from '../utils';
import { trpc } from '../utils/trpc';

const mangaWithLibraryAndMetadata = Prisma.validator<Prisma.MangaArgs>()({
  include: { library: true, metadata: true },
});

type MangaWithLibraryAndMetadata = Prisma.MangaGetPayload<typeof mangaWithLibraryAndMetadata>;

const useStyles = createStyles((theme) => ({
  placeHolder: {
    alignItems: 'start !important',
    justifyContent: 'flex-start !important',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 300,
    padding: theme.spacing.xs,
  },
  buttonGroup: {
    marginTop: 30,
  },
}));

const schema = z.object({
  id: z.number(),
  interval: z
    .string({
      invalid_type_error: 'Invalid interval',
    })
    .min(1, { message: 'Please select an interval' })
    .refine((value) => isCronValid(value), {
      message: 'Invalid interval',
    }),
  anilistId: z.string().nullish(),
});

function UpdateModalContent({
  manga,
  onUpdate,
  onClose,
}: {
  manga: MangaWithLibraryAndMetadata;
  onUpdate: () => void;
  onClose: () => void;
}) {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [intervalData, setIntervalData] = useState(
    [...['0 0 * * *', '0 * * * *', '0 0 * * 7', 'never'].filter((i) => i !== manga.interval), manga.interval].map(
      (value) => ({
        label: getCronLabel(value),
        value,
      }),
    ),
  );
  const mutation = trpc.manga.update.useMutation();

  const { classes } = useStyles();

  const handleBind = () => {
    setOpened(false);
  };

  const form = useForm({
    validateInputOnBlur: ['id', 'interval', 'anilistId'],
    initialValues: {
      id: manga.id,
      interval: manga.interval,
      anilistId: '',
    },
    validate: zodResolver(schema),
  });

  const onSubmit = form.onSubmit(async (values) => {
    setLoading((v) => !v);
    const { id, interval, anilistId } = values;
    try {
      await mutation.mutateAsync({
        id,
        interval,
        anilistId,
      });

      onUpdate();
    } catch (err) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        autoClose: true,
        title: 'Manga',
        message: (
          <Text>
            <Code color="red">{`${err}`}</Code>
          </Text>
        ),
      });

      form.reset();
      onClose();
      setLoading((v) => !v);
      return;
    }
    form.reset();
    onClose();
    setLoading((v) => !v);
    showNotification({
      icon: <IconCheck size={18} />,
      color: 'teal',
      autoClose: true,
      title: 'Manga',
      message: (
        <Text>
          <Code color="blue">{manga.title}</Code> is updated
        </Text>
      ),
    });
  });

  return (
    <form className={classes.form} onSubmit={onSubmit}>
      <LoadingOverlay visible={loading} />
      <TextInput hidden {...form.getInputProps('id')} />
      <Grid>
        <Grid.Col span={4}>
          <Image
            classNames={{
              placeholder: classes.placeHolder,
            }}
            sx={(theme) => ({
              boxShadow: theme.shadows.xl,
            })}
            withPlaceholder
            placeholder={
              <Image
                sx={(theme) => ({
                  width: 210,
                  boxShadow: theme.shadows.xl,
                })}
                src="/cover-not-found.jpg"
                alt={manga.title}
              />
            }
            src={manga.metadata.cover}
          />
        </Grid.Col>
        <Grid.Col span={8}>
          <Divider
            mb="xs"
            labelPosition="center"
            label={
              <>
                <Title order={3}>{manga.title}</Title>
                <Popover
                  width={300}
                  trapFocus
                  position="bottom"
                  withArrow
                  shadow="md"
                  opened={opened}
                  onChange={setOpened}
                >
                  <Popover.Target>
                    <Tooltip inline label="Fix the wrong match">
                      <ActionIcon
                        ml={4}
                        color="blue"
                        variant="transparent"
                        size="lg"
                        radius="xl"
                        onClick={() => setOpened((o) => !o)}
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Popover.Target>
                  <Popover.Dropdown
                    sx={(theme) => ({
                      background: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
                    })}
                  >
                    <TextInput
                      data-autofocus
                      mb="xl"
                      size="md"
                      radius="xl"
                      onKeyDown={getHotkeyHandler([['Enter', handleBind]])}
                      icon={<IconGitMerge size={18} strokeWidth={1.5} />}
                      rightSection={
                        <ActionIcon size={32} radius="xl" color="blue" variant="filled" onClick={handleBind}>
                          <IconCheck size={18} strokeWidth={1.5} />
                        </ActionIcon>
                      }
                      rightSectionWidth={42}
                      label={
                        <Text size="sm" mb="xs">
                          Please enter a new AniList id for {manga.title}
                        </Text>
                      }
                      placeholder="AniList Id"
                      {...form.getInputProps('anilistId')}
                    />
                  </Popover.Dropdown>
                </Popover>
              </>
            }
          />
          {manga.metadata.synonyms && (
            <Group spacing="xs">
              {manga.metadata.synonyms.map((synonym) => (
                <Tooltip label={synonym} key={synonym}>
                  <div style={{ maxWidth: 100 }}>
                    <Badge color="blue" variant="filled" size="sm" fullWidth>
                      {synonym}
                    </Badge>
                  </div>
                </Tooltip>
              ))}
            </Group>
          )}

          <Divider variant="dashed" my="xs" label="Interval" />
          <Select
            searchable
            clearable
            creatable
            size="sm"
            defaultValue={manga.interval}
            data={intervalData}
            placeholder="Select or create an interval"
            getCreateLabel={(query) => {
              if (isCronValid(query)) {
                return `+ Download ${getCronLabel(query)}`;
              }

              return `+ Create ${query}`;
            }}
            onCreate={(query) => {
              if (!isCronValid(query)) {
                form.setFieldError('interval', 'Invalid interval');
                return null;
              }
              const item = { value: query, label: getCronLabel(query) };
              setIntervalData((current) => [...current.filter((i) => i.value !== query), item]);
              return item;
            }}
            {...form.getInputProps('interval')}
          />
          <Divider variant="dashed" my="xs" label="Status" />
          {manga.metadata.status ? (
            <Badge color="cyan" variant="filled" size="sm">
              {manga.metadata.status}
            </Badge>
          ) : (
            <Text size="sm">No status...</Text>
          )}
          <Divider variant="dashed" my="xs" label="Summary" />
          <Text size="sm">{manga.metadata.summary || 'No summary...'}</Text>
          <Divider variant="dashed" my="xs" label="Genres" />
          {manga.metadata.genres ? (
            <Group spacing="xs">
              {manga.metadata.genres.map((genre) => (
                <Tooltip label={genre} key={genre}>
                  <div style={{ maxWidth: 100 }}>
                    <Badge color="indigo" variant="light" size="xs" fullWidth>
                      {genre}
                    </Badge>
                  </div>
                </Tooltip>
              ))}
            </Group>
          ) : (
            <Text size="sm">No genres...</Text>
          )}
          <Divider variant="dashed" my="xs" label="Tags" />
          {manga.metadata.tags ? (
            <Group spacing="xs">
              {manga.metadata.tags.map((tag) => (
                <Tooltip label={tag} key={tag}>
                  <div style={{ maxWidth: 100 }}>
                    <Badge color="violet" variant="light" size="xs" fullWidth>
                      {tag}
                    </Badge>
                  </div>
                </Tooltip>
              ))}
            </Group>
          ) : (
            <Text size="sm">No tags...</Text>
          )}
        </Grid.Col>
      </Grid>
      <Group position="right" className={classes.buttonGroup}>
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Update</Button>
      </Group>
    </form>
  );
}

export const useUpdateModal = (manga: MangaWithLibraryAndMetadata, onUpdate: () => void) => {
  const modals = useModals();

  const openUpdateModal = () => {
    const id = modals.openModal({
      title: `Update ${manga.title}`,
      centered: true,
      size: 'xl',
      children: <UpdateModalContent manga={manga} onUpdate={onUpdate} onClose={() => modals.closeModal(id)} />,
    });
  };

  return openUpdateModal;
};
