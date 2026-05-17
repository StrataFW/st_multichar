import { Box, Button, Group, Stack, Text } from '@mantine/core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Background } from './components/Background'
import { Header } from './components/Header'
import { VitalPill } from './components/VitalPill'
import { SlotDock } from './components/SlotDock'
import { ActionDock } from './components/ActionDock'
import { CreateForm } from './components/CreateForm'
import { DeleteConfirm } from './components/DeleteConfirm'
import { Welcome } from './components/Welcome'
import { IdlePrompt } from './components/IdlePrompt'
import { CharLoading } from './components/CharLoading'
import { PlayTransition } from './components/PlayTransition'
import { DEFAULT_BRAND, DEV_MOCK } from './config'
import type { CharacterSummary, ShowPayload } from './types'
import { nui } from './nui-kit/nui'
import { sfx } from './sfx'

const monoCaps = {
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 500,
  fontSize: 'clamp(10px, 0.55vw, 12px)',
  letterSpacing: '0.20em',
  textTransform: 'uppercase' as const,
}

type Mode =
  | { kind: 'list' }
  | { kind: 'create'; slotIndex: number }
  | { kind: 'delete'; character: CharacterSummary }

export default function App() {
  const [visible, setVisible] = useState(false)
  const [data, setData] = useState<ShowPayload>({
    characters: DEV_MOCK.characters,
    appearances: {},
    summaries: DEV_MOCK.summaries,
    maxSlots: DEV_MOCK.maxSlots,
    brand: DEFAULT_BRAND,
    confirmByName: true,
  })
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [mode, setMode] = useState<Mode>({ kind: 'list' })
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState<'welcome' | 'loading' | 'list'>('welcome')
  const [welcomeMounted, setWelcomeMounted] = useState(true)
  const [entering, setEntering] = useState<CharacterSummary | null>(null)

  useEffect(() => {
    const inGame = typeof (window as unknown as { invokeNative?: unknown }).invokeNative !== 'undefined'
    if (!inGame) setVisible(true)
  }, [])

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const msg = e?.data
      if (!msg || typeof msg !== 'object') return
      if (msg.type === 'show') {
        setData(msg.payload as ShowPayload)
        setActiveIndex(null)
        setMode({ kind: 'list' })
        setPhase(msg.payload?.skipWelcome ? 'list' : 'welcome')
        setWelcomeMounted(!msg.payload?.skipWelcome)
        setBusy(false)
        setEntering(null)
        setVisible(true)
      } else if (msg.type === 'hide') {
        setVisible(false)
        setBusy(false)
        setEntering(null)
      } else if (msg.type === 'pedClicked') {
        const idx = (Number(msg.slotIndex) ?? 0) - 1
        if (Number.isFinite(idx) && idx >= 0) {
          setActiveIndex(idx)
          setMode({ kind: 'list' })
        }
      } else if (msg.type === 'deselected') {
        setActiveIndex(null)
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  const slots = useMemo(() => {
    const arr: (CharacterSummary | null)[] = []
    for (let i = 0; i < data.maxSlots; i++) arr.push(data.characters[i] ?? null)
    return arr
  }, [data])

  const activeSlot = activeIndex == null ? null : slots[activeIndex] ?? null

  const handleSelectSlot = useCallback(
    (index: number) => {
      const c = slots[index] ?? null
      setActiveIndex(index)
      if (c) {
        setMode({ kind: 'list' })
        nui('selectSlot', {
          slotIndex: index + 1,
          charId: c.charId,
          gender: c.gender,
          appearance: data.appearances[c.charId] ?? null,
        })
      } else {
        setMode({ kind: 'list' })
        nui('previewBlank', { slotIndex: index + 1, gender: 'male' })
      }
    },
    [slots, data.appearances]
  )

  const handleDeselect = useCallback(() => {
    if (activeIndex == null) return
    setActiveIndex(null)
    nui('restoreCamera', {})
  }, [activeIndex])

  const handlePlay = useCallback(async () => {
    if (!activeSlot || busy) return
    setBusy(true)
    setEntering(activeSlot)
    await new Promise((r) => setTimeout(r, 3500))
    await nui('play', { charId: activeSlot.charId })
  }, [activeSlot, busy])

  const handleOpenCreate = useCallback(() => {
    const idx = activeIndex ?? 0
    setMode({ kind: 'create', slotIndex: idx })
    nui('previewBlank', { slotIndex: idx + 1, gender: 'male' })
  }, [activeIndex])

  const handleDelete = useCallback(async () => {
    if (mode.kind !== 'delete' || busy) return
    setBusy(true)
    const res = await nui<{ ok: boolean }>('deleteCharacter', { charId: mode.character.charId })
    if (res.ok) {
      const remaining = data.characters.filter((c) => c.charId !== mode.character.charId)
      setData({ ...data, characters: remaining })
      setActiveIndex((i) => Math.max(0, Math.min(i, remaining.length - 1)))
      const baseIdx = activeIndex ?? 0
      const nextIdx = Math.max(0, Math.min(baseIdx, remaining.length - 1))
      const next = remaining[nextIdx]
      if (next) {
        setActiveIndex(nextIdx)
        nui('selectSlot', {
          slotIndex: nextIdx + 1,
          charId: next.charId,
          gender: next.gender,
          appearance: data.appearances[next.charId] ?? null,
        })
      } else {
        setActiveIndex(null)
        nui('restoreCamera', {})
      }
    }
    setMode({ kind: 'list' })
    setBusy(false)
  }, [mode, busy, data, activeIndex])

  const handleCreateSubmit = useCallback(
    async (form: { firstName: string; lastName: string; gender: 'male' | 'female' | 'non_binary'; dateOfBirth: string }) => {
      if (busy) return
      setBusy(true)
      await nui('createCharacter', form)
    },
    [busy]
  )

  const handlePreviewGender = useCallback((g: 'male' | 'female') => {
    nui('previewBlank', { gender: g })
  }, [])

  useEffect(() => {
    if (phase !== 'list' || mode.kind !== 'list') return
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.key === 'Escape') {
        if (activeIndex != null) { e.preventDefault(); sfx.click(); handleDeselect() }
        return
      }
      if (e.key === 'Enter' && activeSlot) {
        e.preventDefault(); sfx.confirm(); handlePlay(); return
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        const cur = activeIndex ?? -1
        const next = Math.min(slots.length - 1, cur + 1)
        if (next !== activeIndex) { sfx.click(); handleSelectSlot(next) }
        return
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        const cur = activeIndex ?? slots.length
        const next = Math.max(0, cur - 1)
        if (next !== activeIndex) { sfx.click(); handleSelectSlot(next) }
        return
      }
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1
        if (idx >= 0 && idx < slots.length && idx !== activeIndex) {
          e.preventDefault(); sfx.click(); handleSelectSlot(idx)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, mode, activeSlot, activeIndex, slots, handlePlay, handleSelectSlot, handleDeselect])

  if (!visible) return null

  return (
    <Box
      onClick={(e) => {
        if (e.target !== e.currentTarget) return
        nui('worldClick', {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        })
      }}
      sx={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden', background: 'transparent' }}
    >
      <Background />

      {phase === 'list' && (
        <>
          <Header brand={data.brand} />

          <Box
            aria-hidden
            sx={(t) => ({
              position: 'absolute',
              left: 0, right: 0, bottom: 0,
              zIndex: -5,
              height: 240,
              pointerEvents: 'none',
              background: `linear-gradient(180deg, transparent 0%, ${t.fn.rgba(t.colors.dark[9], 0.6)} 100%)`,
            })}
          />

          {activeIndex == null && data.characters.length > 0 && <IdlePrompt />}

          {activeIndex != null && (
            <VitalPill
              key={activeSlot?.charId ?? `empty-${activeIndex}`}
              character={activeSlot}
              flavor={activeSlot ? data.summaries?.[activeSlot.charId] : undefined}
            />
          )}

          {data.characters.length === 0 ? (
            <FirstTime onCreate={handleOpenCreate} />
          ) : (
            <>
              <SlotDock
                slots={slots}
                activeIndex={activeIndex}
                mugshots={data.mugshots}
                onSelect={handleSelectSlot}
              />
              {activeIndex != null && (
                <ActionDock
                  mode={activeSlot ? 'play' : 'create'}
                  busy={busy}
                  canPlay={!!activeSlot}
                  onPlay={handlePlay}
                  onCreate={handleOpenCreate}
                  onDelete={
                    activeSlot
                      ? () => setMode({ kind: 'delete', character: activeSlot })
                      : undefined
                  }
                />
              )}
            </>
          )}

        </>
      )}

      {mode.kind === 'create' && (
        <CreateForm
          onSubmit={handleCreateSubmit}
          onPreviewGender={handlePreviewGender}
          onCancel={() => {
            setMode({ kind: 'list' })
            if (activeSlot) {
              nui('selectSlot', {
                slotIndex: activeIndex + 1,
                charId: activeSlot.charId,
                gender: activeSlot.gender,
                appearance: data.appearances[activeSlot.charId] ?? null,
              })
            }
          }}
          busy={busy}
        />
      )}

      {mode.kind === 'delete' && (
        <DeleteConfirm
          character={mode.character}
          requireName={data.confirmByName}
          busy={busy}
          onCancel={() => setMode({ kind: 'list' })}
          onConfirm={handleDelete}
        />
      )}

      {welcomeMounted && (
        <Welcome
          brand={data.brand}
          onEnter={() => {
            setPhase('loading')
            window.setTimeout(() => setWelcomeMounted(false), 520)
          }}
        />
      )}

      {phase === 'loading' && (
        <CharLoading brand={data.brand} onDone={() => setPhase('list')} />
      )}

      {entering && (
        <PlayTransition
          firstName={entering.firstName}
          lastName={entering.lastName}
          stateId={entering.stateId}
        />
      )}
    </Box>
  )
}

function FirstTime({ onCreate }: { onCreate: () => void }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 'clamp(96px, 9vw, 128px)',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        animation: 'fade-up 0.5s ease-out both',
      }}
    >
      <Stack
        spacing={16}
        align="center"
        sx={(t) => ({
          padding: 'clamp(20px, 2vw, 28px) clamp(28px, 2.6vw, 40px)',
          borderRadius: t.radius.sm,
          background: t.colors.dark[7],
          border: `1px solid ${t.colors.dark[5]}`,
          minWidth: 'min(420px, 80vw)',
        })}
      >
        <Group spacing={12} align="center">
          <Box sx={(t) => ({ width: 48, height: 1, background: `linear-gradient(90deg, transparent, ${t.colors[t.primaryColor][6]})` })} />
          <Text {...{ sx: { ...monoCaps, fontSize: '0.6rem', letterSpacing: '0.36em' } }} color="blue.4">
            First Time Here
          </Text>
          <Box sx={(t) => ({ width: 48, height: 1, background: `linear-gradient(90deg, ${t.colors[t.primaryColor][6]}, transparent)` })} />
        </Group>
        <Text
          color="dark.1"
          sx={{
            maxWidth: 380,
            textAlign: 'center',
            fontSize: 'clamp(12px, 0.78vw, 14px)',
            lineHeight: 1.6,
          }}
        >
          No identities on file. Create your first character to step into the city.
        </Text>
        <Button
          onClick={() => { sfx.confirm(); onCreate() }}
          onMouseEnter={() => sfx.hover()}
          variant="light"
          color="blue"
          size="md"
          radius="sm"
          leftIcon={<Text sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1 }}>+</Text>}
        >
          Begin
        </Button>
      </Stack>
    </Box>
  )
}
