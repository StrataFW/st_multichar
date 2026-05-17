import { Box, Text, createStyles } from '@mantine/core'
import { memo } from 'react'

const useStyles = createStyles((theme) => ({
  root: {
    position: 'absolute',
    left: 0, right: 0,
    bottom: 'clamp(24px, 2.4vw, 36px)',
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
    animation: 'fade-in 0.35s ease-out both',
    zIndex: 5,
  },
  caption: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 600,
    fontSize: 'clamp(10px, 0.6vw, 12px)',
    letterSpacing: '0.4em',
    textTransform: 'uppercase' as const,
    color: theme.colors.dark[2],
    textShadow: '0 1px 8px rgba(0,0,0,0.85)',
  },
}))

export const IdlePrompt = memo(function IdlePrompt() {
  const { classes } = useStyles()
  return (
    <Box className={classes.root}>
      <Text className={classes.caption}>Select a Character</Text>
    </Box>
  )
})
