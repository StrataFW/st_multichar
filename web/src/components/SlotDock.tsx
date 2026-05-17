import { Box, Group, UnstyledButton, createStyles } from '@mantine/core'
import type { CharacterSummary } from '../types'
import { sfx } from '../sfx'

const useStyles = createStyles((theme) => ({
  dock: {
    position: 'absolute',
    bottom: 'clamp(96px, 9vw, 128px)',
    left: 0,
    right: 0,
    zIndex: 10,
    display: 'flex',
    justifyContent: 'center',
    animation: 'fade-up 0.5s ease-out both',
  },
  outer: {
    position: 'relative',
    width: 'clamp(96px, 8vw, 120px)',
    height: 'clamp(96px, 8vw, 120px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'pop-in 0.32s ease-out both',
  },
  topDot: {
    position: 'absolute',
    top: -4,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: theme.colors[theme.primaryColor][6],
    boxShadow: `0 0 8px ${theme.fn.rgba(theme.colors[theme.primaryColor][6], 0.85)}`,
  },
  inner: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    transition: 'all 0.2s ease-out',
    overflow: 'hidden',
  },
  innerActiveFilled: {
    border: `1px solid ${theme.colors[theme.primaryColor][6]}`,
    boxShadow: `0 0 30px -6px ${theme.fn.rgba(theme.colors[theme.primaryColor][6], 0.85)}, inset 0 0 0 1px ${theme.fn.rgba(theme.colors[theme.primaryColor][6], 0.22)}`,
    background: theme.colors.dark[8],
  },
  innerIdleFilled: {
    border: `1px solid ${theme.colors.dark[5]}`,
    background: theme.fn.rgba(theme.colors.dark[8], 0.55),
  },
  innerActiveEmpty: {
    border: `1px dashed ${theme.fn.rgba(theme.colors[theme.primaryColor][6], 0.7)}`,
  },
  innerIdleEmpty: {
    border: `1px dashed ${theme.colors.dark[5]}`,
    background: theme.fn.rgba(theme.colors.dark[8], 0.30),
  },
  slotNumber: {
    position: 'absolute',
    top: 6,
    left: 8,
    zIndex: 1,
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 600,
    fontSize: 'clamp(9px, 0.5vw, 11px)',
    letterSpacing: '0.20em',
    transition: 'color 0.2s ease-out',
  },
  initials: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 800,
    lineHeight: 1,
    transition: 'all 0.2s ease-out',
  },
  bottomRail: {
    position: 'absolute',
    left: 12, right: 12,
    bottom: 4,
    height: 2,
    borderRadius: 999,
    background: `linear-gradient(90deg, transparent, ${theme.colors[theme.primaryColor][6]}, transparent)`,
  },
  imgWash: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: `linear-gradient(180deg, ${theme.fn.rgba(theme.colors.dark[9], 0.25)} 0%, transparent 35%, transparent 65%, ${theme.fn.rgba(theme.colors.dark[9], 0.55)} 100%)`,
  },
}))

interface Props {
  slots: (CharacterSummary | null)[]
  activeIndex: number | null
  mugshots?: Record<number, string>
  onSelect: (index: number) => void
}

export function SlotDock({ slots, activeIndex, mugshots, onSelect }: Props) {
  const { classes } = useStyles()
  return (
    <Box className={classes.dock}>
      <Group spacing={10} align="center">
        {slots.map((c, i) => (
          <DockTile
            key={i}
            index={i}
            character={c}
            mugshot={c ? mugshots?.[c.charId] : undefined}
            active={i === activeIndex}
            onClick={() => onSelect(i)}
          />
        ))}
      </Group>
    </Box>
  )
}

function DockTile({
  index,
  character,
  mugshot,
  active,
  onClick,
}: {
  index: number
  character: CharacterSummary | null
  mugshot?: string
  active: boolean
  onClick: () => void
}) {
  const { classes, cx, theme } = useStyles()
  const slotNum = String(index + 1).padStart(2, '0')
  const initials = character
    ? `${character.firstName[0] ?? ''}${character.lastName[0] ?? ''}`.toUpperCase()
    : '+'

  const innerSizeActive = 'clamp(96px, 8vw, 120px)'
  const innerSizeIdle = 'clamp(68px, 5.6vw, 84px)'
  const innerSizeHover = 'clamp(80px, 6.6vw, 100px)'

  const innerVariantClass = character
    ? active ? classes.innerActiveFilled : classes.innerIdleFilled
    : active ? classes.innerActiveEmpty : classes.innerIdleEmpty

  return (
    <UnstyledButton
      onClick={() => { sfx.click(); onClick() }}
      onMouseEnter={() => sfx.hover()}
      className={classes.outer}
      sx={{
        animationDelay: `${index * 60}ms`,
        '&:hover .slot-inner': {
          width: active ? innerSizeActive : innerSizeHover,
          height: active ? innerSizeActive : innerSizeHover,
        },
      }}
    >
      {active && <Box aria-hidden className={classes.topDot} />}

      <Box
        className={cx('slot-inner', classes.inner, innerVariantClass)}
        sx={{
          width: active ? innerSizeActive : innerSizeIdle,
          height: active ? innerSizeActive : innerSizeIdle,
        }}
      >
        <Box
          component="span"
          className={classes.slotNumber}
          sx={{
            color: active && character
              ? theme.colors[theme.primaryColor][4]
              : theme.colors.dark[3],
          }}
        >
          {slotNum}
        </Box>

        {character && mugshot ? (
          <>
            <Box
              component="img"
              src={mugshot}
              alt=""
              draggable={false}
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                borderRadius: theme.radius.sm,
                objectFit: 'cover',
                objectPosition: '50% 28%',
              }}
            />
            <Box aria-hidden className={classes.imgWash} />
          </>
        ) : (
          <Box
            component="span"
            className={classes.initials}
            sx={{
              fontSize: active ? 'clamp(1.5rem, 1.7vw, 2.125rem)' : 'clamp(1.1rem, 1.2vw, 1.5rem)',
              color: character
                ? active ? theme.colors[theme.primaryColor][4] : theme.colors.dark[1]
                : active ? theme.fn.rgba(theme.colors[theme.primaryColor][6], 0.85) : theme.colors.dark[3],
            }}
          >
            {initials}
          </Box>
        )}

        {active && <Box className={classes.bottomRail} />}
      </Box>
    </UnstyledButton>
  )
}
