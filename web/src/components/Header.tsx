import { Box, Divider, Group, Indicator, Kbd, Text, Transition, createStyles } from '@mantine/core'
import { Fragment, memo, useEffect, useState, type ReactNode } from 'react'

const useStyles = createStyles((theme) => ({
  bar: {
    position: 'fixed',
    left: 0, right: 0, top: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 'clamp(48px, 3.5vw, 64px)',
    padding: '0 clamp(28px, 3vw, 56px)',
    borderBottom: `1px solid ${theme.colors.dark[5]}`,
    backgroundColor: theme.colors.dark[7],
    animation: 'fade-down 0.5s ease-out both',
  },
  tipCell: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(10px, 0.7vw, 14px)',
    maxWidth: '50vw',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  caps: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 600,
    fontSize: 'clamp(10px, 0.55vw, 12px)',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  brandName: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    fontSize: 'clamp(0.85rem, 0.95vw, 1rem)',
    letterSpacing: '0.18em',
    color: theme.white,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: theme.colors[theme.primaryColor][6],
  },
  accentRule: {
    width: 24,
    height: 1,
    background: theme.fn.rgba(theme.colors[theme.primaryColor][6], 0.6),
  },
}))

const TIP_ROTATE_MS = 6000

interface Props {
  brand: { name: string; tagline: string; version: string }
}

export const Header = memo(function Header({ brand }: Props) {
  const { classes } = useStyles()
  const [time, setTime] = useState(() => stamp())

  useEffect(() => {
    const id = window.setInterval(() => setTime(stamp()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const tips: ReactNode[] = [
    (
      <Fragment>
        <Text className={classes.caps} color="dark.1">Type</Text>
        <Kbd>/logout</Kbd>
        <Text className={classes.caps} color="dark.1">in chat to swap characters mid-session</Text>
      </Fragment>
    ),
    (
      <Fragment>
        <Kbd>←</Kbd>
        <Kbd>→</Kbd>
        <Text className={classes.caps} color="dark.1">to navigate slots</Text>
      </Fragment>
    ),
    (
      <Fragment>
        <Kbd>Enter</Kbd>
        <Text className={classes.caps} color="dark.1">to play the active character</Text>
      </Fragment>
    ),
    (
      <Fragment>
        <Kbd>1</Kbd>
        <Kbd>…</Kbd>
        <Kbd>9</Kbd>
        <Text className={classes.caps} color="dark.1">to jump directly to a slot</Text>
      </Fragment>
    ),
  ]

  const [tipIdx, setTipIdx] = useState(0)
  const [tipMounted, setTipMounted] = useState(true)

  useEffect(() => {
    const id = window.setInterval(() => {
      setTipMounted(false)
      window.setTimeout(() => {
        setTipIdx((p) => (p + 1) % tips.length)
        setTipMounted(true)
      }, 350)
    }, TIP_ROTATE_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <Box component="header" className={classes.bar}>
      <Group spacing="md" align="center">
        <Box aria-hidden className={classes.dot} />
        <Text className={classes.brandName}>{brand.name}</Text>
        <Divider orientation="vertical" size="xs" color="dark.5" />
        <Text className={classes.caps} color="dark.3">{brand.tagline.toLowerCase()}</Text>
      </Group>

      <Box className={classes.tipCell}>
        <Text className={classes.caps} color="blue.4" weight={700}>tip</Text>
        <Box className={classes.accentRule} aria-hidden />
        <Transition mounted={tipMounted} transition="fade" duration={350} timingFunction="ease">
          {(styles) => (
            <Group spacing={6} align="center" style={styles}>
              {tips[tipIdx]}
            </Group>
          )}
        </Transition>
      </Box>

      <Group spacing="md" align="center">
        <Indicator processing color="blue" size={6} offset={0} position="middle-start" inline>
          <Text className={classes.caps} color="blue.4" sx={{ paddingLeft: 12 }}>live</Text>
        </Indicator>
        <Divider orientation="vertical" size="xs" color="dark.5" />
        <Text className={classes.caps} color="dark.0" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {time}
        </Text>
        <Divider orientation="vertical" size="xs" color="dark.5" />
        <Text className={classes.caps} color="dark.3">{brand.version}</Text>
      </Group>
    </Box>
  )
})

function stamp() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}
