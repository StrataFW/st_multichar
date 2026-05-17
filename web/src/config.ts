export const DEFAULT_BRAND = {
  name: 'STRATA',
  tagline: 'CHARACTER SELECT',
  version: 'v1.0.0',
}

export const DEV_MOCK = import.meta.env.DEV
  ? {
      characters: [
        {
          charId: 1,
          stateId: 'AB1234',
          firstName: 'Carl',
          lastName: 'Vance',
          gender: 'male',
          dateOfBirth: '1992-04-12',
          lastPlayed: '2026-04-30 22:14:01',
        },
        {
          charId: 2,
          stateId: 'CD5588',
          firstName: 'Mira',
          lastName: 'Okafor',
          gender: 'female',
          dateOfBirth: '1996-11-02',
          lastPlayed: '2026-05-04 08:42:22',
        },
      ],
      appearances: {},
      summaries: {
        1: { cash: 2341, groupLabel: 'Police' },
        2: { cash: 18020, groupLabel: 'Press' },
      } as Record<number, { cash?: number; groupLabel?: string }>,
      maxSlots: 4,
      brand: DEFAULT_BRAND,
      confirmByName: true,
    }
  : {
      characters: [],
      appearances: {},
      summaries: {} as Record<number, { cash?: number; groupLabel?: string }>,
      maxSlots: 4,
      brand: DEFAULT_BRAND,
      confirmByName: true,
    }
