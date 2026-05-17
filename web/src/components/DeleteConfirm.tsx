import { Box, Button, Group, Stack, Text, TextInput, UnstyledButton, createStyles } from '@mantine/core'
import { useEffect, useState } from 'react'
import type { CharacterSummary } from '../types'
import { sfx } from '../sfx'

const useStyles = createStyles((theme) => ({
  scrim: {
    position: 'absolute',
    inset: 0,
    zIndex: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.65)',
    animation: 'fade-in 0.3s ease-out both',
  },
  panel: {
    position: 'relative',
    width: 'min(480px, 90vw)',
    overflow: 'hidden',
    borderRadius: theme.radius.md,
    background: theme.colors.dark[8],
    border: `1px solid ${theme.colors.dark[5]}`,
    boxShadow: '0 18px 45px rgba(0, 0, 0, 0.45)',
  },
  header: {
    borderBottom: `1px solid ${theme.colors.red[8]}`,
    background: theme.fn.rgba(theme.colors.red[6], 0.10),
    padding: 'clamp(12px, 1vw, 16px) clamp(20px, 1.6vw, 28px)',
  },
  body: {
    padding: 'clamp(18px, 1.6vw, 24px) clamp(20px, 1.6vw, 28px) 0',
  },
  footer: {
    borderTop: `1px solid ${theme.colors.dark[5]}`,
    background: theme.colors.dark[7],
    padding: 'clamp(14px, 1.4vw, 20px) clamp(20px, 1.6vw, 28px)',
  },
  caps: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 600,
    fontSize: 'clamp(10px, 0.55vw, 12px)',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  hero: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 800,
    fontSize: 'clamp(1.4rem, 2vw, 1.85rem)',
    lineHeight: 0.95,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    color: theme.white,
  },
  warningBox: {
    margin: 'clamp(14px, 1.2vw, 20px) clamp(20px, 1.6vw, 28px) 0',
    padding: 'clamp(10px, 0.9vw, 14px) clamp(16px, 1.2vw, 20px)',
    borderRadius: theme.radius.sm,
    border: `1px solid ${theme.fn.rgba(theme.colors.red[6], 0.25)}`,
    background: theme.fn.rgba(theme.colors.red[6], 0.06),
  },
  field: {
    margin: 'clamp(14px, 1.2vw, 20px) clamp(20px, 1.6vw, 28px) 0',
    padding: 'clamp(8px, 0.7vw, 12px)',
    borderRadius: theme.radius.sm,
    background: theme.colors.dark[7],
    border: `1px solid ${theme.colors.dark[5]}`,
    transition: 'border-color 0.15s ease',
    '&:focus-within': { borderColor: theme.colors[theme.primaryColor][6] },
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: theme.colors.red[6],
  },
}))

interface Props {
  character: CharacterSummary
  requireName: boolean
  onCancel: () => void
  onConfirm: () => void
  busy: boolean
}

export function DeleteConfirm({ character, requireName, onCancel, onConfirm, busy }: Props) {
  const { classes } = useStyles()
  const [typed, setTyped] = useState('')
  const fullName = `${character.firstName} ${character.lastName}`
  const ok = !requireName || typed.trim().toLowerCase() === fullName.toLowerCase()

  useEffect(() => {
    sfx.cancel()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <Box className={classes.scrim}>
      <Box className={classes.panel}>
        <Group position="apart" align="center" className={classes.header}>
          <Group spacing={12} align="center">
            <Box aria-hidden className={classes.dot} />
            <Text className={classes.caps} color="red.4">Permanent Action</Text>
          </Group>
          <UnstyledButton onClick={() => { sfx.cancel(); onCancel() }}>
            <Text className={classes.caps} color="dark.3" sx={{ '&:hover': { color: '#fff' } }}>
              Esc · Cancel
            </Text>
          </UnstyledButton>
        </Group>

        <Stack className={classes.body} spacing={8}>
          <Text className={classes.caps} color="dark.2">About to delete</Text>
          <Box>
            <Text className={classes.hero}>{character.firstName}</Text>
            <Text className={classes.hero}>{character.lastName}</Text>
          </Box>
        </Stack>

        <Box className={classes.warningBox}>
          <Text sx={{ fontSize: 'clamp(12px, 0.75vw, 14px)', lineHeight: 1.55, color: '#C1C2C5' }}>
            This wipes the character, their inventory, vehicles, and accounts.{' '}
            <Text component="span" weight={700} color="red.4">It cannot be undone.</Text>
          </Text>
        </Box>

        {requireName && (
          <Stack spacing={4} className={classes.field}>
            <Text className={classes.caps} color="dark.3">
              Type{' '}
              <Text component="span" weight={700} sx={{ textTransform: 'none', color: '#C1C2C5' }}>
                {fullName}
              </Text>{' '}
              to confirm
            </Text>
            <TextInput
              value={typed}
              onChange={(e) => setTyped(e.currentTarget.value)}
              autoFocus
              variant="unstyled"
              styles={{
                input: {
                  background: 'transparent',
                  border: 'none',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(13px, 0.85vw, 16px)',
                  letterSpacing: '0.04em',
                  color: '#fff',
                  '&::placeholder': { color: 'rgba(255,255,255,0.20)' },
                },
              }}
            />
          </Stack>
        )}

        <Group mt={20} spacing={10} align="center" className={classes.footer}>
          <Button
            onClick={() => { sfx.cancel(); onCancel() }}
            disabled={busy}
            variant="subtle"
            color="gray"
            size="sm"
            radius="sm"
            sx={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => { sfx.confirm(); onConfirm() }}
            disabled={!ok || busy}
            variant="light"
            color="red"
            size="sm"
            radius="sm"
            sx={{ flex: 1 }}
          >
            {busy ? 'Deleting…' : 'Delete'}
          </Button>
        </Group>
      </Box>
    </Box>
  )
}
