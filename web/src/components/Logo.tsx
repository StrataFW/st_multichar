import { Box } from '@mantine/core'
import { memo } from 'react'
import logoUrl from '../../public/logo/logo.png'

interface Props {
  size?: number
  glow?: boolean
}

export const Logo = memo(function Logo({ size = 96, glow = true }: Props) {
  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      {glow && (
        <Box
          aria-hidden
          sx={(theme) => ({
            position: 'absolute',
            inset: -12,
            zIndex: -1,
            background: `radial-gradient(50% 50% at 50% 50%, ${theme.fn.rgba(theme.colors.blue[5], 0.45)}, ${theme.fn.rgba(theme.colors.blue[6], 0.10)} 45%, transparent 75%)`,
            filter: 'blur(20px)',
          })}
        />
      )}
      <Box
        sx={(theme) => ({
          width: '100%',
          height: '100%',
          backgroundImage: `url(${logoUrl})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          filter: glow ? `drop-shadow(0 0 22px ${theme.fn.rgba(theme.colors.blue[6], 0.45)})` : 'none',
          animation: glow ? 'breathe 6s ease-in-out infinite' : undefined,
        })}
      />
    </Box>
  )
})
