import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Code,
  createStyles,
  Divider,
  Grid,
  Group,
  Image,
  LoadingOverlay,
  Paper,
  Select,
  Stepper,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm, UseFormReturnType, zodResolver } from '@mantine/form';
import { getHotkeyHandler } from '@mantine/hooks';
import { useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconArrowRight, IconBook, IconCheck, IconSearch, IconX } from '@tabler/icons';
import { useState } from 'react';
import { z } from 'zod';
import { trpc } from '../utils/trpc';
import { MangaSearchResult } from './mangaSearchResult';

const useStyles = createStyles((theme) => ({
  card: {
    height: 350,
    width: 210,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundSize: 'cover',
    backgroundPosition: 'center',

    transition: 'transform 150ms ease, box-shadow 150ms ease',

    '&:hover': {
      transform: 'scale(1.01)',
      boxShadow: theme.shadows.md,
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 300,
    padding: theme.spacing.xs,
  },
  stepper: {
    flexGrow: 1,
  },
  stepBody: {
    marginTop: 30,
    marginBottom: 30,
  },
  buttonGroup: {
    position: 'fixed',
    bottom: '19px',
    right: '55px',
    width: 'calc(100% - 55px)',
    height: '50px',
    background: 'white',
  },
  placeHolder: {
    alignItems: 'start !important',
    justifyContent: 'flex-start !important',
  },
}));

const schema = z.object({
  source: z.string().min(1, { message: 'You must select a source' }),
  query: z.string().min(1, { message: 'Cannot be empty' }),
  mangaOrder: z.number().gte(0, { message: 'Please select a manga' }),
  mangaTitle: z.string().min(1, { message: 'Please select a manga' }),
});

type FormType = z.TypeOf<typeof schema>;

function SourceStep({ form }: { form: UseFormReturnType<FormType> }) {
  const query = trpc.manga.sources.useQuery(undefined, {
    staleTime: Infinity,
  });

  if (query.isLoading) {
    return <LoadingOverlay visible />;
  }

  const selectData = query.data?.map((s) => ({
    value: s,
    label: s,
  }));

  return (
    <Box>
      <Select
        data={selectData || []}
        label="Available sources"
        placeholder="Select a source"
        {...form.getInputProps('source')}
      />
    </Box>
  );
}

function SearchStep({ form }: { form: UseFormReturnType<FormType> }) {
  const ctx = trpc.useContext();
  type SearchResult = Awaited<ReturnType<typeof ctx.manga.search.fetch>>;

  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult>([]);

  const handleSearch = async () => {
    form.validateField('query');
    if (!form.isValid('query')) {
      return;
    }
    setLoading(true);
    const result = await ctx.manga.search.fetch({
      keyword: form.values.query,
      source: form.values.source,
    });
    setLoading(false);

    if (result) {
      setSearchResult(result);
    }
  };

  return (
    <>
      <LoadingOverlay visible={loading} />

      <TextInput
        data-autofocus
        mb="xl"
        size="md"
        radius="xl"
        onKeyDown={getHotkeyHandler([['Enter', handleSearch]])}
        icon={<IconSearch size={18} stroke={1.5} />}
        rightSection={
          <ActionIcon size={32} radius="xl" color="blue" variant="filled" onClick={handleSearch}>
            <IconArrowRight size={18} stroke={1.5} />
          </ActionIcon>
        }
        rightSectionWidth={42}
        label="Search for a manga"
        placeholder="Bleach"
        {...form.getInputProps('query')}
      />
      <TextInput hidden {...form.getInputProps('mangaTitle')} />
      <MangaSearchResult
        items={searchResult}
        onSelect={(selected) => {
          if (selected) {
            form.setFieldValue('mangaOrder', selected.order);
            form.setFieldValue('mangaTitle', selected.title);
          } else {
            form.setFieldValue('mangaOrder', -1);
            form.setFieldValue('mangaTitle', '');
          }
        }}
      />
    </>
  );
}

function ReviewStep({ form }: { form: UseFormReturnType<FormType> }) {
  const query = trpc.manga.detail.useQuery(
    {
      keyword: form.values.query,
      source: form.values.source,
      order: form.values.mangaOrder,
    },
    {
      staleTime: Infinity,
      enabled: !!form.values.query && !!form.values.source && !!form.values.mangaTitle && form.values.mangaOrder > -1,
    },
  );

  const { classes } = useStyles();

  const manga = query.data;

  return (
    <>
      <LoadingOverlay visible={query.isLoading} />

      {manga && (
        <Grid>
          <Grid.Col span={4}>
            <Image
              classNames={{
                placeholder: classes.placeHolder,
              }}
              radius="lg"
              sx={(theme) => ({
                boxShadow: theme.shadows.xl,
              })}
              withPlaceholder
              placeholder={
                <Image
                  radius="lg"
                  sx={(theme) => ({
                    width: 210,
                    boxShadow: theme.shadows.xl,
                  })}
                  src="/cover-not-found.jpg"
                  alt={manga.Name}
                />
              }
              src={manga.Metadata.Cover}
            />
          </Grid.Col>
          <Grid.Col span={8}>
            <Divider mb="xs" labelPosition="center" label={<Title order={3}>{manga.Name}</Title>} />
            {manga.Metadata.Synonyms && (
              <Group spacing="xs">
                {manga.Metadata.Synonyms.map((synonym) => (
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
            <Divider variant="dashed" my="xs" label="Status" />
            {manga.Metadata.Status ? (
              <Badge color="cyan" variant="filled" size="sm">
                {manga.Metadata.Status}
              </Badge>
            ) : (
              <Text size="sm">No status...</Text>
            )}
            <Divider variant="dashed" my="xs" label="Chapters" />
            <Text>
              There are &nbsp;
              <Badge color="teal" variant="outline" size="lg">
                {manga.Chapters?.length || 0}
              </Badge>
              &nbsp; chapters
            </Text>
            <Divider variant="dashed" my="xs" label="Summary" />
            <Text size="sm">{manga.Metadata.Summary || 'No summary...'}</Text>
            <Divider variant="dashed" my="xs" label="Genres" />
            {manga.Metadata.Genres ? (
              <Group spacing="xs">
                {manga.Metadata.Genres.map((genre) => (
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
            {manga.Metadata.Tags ? (
              <Group spacing="xs">
                {manga.Metadata.Tags.map((tag) => (
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
      )}
    </>
  );
}

function Form({ onClose }: { onClose: () => void }) {
  const { classes } = useStyles();
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);

  const mutation = trpc.manga.add.useMutation();

  const form = useForm({
    validateInputOnBlur: ['source', 'query'],
    initialValues: {
      source: '',
      query: '',
      mangaOrder: -1,
      mangaTitle: '',
    },
    validate: zodResolver(schema),
  });

  const nextStep = () => {
    if (active === 0) {
      form.validateField('source');
      if (!form.isValid('source')) {
        return;
      }
    }
    if (active === 1) {
      form.validateField('mangaTitle');
      form.validateField('mangaOrder');
      if (!form.isValid('mangaOrder') || !form.isValid('mangaTitle')) {
        return;
      }
    }
    form.clearErrors();
    setActive((current) => (current < 2 ? current + 1 : current));
  };

  const prevStep = () => {
    if (active === 1) {
      form.setFieldValue('query', '');
      form.setFieldValue('source', '');
    }
    if (active === 2) {
      form.setFieldValue('query', '');
      form.setFieldValue('mangaOrder', -1);
      form.setFieldValue('mangaTitle', '');
    }
    setActive((current) => (current > 0 ? current - 1 : current));
  };
  return (
    <form
      className={classes.form}
      onSubmit={form.onSubmit(async (values) => {
        setVisible((v) => !v);
        const { mangaOrder, mangaTitle, query, source } = values;
        try {
          await mutation.mutateAsync({
            keyword: query,
            order: mangaOrder,
            title: mangaTitle,
            source,
          });
        } catch (err) {
          showNotification({
            icon: <IconX size={18} />,
            color: 'red',
            autoClose: true,
            title: 'Manga',
            message: (
              <Text>
                Failed to create add manga. <Code color="red">{`${err}`}</Code>
              </Text>
            ),
          });

          form.reset();
          onClose();
          setVisible((v) => !v);
          return;
        }
        form.reset();
        onClose();
        setVisible((v) => !v);
        showNotification({
          icon: <IconCheck size={18} />,
          color: 'teal',
          autoClose: true,
          title: 'Manga',
          message: (
            <Text>
              <Code color="blue">{values.mangaTitle}</Code> is added to library
            </Text>
          ),
        });
      })}
    >
      <LoadingOverlay visible={visible} />
      <Stepper
        classNames={{
          root: classes.stepper,
          content: classes.stepBody,
        }}
        active={active}
        onStepClick={setActive}
        breakpoint="sm"
        m="xl"
      >
        <Stepper.Step
          label="Source"
          description={form.values.source || 'Select a source'}
          allowStepSelect={active > 0}
          color={active > 0 ? 'teal' : 'blue'}
        >
          <SourceStep form={form} />
        </Stepper.Step>
        <Stepper.Step
          label="Manga"
          description={form.values.mangaTitle || 'Search for manga'}
          allowStepSelect={active > 1}
          color={active > 1 ? 'teal' : 'blue'}
        >
          <SearchStep form={form} />
        </Stepper.Step>

        <Stepper.Completed>
          <ReviewStep form={form} />
        </Stepper.Completed>
      </Stepper>

      <Group position="right" className={classes.buttonGroup}>
        <Button variant="default" onClick={prevStep}>
          Back
        </Button>
        <Button hidden={active !== 2} type="submit">
          Add
        </Button>
        <Button hidden={active === 2} onClick={nextStep}>
          Next step
        </Button>
      </Group>
    </form>
  );
}

export function NewMangaCard({ onAdd }: { onAdd: () => void }) {
  const { classes } = useStyles();
  const modals = useModals();

  const openCreateModal = () => {
    const id = modals.openModal({
      overflow: 'inside',
      trapFocus: true,
      size: 'xl',
      title: 'Add a new manga',
      centered: true,
      children: (
        <Form
          onClose={() => {
            modals.closeModal(id);
            onAdd();
          }}
        />
      ),
    });
  };

  return (
    <Paper
      shadow="lg"
      p="md"
      radius="md"
      sx={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9)), url('https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx53390-1RsuABC34P9D.jpg')`,
      }}
      className={classes.card}
    >
      <Button
        variant="filled"
        leftIcon={<IconBook size={18} />}
        onClick={openCreateModal}
        fullWidth
        color="indigo"
        size="xs"
      >
        Add new
      </Button>
    </Paper>
  );
}
