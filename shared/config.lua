---@class st_multichar.Config
Config = {}

Config.MaxSlots = 4

Config.Interior = {
    coords = vec3(1023.937, -3107.972, -39.0),
}

Config.PlayerHide = {
    coords = vec3(1028.0, -3107.972, -39.0),
}

Config.Scene = {
    coords        = vec3(1023.937, -3107.972, -39.0),
    heading       = 176.719,
    deltaZ        = -0.4,
    dict          = 'anim@amb@clubhouse@boardroom@crew@male@var_c@base@',
    anim          = 'enter',
    chairAnim     = 'enter_chair',
    baseAnim      = 'base',
    chairBaseAnim = 'base_chair',
    chairModel    = 'bkr_prop_clubhouse_chair_01',
}

---@type st_multichar.SlotConfig[]
Config.Slots = {
    {
        coords    = vec3(-782.0049, 336.6557, 211.2327),
        heading   = 13.9067,
        animation = { dict = 'anim@heists@heist_safehouse_intro@variations@male@tv', name = 'tv_part_one_loop' },
    },
    {
        coords    = vec3(-783.3555, 337.7827, 211.2329),
        heading   = 278.0073,
        animation = { dict = 'timetable@ron@ig_3_couch', name = 'base' },
    },
    {
        coords    = vec3(-780.2003, 338.7839, 211.1970),
        heading   = 114.6381,
        animation = { dict = 'timetable@reunited@ig_10', name = 'base_amanda' },
    },
    {
        coords    = vec3(-780.1037, 337.0664, 211.1970),
        heading   = 99.6381,
        animation = { dict = 'timetable@ron@ig_5_p3', name = 'ig_5_p3_base' },
    },
}

Config.EmptySlotModel = 'char_selector_male'

Config.Camera = {
    coords   = vec3(1024.55, -3105.6, -38.75),
    rotation = vec3(-1.5, 0.0, 184.0),
    fov      = 32.0,
    interp   = 900,
    dof = {
        near     = 0.6,
        far      = 2.6,
        strength = 1.0,
    },
}

Config.PanInterp     = 1000
Config.RestoreInterp = 1000

Config.CreatorCamera = {
    coords   = vec3(-772.9119, 340.2855, 211.9378),
    rotation = vec3(-1.5001, 0.0, -1.1483),
}

Config.CreatorPed = {
    coords  = vec3(-772.9800, 342.8023, 211.3971),
    heading = 178.9256,
}

Config.FallbackSpawn = vec4(-258.211, -293.077, 21.6132, 206.0)

Config.OpenAppearanceOnCreate = true
Config.ShowWelcome            = true
Config.RequireNameToDelete    = true

Config.Brand = {
    name    = 'STRATA',
    tagline = 'FRAMEWORK',
    version = 'v1.0.0',
}

Config.WelcomeCamera = {
    start = {
        coords   = vec3(1023.8, -3105.6, -38.65),
        rotation = vec3(-1.0, 0.0, 166.0),
    },
    fov          = 34.0,
    transitionMs = 1400,
    dof = {
        near     = 0.5,
        far      = 2.5,
        strength = 1.0,
    },
}
