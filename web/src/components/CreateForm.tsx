import { Box, Button, Group, SimpleGrid, Stack, Text, TextInput, UnstyledButton, createStyles } from '@mantine/core'
import { useEffect, useState } from 'react'

const useStyles = createStyles((theme) => ({
  scrim: {
    position: 'absolute',
    inset: 0,
    zIndex: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.55)',
    animation: 'fade-in 0.3s ease-out both',
  },
  panel: {
    position: 'relative',
    width: 'min(520px, 90vw)',
    overflow: 'hidden',
    borderRadius: theme.radius.md,
    background: theme.colors.dark[8],
    border: `1px solid ${theme.colors.dark[5]}`,
    boxShadow: '0 18px 45px rgba(0, 0, 0, 0.45)',
  },
  header: {
    borderBottom: `1px solid ${theme.colors.dark[5]}`,
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
  field: {
    background: theme.colors.dark[7],
    border: `1px solid ${theme.colors.dark[5]}`,
    borderRadius: theme.radius.sm,
    padding: 'clamp(8px, 0.7vw, 12px)',
    transition: 'border-color 0.15s ease',
    '&:focus-within': { borderColor: theme.colors[theme.primaryColor][6] },
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
    fontSize: 'clamp(1.15rem, 1.4vw, 1.5rem)',
    lineHeight: 1,
    letterSpacing: '0.04em',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: theme.colors[theme.primaryColor][6],
  },
}))

const inputSx = {
  background: 'transparent',
  border: 'none',
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 600,
  fontSize: 'clamp(13px, 0.85vw, 16px)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  color: '#fff',
  '&::placeholder': { color: 'rgba(255,255,255,0.20)' },
}

interface Props {
  onSubmit: (data: { firstName: string; lastName: string; gender: 'male' | 'female' | 'non_binary'; dateOfBirth: string }) => void
  onPreviewGender: (gender: 'male' | 'female') => void
  onCancel: () => void
  busy: boolean
}

const NAME_RE = /^[A-Za-z'][A-Za-z' -]{0,49}$/

export function CreateForm({ onSubmit, onPreviewGender, onCancel, busy }: Props) {
  const { classes } = useStyles()
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'non_binary'>('male')
  const [dob, setDob] = useState('2000-01-01')

  useEffect(() => {
    onPreviewGender(gender === 'female' ? 'female' : 'male')
  }, [gender, onPreviewGender])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const valid =
    NAME_RE.test(first.trim()) &&
    NAME_RE.test(last.trim()) &&
    !!dob &&
    Date.parse(dob) < Date.now() - 16 * 365.25 * 24 * 3600 * 1000

  return (
    <Box className={classes.scrim}>
      <Box className={classes.panel}>
        <Group position="apart" align="center" className={classes.header}>
          <Group spacing={12} align="center">
            <Box aria-hidden className={classes.dot} />
            <Text className={classes.caps} color="blue.4">New Character</Text>
          </Group>
          <UnstyledButton onClick={onCancel}>
            <Text className={classes.caps} color="dark.3" sx={{ '&:hover': { color: '#fff' } }}>
              Esc · Cancel
            </Text>
          </UnstyledButton>
        </Group>

        <Stack className={classes.body} spacing={16}>
          <Box>
            <Text className={classes.hero} color="dark.0">CREATE</Text>
            <Text className={classes.hero} color="dark.0">IDENTITY</Text>
          </Box>

          <SimpleGrid cols={2} spacing={12}>
            <FieldShell label="First Name">
              <TextInput
                value={first}
                onChange={(e) => setFirst(e.currentTarget.value)}
                placeholder="John"
                maxLength={50}
                autoFocus
                variant="unstyled"
                styles={{ input: inputSx }}
              />
            </FieldShell>

            <FieldShell label="Last Name">
              <TextInput
                value={last}
                onChange={(e) => setLast(e.currentTarget.value)}
                placeholder="Smith"
                maxLength={50}
                variant="unstyled"
                styles={{ input: inputSx }}
              />
            </FieldShell>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Text className={classes.caps} color="dark.3" mb={6}>Gender</Text>
              <SimpleGrid cols={3} spacing={6}>
                {(['male', 'female', 'non_binary'] as const).map((g) => (
                  <Button
                    key={g}
                    onClick={() => setGender(g)}
                    variant={gender === g ? 'light' : 'subtle'}
                    color={gender === g ? 'blue' : 'gray'}
                    size="sm"
                    radius="sm"
                  >
                    {g === 'non_binary' ? 'Non-binary' : g}
                  </Button>
                ))}
              </SimpleGrid>
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <FieldShell label="Date of Birth">
                <Box
                  component="input"
                  type="date"
                  value={dob}
                  min="1900-01-01"
                  max="2010-01-01"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDob(e.target.value)}
                  sx={{
                    ...inputSx,
                    outline: 'none',
                    width: '100%',
                    padding: 0,
                    textTransform: 'none',
                    '&::-webkit-calendar-picker-indicator': { filter: 'invert(1) opacity(0.6)' },
                  }}
                />
              </FieldShell>
            </Box>
          </SimpleGrid>
        </Stack>

        <Group className={classes.footer} spacing={10} align="center" mt={20}>
          <Button onClick={onCancel} disabled={busy} variant="subtle" color="gray" size="sm" radius="sm">
            Cancel
          </Button>
          <Button
            disabled={!valid || busy}
            onClick={() =>
              onSubmit({
                firstName: first.trim(),
                lastName: last.trim(),
                gender,
                dateOfBirth: dob,
              })
            }
            variant="light"
            color="blue"
            size="sm"
            radius="sm"
            sx={{ flex: 1 }}
          >
            {busy ? 'Creating…' : 'Create & Play'}
          </Button>
        </Group>
      </Box>
    </Box>
  )
}

function FieldShell({ label, children }: { label: string; children: React.ReactNode }) {
  const { classes } = useStyles()
  return (
    <Stack spacing={4} className={classes.field}>
      <Text className={classes.caps} color="dark.3">{label}</Text>
      {children}
    </Stack>
  )
}
