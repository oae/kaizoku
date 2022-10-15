import { createStyles, Stepper } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { Dispatch, SetStateAction } from 'react';
import type { FormType } from '../form';
import { DownloadStep } from './downloadStep';
import { ReviewStep } from './reviewStep';
import { SearchStep } from './searchStep';
import { SourceStep } from './sourceStep';

const useStyles = createStyles((_theme) => ({
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
}));

export default function AddMangaSteps({
  form,
  active,
  setActive,
}: {
  form: UseFormReturnType<FormType>;
  active: number;
  setActive: Dispatch<SetStateAction<number>>;
}) {
  const { classes } = useStyles();

  return (
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
        allowStepSelect={false}
        color={active > 0 ? 'teal' : 'blue'}
      >
        <SourceStep form={form} />
      </Stepper.Step>
      <Stepper.Step
        label="Manga"
        description={form.values.mangaTitle || 'Search for manga'}
        allowStepSelect={false}
        color={active > 1 ? 'teal' : 'blue'}
      >
        <SearchStep form={form} />
      </Stepper.Step>
      <Stepper.Step
        label="Download"
        description={form.values.interval || 'Select an interval'}
        allowStepSelect={false}
        color={active > 2 ? 'teal' : 'blue'}
      >
        <DownloadStep form={form} />
      </Stepper.Step>

      <Stepper.Completed>
        <ReviewStep form={form} />
      </Stepper.Completed>
    </Stepper>
  );
}
