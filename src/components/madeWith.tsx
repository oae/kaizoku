import { Box, Text, Tooltip } from '@mantine/core';
import { IconHeart } from '@tabler/icons-react';
import { motion } from 'framer-motion';

export function MadeWith({ minimized }: { minimized: boolean }): JSX.Element {
  const hearth = (
    <motion.div
      animate={{
        scale: [1.0, 1.25, 1.0, 1.25, 1.0, 1.0],
      }}
      transition={{
        duration: 1,
        ease: 'easeInOut',
        times: [0, 0.2, 0.5, 0.6, 0.8, 1],
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 0.5,
      }}
    >
      <IconHeart fill="red" color="red" size={20} />
    </motion.div>
  );

  if (minimized) {
    return (
      <Tooltip withArrow label="Made with love in Turkey" position="right">
        <div style={{ display: 'inline-flex', height: '26px', lineHeight: '26px' }}>{hearth}</div>
      </Tooltip>
    );
  }

  return (
    <Box my="sm" sx={{ display: 'inline-flex', height: '26px', lineHeight: '26px' }}>
      Made with
      <Box m={3} component="span">
        {hearth}
      </Box>
      in{' '}
      <b style={{ marginLeft: '4px' }}>
        <Tooltip withArrow label={<Text weight="lighter">a.k.a. Turkey</Text>} inline position="top-start">
          <Text component="span">Isekai</Text>
        </Tooltip>
      </b>
    </Box>
  );
}
