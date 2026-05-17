import { Box, Stack, Text, createStyles } from '@mantine/core'
import type { CharacterFlavor, CharacterSummary } from '../types'

const useStyles = createStyles((theme) => ({
  root: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 'clamp(48px, 5vw, 96px)',
    width: 'min(55vw, 720px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    zIndex: 10,
    pointerEvents: 'none',
    animation: 'fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  eyebrow: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 600,
    fontSize: 'clamp(10px, 0.55vw, 12px)',
    letterSpacing: '0.36em',
    textTransform: 'uppercase' as const,
    color: theme.colors[theme.primaryColor][4],
    marginBottom: 'clamp(10px, 0.8vw, 14px)',
  },
  hero: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 800,
    fontSize: 'clamp(2.6rem, 5.4vw, 5rem)',
    lineHeight: 0.92,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: theme.white,
    textShadow: '0 4px 24px rgba(0, 0, 0, 0.85), 0 1px 3px rgba(0, 0, 0, 0.6)',
  },
  rule: {
    width: 'clamp(40px, 3.5vw, 64px)',
    height: 2,
    marginTop: 'clamp(14px, 1.2vw, 20px)',
    marginBottom: 'clamp(14px, 1.2vw, 20px)',
    background: theme.colors[theme.primaryColor][6],
    boxShadow: `0 0 14px ${theme.fn.rgba(theme.colors[theme.primaryColor][6], 0.7)}`,
  },
  metaRow: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 500,
    fontSize: 'clamp(11px, 0.7vw, 14px)',
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    color: theme.colors.dark[1],
    textShadow: '0 1px 4px rgba(0, 0, 0, 0.85)',
  },
  metaAccent: {
    color: theme.colors[theme.primaryColor][4],
  },
  flavor: {
    marginTop: 'clamp(14px, 1.1vw, 20px)',
    maxWidth: 'min(46vw, 560px)',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 400,
    fontSize: 'clamp(12px, 0.78vw, 15px)',
    lineHeight: 1.55,
    color: theme.colors.dark[1],
    textShadow: '0 1px 4px rgba(0, 0, 0, 0.85)',
  },
}))

interface Props {
  character: CharacterSummary | null
  flavor?: CharacterFlavor
}

function genderLabel(g: string | number): string {
  const v = String(g).toLowerCase()
  if (v === 'male' || v === '0') return 'Male'
  if (v === 'female' || v === '1') return 'Female'
  return 'Non-binary'
}

function age(dob?: string): string {
  if (!dob) return ''
  const t = Date.parse(dob)
  if (isNaN(t)) return ''
  return String(Math.floor((Date.now() - t) / (365.25 * 24 * 3600 * 1000)))
}

function formatRelative(d?: string): string {
  if (!d) return 'Never'
  const t = Date.parse(d)
  if (isNaN(t)) return d
  const diff = Date.now() - t
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(t).toLocaleDateString()
}

export function VitalPill({ character, flavor }: Props) {
  const { classes } = useStyles()

  if (!character) {
    return (
      <Box className={classes.root}>
        <Text className={classes.eyebrow}>Empty slot</Text>
        <Stack spacing={0}>
          <Text className={classes.hero}>New</Text>
          <Text className={classes.hero}>Identity</Text>
        </Stack>
        <Box aria-hidden className={classes.rule} />
        <Text className={classes.flavor}>
          Choose a name and identity to begin a new life in the city.
        </Text>
      </Box>
    )
  }

  const sex = genderLabel(character.gender)
  const ageStr = age(flavor?.dateOfBirth ?? character.dateOfBirth)
  const lastSeen = formatRelative(character.lastPlayed)

  return (
    <Box className={classes.root}>
      <Text className={classes.eyebrow}>
        #{character.stateId}
        {flavor?.groupLabel ? ` · ${flavor.groupLabel}` : ''}
      </Text>

      <Stack spacing={0}>
        <Text className={classes.hero}>{character.firstName}</Text>
        <Text className={classes.hero}>{character.lastName}</Text>
      </Stack>

      <Box aria-hidden className={classes.rule} />

      <Text className={classes.metaRow}>
        {sex}
        {ageStr && <> · <span className={classes.metaAccent}>{ageStr}</span></>}
        {' · Last seen '}
        <span className={classes.metaAccent}>{lastSeen}</span>
      </Text>
    </Box>
  )
}
