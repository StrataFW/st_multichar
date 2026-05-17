import { Box } from '@mantine/core'
import { memo } from 'react'

export const Background = memo(function Background() {
  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: -10, pointerEvents: 'none' }}>

      <Box
        sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: 96,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.65), transparent)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0, height: 220,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.7), transparent)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
          mixBlendMode: 'overlay',
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 1px, transparent 1px, transparent 3px)',
        }}
      />
    </Box>
  )
})
