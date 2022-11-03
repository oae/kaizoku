import { Button, Code, createStyles, Group, LoadingOverlay, Text } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useState } from 'react';
import { z } from 'zod';
import { isCronValid } from '../../utils';
import { trpc } from '../../utils/trpc';
import AddMangaSteps from './steps';

const useStyles = createStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 300,
    padding: theme.spacing.xs,
  },
  buttonGroup: {
    position: 'fixed',
    bottom: '19px',
    right: '55px',
    width: 'calc(100% - 55px)',
    height: '50px',
    background: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
  },
}));

const schema = z.object({
  source: z.string().min(1, { message: 'You must select a source' }),
  query: z.string().min(1, { message: 'Cannot be empty' }),
  mangaTitle: z.string().min(1, { message: 'Please select a manga' }),
  interval: z
    .string({
      invalid_type_error: 'Invalid interval',
    })
    .min(1, { message: 'Please select an interval' })
    .refine((value) => isCronValid(value), {
      message: 'Invalid interval',
    }),
});

export type FormType = z.TypeOf<typeof schema>;

export function AddMangaForm({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const { classes } = useStyles();

  const mutation = trpc.manga.add.useMutation();

  const form = useForm({
    validateInputOnBlur: ['source', 'query', 'interval'],
    initialValues: {
      source: '',
      query: '',
      mangaTitle: '',
      interval: '',
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
      if (!form.isValid('mangaTitle')) {
        return;
      }
    }
    if (active === 2) {
      form.validateField('interval');
      if (!form.isValid('interval')) {
        return;
      }
    }
    form.clearErrors();
    setActive((current) => (current < 3 ? current + 1 : current));
  };

  const prevStep = () => {
    if (active === 0) {
      setVisible(false);
      onClose();
      form.reset();
    }
    if (active === 1) {
      form.setFieldValue('query', '');
      form.setFieldValue('source', '');
    }
    if (active === 2) {
      form.setFieldValue('query', '');
      form.setFieldValue('mangaTitle', '');
      form.setFieldValue('interval', '');
    }
    if (active === 3) {
      form.setFieldValue('interval', '');
    }
    setActive((current) => (current > 0 ? current - 1 : current));
  };

  const onSubmit = form.onSubmit(async (values) => {
    if (active !== 3) {
      return;
    }
    setVisible((v) => !v);
    const { mangaTitle, source, interval } = values;
    try {
      await mutation.mutateAsync({
        title: mangaTitle,
        interval,
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
            <Code color="red">{`${err}`}</Code>
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
  });

  return (
    <form className={classes.form} onSubmit={onSubmit}>
      <AddMangaSteps form={form} active={active} setActive={setActive} />
      <LoadingOverlay visible={visible} />
      <Group position="right" className={classes.buttonGroup}>
        <Button variant="default" onClick={prevStep}>
          {active === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button hidden={active !== 3} type="submit">
          Add
        </Button>
        <Button hidden={active === 3} onClick={nextStep}>
          Next step
        </Button>
      </Group>
    </form>
  );
}
