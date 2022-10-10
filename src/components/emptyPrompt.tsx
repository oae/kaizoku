import { Center, createStyles, Stack, Text, Title } from '@mantine/core';
import { BiBookContent } from 'react-icons/bi';
import { AddLibrary } from './addLibrary';

const useStyles = createStyles((theme) => ({
  root: {
    height: '100%',
  },
  description: {
    color: theme.colors.gray[6],
  },
}));

export function EmptyPrompt({ onCreate }: { onCreate: () => void }) {
  const { classes } = useStyles();

  return (
    <Center className={classes.root}>
      <Stack justify="center" align="center" spacing={10}>
        <BiBookContent size={48} />
        <Title>No library found</Title>
        <Text size="sm" className={classes.description}>
          To be able to add new manga, you need to create a library
        </Text>
        <AddLibrary onCreate={onCreate} />
      </Stack>
    </Center>
  );
}
