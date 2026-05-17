import { Box, Button, Group } from '@mantine/core'
import { Text } from '@mantine/core'
import { sfx } from '../sfx'

interface Props {
  mode: 'play' | 'create'
  busy: boolean
  canPlay: boolean
  onPlay: () => void
  onCreate: () => void
  onDelete?: () => void
}

export function ActionDock({ mode, busy, canPlay, onPlay, onCreate, onDelete }: Props) {
  return (
    <Group
      spacing={8}
      align="center"
      sx={{
        position: 'absolute',
        bottom: 'clamp(28px, 3vw, 48px)',
        left: 0,
        right: 0,
        zIndex: 10,
        justifyContent: 'center',
      }}
    >
      {mode === 'play' ? (
        <>
          {onDelete && (
            <Button
              onClick={() => { sfx.cancel(); onDelete() }}
              onMouseEnter={() => sfx.hover()}
              disabled={busy || !canPlay}
              title="Delete character"
              variant="subtle"
              color="gray"
              size="md"
              radius="sm"
            >
              Delete
            </Button>
          )}

          <Button
            onClick={() => { sfx.confirm(); onPlay() }}
            onMouseEnter={() => sfx.hover()}
            disabled={busy || !canPlay}
            variant="light"
            color="blue"
            size="md"
            radius="sm"
            leftIcon={
              <Box
                aria-hidden
                sx={{
                  width: 0,
                  height: 0,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderLeft: '8px solid currentColor',
                }}
              />
            }
          >
            {busy ? 'Loading' : 'Play'}
          </Button>
        </>
      ) : (
        <Button
          onClick={() => { sfx.click(); onCreate() }}
          onMouseEnter={() => sfx.hover()}
          disabled={busy}
          variant="light"
          color="blue"
          size="md"
          radius="sm"
          leftIcon={
            <Text sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1 }}>+</Text>
          }
        >
          {busy ? 'Creating' : 'Create Identity'}
        </Button>
      )}
    </Group>
  )
}
