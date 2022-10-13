import { createStyles, Image, SimpleGrid, Text, UnstyledButton } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import { useState } from 'react';

const useStyles = createStyles((theme, { checked, disabled }: { checked: boolean; disabled: boolean }) => ({
  button: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    transition: 'background-color 150ms ease, border-color 150ms ease',
    border: `1px solid ${
      checked
        ? theme.fn.variant({ variant: 'outline', color: theme.primaryColor }).border
        : theme.colorScheme === 'dark'
        ? theme.colors.dark[8]
        : theme.colors.gray[3]
    }`,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    backgroundColor: checked
      ? theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background
      : disabled
      ? theme.colors.gray[3]
      : theme.white,
  },

  body: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
}));

interface ImageCheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?(checked: boolean): void;
  title: string;
  description: string;
  image: string;
}

export function ImageCheckbox({
  checked,
  defaultChecked,
  onChange,
  title,
  description,
  className,
  disabled,
  image,
  ...others
}: ImageCheckboxProps & Omit<React.ComponentPropsWithoutRef<'button'>, keyof ImageCheckboxProps>) {
  const [value, handleChange] = useUncontrolled({
    value: checked,
    defaultValue: defaultChecked,
    finalValue: false,
    onChange,
  });

  const { classes, cx } = useStyles({ checked: value, disabled: disabled || false });

  return (
    <UnstyledButton
      {...others}
      onClick={() => {
        if (!disabled) {
          handleChange(!value);
        }
      }}
      className={cx(classes.button, className)}
    >
      <Image
        withPlaceholder
        placeholder={<Image src="/cover-not-found.jpg" alt={title} width={42} height={64} />}
        src={image}
        width={42}
        height={64}
      />

      <div className={classes.body}>
        <Text color="dimmed" size="xs" sx={{ lineHeight: 1 }} mb={5}>
          {description}
        </Text>
        <Text weight={500} size="sm" sx={{ lineHeight: 1 }}>
          {title}
        </Text>
      </div>
    </UnstyledButton>
  );
}

ImageCheckbox.defaultProps = {
  checked: undefined,
  defaultChecked: undefined,
  onChange: () => {},
};

type IMangaSearchResult = {
  status: string;
  title: string;
  order: number;
  cover: string;
};

export function MangaSearchResult({
  items,
  onSelect,
}: {
  items: IMangaSearchResult[];
  onSelect: (selected: IMangaSearchResult | undefined) => void;
}) {
  const [selected, setSelected] = useState<IMangaSearchResult>();

  return (
    <SimpleGrid
      cols={2}
      breakpoints={[
        { maxWidth: 'md', cols: 2 },
        { maxWidth: 'sm', cols: 1 },
      ]}
    >
      {items.map((m) => (
        <ImageCheckbox
          key={m.title}
          image={m.cover || '/cover-not-found.jpg'}
          title={m.title}
          disabled={selected && m.title !== selected.title}
          description={m.status}
          onChange={(checked) => {
            if (checked) {
              setSelected(m);
              onSelect(m);
            } else {
              setSelected(undefined);
              onSelect(undefined);
            }
          }}
        />
      ))}
    </SimpleGrid>
  );
}
