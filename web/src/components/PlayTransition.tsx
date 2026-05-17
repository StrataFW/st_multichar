import { Box, Stack, Text, createStyles } from '@mantine/core'

const useStyles = createStyles((theme) => ({
  scrim: {
    position: 'absolute',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: theme.colors.dark[9],
    animation: 'fade-in 0.3s ease-out both',
  },
  glow: {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(40% 50% at 50% 50%, ${theme.fn.rgba(theme.colors[theme.primaryColor][6], 0.18)}, transparent 70%)`,
    animation: 'fade-in 0.45s ease-out both',
  },
  scanlines: {
    position: 'absolute',
    inset: 0,
    opacity: 0.07,
    mixBlendMode: 'overlay',
    backgroundImage:
      'repeating-linear-gradient(0deg, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 1px, transparent 1px, transparent 3px)',
  },
  caps: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 600,
    fontSize: 'clamp(11px, 0.6vw, 13px)',
    letterSpacing: '0.42em',
    textTransform: 'uppercase',
  },
  hero: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 800,
    fontSize: 'clamp(2.4rem, 5vw, 4rem)',
    lineHeight: 0.95,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    color: theme.white,
    textShadow: '0 4px 24px rgba(0, 0, 0, 0.85)',
  },
  bar: {
    position: 'relative',
    marginTop: 12,
    height: 2,
    width: 224,
    overflow: 'hidden',
    borderRadius: 999,
    background: theme.colors.dark[6],
    animation: 'fade-up 0.5s ease-out 0.50s both',
  },
  barFill: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: '33%',
    background: `linear-gradient(90deg, transparent, ${theme.colors[theme.primaryColor][6]}, transparent)`,
    filter: `drop-shadow(0 0 8px ${theme.fn.rgba(theme.colors[theme.primaryColor][6], 0.85)})`,
    animation: 'loading-bar 1.6s linear infinite',
  },
}))

interface Props {
  firstName: string
  lastName: string
  stateId: string
}

export function PlayTransition({ firstName, lastName, stateId }: Props) {
  const { classes } = useStyles()
  return (
    <Box className={classes.scrim}>
      <Box className={classes.glow} />
      <Box className={classes.scanlines} />

      <Stack spacing={16} align="center" sx={{ position: 'relative', padding: '0 32px', textAlign: 'center' }}>
        <Text
          className={classes.caps}
          color="blue.4"
          sx={{ animation: 'fade-up 0.5s ease-out 0.05s both' }}
        >
          Stepping In
        </Text>

        <Box>
          <Text className={classes.hero} sx={{ animation: 'fade-up 0.6s ease-out 0.18s both' }}>
            {firstName.toUpperCase()}
          </Text>
          <Text className={classes.hero} sx={{ animation: 'fade-up 0.6s ease-out 0.30s both' }}>
            {lastName.toUpperCase()}
          </Text>
        </Box>

        <Text
          className={classes.caps}
          color="dark.2"
          sx={{ animation: 'fade-up 0.5s ease-out 0.42s both', letterSpacing: '0.36em' }}
        >
          {stateId}
        </Text>

        <Box className={classes.bar}>
          <Box className={classes.barFill} />
        </Box>

        <Text
          className={classes.caps}
          color="dark.3"
          sx={{ animation: 'fade-up 0.5s ease-out 0.65s both', letterSpacing: '0.32em' }}
        >
          Loading the city
        </Text>
      </Stack>
    </Box>
  )
}
