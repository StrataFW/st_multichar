import { Box, Center, Divider, Group, Indicator, Stack, Text, Transition, createStyles } from '@mantine/core'
import { memo, useEffect, useMemo, useState } from 'react'
import { Logo } from './Logo'

const useStyles = createStyles((theme) => ({
  scrim: {
    position: 'absolute',
    inset: 0,
    zIndex: 25,
    background: theme.fn.rgba(theme.colors.dark[8], 0.65),
    transition: 'opacity 350ms ease-out',
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
  },
  caps: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 600,
    fontSize: 'clamp(10px, 0.55vw, 12px)',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  brandDot: {
    width: 6, height: 6,
    borderRadius: '50%',
    background: theme.colors[theme.primaryColor][6],
  },
  brandName: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    fontSize: 'clamp(0.85rem, 0.95vw, 1rem)',
    letterSpacing: '0.18em',
    color: theme.white,
  },
  stepCaps: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 600,
    fontSize: 'clamp(11px, 0.6vw, 13px)',
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
  },
  pctBig: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    fontSize: 'clamp(1.1rem, 1.4vw, 1.45rem)',
    letterSpacing: '0.04em',
    fontVariantNumeric: 'tabular-nums',
  },
  barTrack: {
    position: 'relative',
    width: 'min(420px, 60vw)',
    height: 3,
    overflow: 'hidden',
    borderRadius: 999,
    background: theme.colors.dark[6],
  },
  barSlider: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: '33%',
    background: `linear-gradient(90deg, transparent, ${theme.colors[theme.primaryColor][6]}, transparent)`,
    filter: `drop-shadow(0 0 8px ${theme.fn.rgba(theme.colors[theme.primaryColor][6], 0.85)})`,
    animation: 'loading-bar 1.6s linear infinite',
  },
}))

const STEPS = [
  'Connecting to the city',
  'Loading character manifest',
  'Capturing mugshots',
  'Ready',
] as const

const TOTAL_MS = 3200
const FADE_OUT_MS = 350

interface Props {
  brand: { name: string; tagline: string; version: string }
  onDone: () => void
}

export const CharLoading = memo(function CharLoading({ brand, onDone }: Props) {
  const { classes } = useStyles()
  const [stepIdx, setStepIdx] = useState(0)
  const [stepMounted, setStepMounted] = useState(true)
  const [pct, setPct] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / TOTAL_MS)
      const eased = 1 - Math.pow(1 - t, 3)
      setPct(Math.round(eased * 100))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const stepDuration = TOTAL_MS / STEPS.length
    const id = window.setInterval(() => {
      setStepMounted(false)
      window.setTimeout(() => {
        setStepIdx((p) => Math.min(p + 1, STEPS.length - 1))
        setStepMounted(true)
      }, 220)
    }, stepDuration)

    const exit = window.setTimeout(() => {
      setExiting(true)
      window.setTimeout(onDone, FADE_OUT_MS)
    }, TOTAL_MS)

    return () => { window.clearInterval(id); window.clearTimeout(exit) }
  }, [onDone])

  const pctStr = useMemo(() => String(pct).padStart(2, '0'), [pct])

  return (
    <Box
      className={classes.scrim}
      sx={{
        opacity: exiting ? 0 : 1,
        animation: exiting ? undefined : 'fade-in 0.4s ease-out both',
      }}
    >
      <Box className={classes.halo} aria-hidden />
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
            <Text className={classes.caps} color="blue.4" sx={{ paddingLeft: 12 }}>warming up</Text>
          </Indicator>
          <Divider orientation="vertical" size="xs" color="dark.5" />
          <Text className={classes.caps} color="dark.3">{brand.version}</Text>
        </Group>
      </Box>

      <Center sx={{ position: 'relative', height: '100%', zIndex: 1 }}>
        <Stack spacing={28} align="center">
          <Logo size={88} />

          <Stack spacing={14} align="stretch" w="min(420px, 60vw)">
            <Group position="apart" align="center" noWrap>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Transition mounted={stepMounted} transition="fade" duration={220}>
                  {(styles) => (
                    <Text
                      className={classes.stepCaps}
                      color="dark.0"
                      style={styles}
                      sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {STEPS[stepIdx]}
                    </Text>
                  )}
                </Transition>
              </Box>
              <Group spacing={6} align="baseline" sx={{ flexShrink: 0 }}>
                <Text className={classes.pctBig} color="dark.0">{pctStr}</Text>
                <Text className={classes.stepCaps} color="blue.4">%</Text>
              </Group>
            </Group>

            <Box className={classes.barTrack}>
              <Box className={classes.barSlider} />
            </Box>
          </Stack>
        </Stack>
      </Center>

      <Box className={classes.bottomBar}>
        <Group spacing="md" align="center">
          <Indicator processing color="blue" size={6} offset={0} position="middle-start" inline>
            <Text className={classes.caps} color="blue.4" sx={{ paddingLeft: 12 }}>linking</Text>
          </Indicator>
          <Divider orientation="vertical" size="xs" color="dark.5" />
          <Text className={classes.caps} color="dark.3">preparing your roster</Text>
        </Group>
        <Text className={classes.caps} color="dark.3">cerulean · lua 5.4</Text>
      </Box>
    </Box>
  )
})
