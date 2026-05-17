import { Box, Center, Divider, Group, Indicator, Kbd, Stack, Text, createStyles } from '@mantine/core'
import { memo, useEffect, useState } from 'react'
import { Logo } from './Logo'
import { sfx } from '../sfx'
import { nui } from '../nui-kit/nui'

const useStyles = createStyles((theme) => ({
  scrim: {
    position: 'absolute',
    inset: 0,
    zIndex: 30,
    cursor: 'pointer',
    background: theme.fn.rgba(theme.colors.dark[8], 0.65),
    transition: 'opacity 500ms ease-out, transform 500ms ease-out',
    overflow: 'hidden',
  },
  halo: {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(60% 50% at 50% 35%, ${theme.fn.rgba(theme.colors[theme.primaryColor][6], 0.18)}, transparent 65%)`,
    pointerEvents: 'none',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    opacity: 0.05,
    pointerEvents: 'none',
    backgroundImage:
      `linear-gradient(to right, ${theme.colors.dark[3]} 1px, transparent 1px),` +
      `linear-gradient(to bottom, ${theme.colors.dark[3]} 1px, transparent 1px)`,
    backgroundSize: '64px 64px',
    maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 25%, black 90%)',
    WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 25%, black 90%)',
  },
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 'clamp(48px, 3.5vw, 64px)',
    padding: '0 clamp(28px, 3vw, 56px)',
    background: theme.colors.dark[7],
    borderBottom: `1px solid ${theme.colors.dark[5]}`,
    pointerEvents: 'none',
    animation: 'fade-down 0.5s ease-out both',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 'clamp(48px, 3.5vw, 64px)',
    padding: '0 clamp(28px, 3vw, 56px)',
    background: theme.colors.dark[7],
    borderTop: `1px solid ${theme.colors.dark[5]}`,
    pointerEvents: 'none',
    animation: 'fade-up 0.5s ease-out both',
  },
  caps: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 600,
    fontSize: 'clamp(10px, 0.55vw, 12px)',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  centerCaps: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 600,
    fontSize: 'clamp(11px, 0.6vw, 13px)',
    letterSpacing: '0.36em',
    textTransform: 'uppercase',
  },
  brandName: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    fontSize: 'clamp(0.85rem, 0.95vw, 1rem)',
    letterSpacing: '0.18em',
    color: theme.white,
  },
  hero: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 800,
    fontSize: 'clamp(3rem, 7vw, 6rem)',
    lineHeight: 0.92,
    letterSpacing: '0.18em',
    color: theme.white,
  },
  tagline: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 600,
    fontSize: 'clamp(1.4rem, 3vw, 2.5rem)',
    lineHeight: 0.92,
    letterSpacing: '0.4em',
    textTransform: 'uppercase' as const,
    color: theme.colors.dark[3],
  },
  metaLine: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 500,
    fontSize: 'clamp(10px, 0.6vw, 13px)',
    letterSpacing: '0.32em',
    textTransform: 'uppercase' as const,
    color: theme.colors.dark[3],
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: theme.colors[theme.primaryColor][6],
  },
  pressRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'clamp(12px, 1vw, 16px)',
    paddingTop: 8,
  },
  pressRule: {
    width: 'clamp(28px, 2.4vw, 40px)',
    height: 1,
    background: `linear-gradient(90deg, transparent, ${theme.colors.dark[4]})`,
  },
  pressRuleRight: {
    width: 'clamp(28px, 2.4vw, 40px)',
    height: 1,
    background: `linear-gradient(90deg, ${theme.colors.dark[4]}, transparent)`,
  },
  enterKbd: {
    animation: 'breathe 2.4s ease-in-out infinite',
  },
}))

interface Props {
  brand: { name: string; tagline: string; version: string }
  onEnter: () => void
}

export const Welcome = memo(function Welcome({ brand, onEnter }: Props) {
  const { classes } = useStyles()
  const [pressed, setPressed] = useState(false)

  const dismiss = () => {
    sfx.swipe()
    void nui('welcomeDismissed')
    setPressed(true)
    onEnter()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        dismiss()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onEnter])

  return (
    <Box
      role="button"
      aria-label="Press Enter to continue"
      onClick={dismiss}
      className={classes.scrim}
      sx={{
        opacity: pressed ? 0 : 1,
        transform: pressed ? 'scale(1.04)' : 'scale(1)',
        animation: pressed ? undefined : 'fade-in 0.6s ease-out both',
      }}
    >
      <Box className={classes.grid} aria-hidden />

      <Box className={classes.topBar}>
        <Group spacing="md" align="center">
          <Box aria-hidden className={classes.brandDot} />
          <Text className={classes.brandName}>{brand.name}</Text>
          <Divider orientation="vertical" size="xs" color="dark.5" />
          <Text className={classes.caps} color="dark.3">{brand.tagline.toLowerCase()}</Text>
        </Group>

        <Group spacing="md" align="center">
          <Indicator processing color="blue" size={6} offset={0} position="middle-start" inline>
            <Text className={classes.caps} color="blue.4" sx={{ paddingLeft: 12 }}>online</Text>
          </Indicator>
          <Divider orientation="vertical" size="xs" color="dark.5" />
          <Text className={classes.caps} color="dark.3">{brand.version}</Text>
        </Group>
      </Box>

      <Center sx={{ position: 'relative', height: '100%', zIndex: 1 }}>
        <Stack spacing={32} align="center">
          <Logo size={120} />

          <Stack spacing={8} align="center">
            <Text className={classes.hero}>{brand.name}</Text>
            <Text className={classes.tagline}>{brand.tagline}</Text>
            <Text className={classes.metaLine} mt={6}>
              {brand.version} · built on ox_core
            </Text>
          </Stack>

          <Box className={classes.pressRow}>
            <Box aria-hidden className={classes.pressRule} />
            <Text className={classes.centerCaps} color="dark.2">press</Text>
            <Kbd className={classes.enterKbd}>Enter</Kbd>
            <Text className={classes.centerCaps} color="dark.2">to continue</Text>
            <Box aria-hidden className={classes.pressRuleRight} />
          </Box>
        </Stack>
      </Center>

      <Box className={classes.bottomBar}>
        <Group spacing="md" align="center">
          <Indicator processing color="blue" size={6} offset={0} position="middle-start" inline>
            <Text className={classes.caps} color="blue.4" sx={{ paddingLeft: 12 }}>ready</Text>
          </Indicator>
          <Divider orientation="vertical" size="xs" color="dark.5" />
          <Text className={classes.caps} color="dark.3">awaiting selection</Text>
        </Group>
        <Text className={classes.caps} color="dark.3">cerulean · lua 5.4</Text>
      </Box>
    </Box>
  )
})
