---@class st_multichar.Camera
Camera = {}

local cam, zoomCam
local welcomeA, welcomeB, welcomeActive
local dofToken
local activeTimecycle

---@param c integer
---@param look st_multichar.CamLook
local function applyCinematic(c, look)
    if not c or not look or not look.dof then return end
    SetCamNearDof(c, look.dof.near or 0.5)
    SetCamFarDof(c, look.dof.far or 2.5)
    SetCamDofStrength(c, look.dof.strength or 1.0)
    SetCamUseShallowDofMode(c, true)
end

---@param look st_multichar.CamLook
local function startCinematic(look)
    if not look then return end

    if look.timecycle then
        ClearTimecycleModifier()
        SetTimecycleModifier(look.timecycle)
        SetTimecycleModifierStrength(look.timecycleStrength or 1.0)
        activeTimecycle = look.timecycle
    end

    if look.dof then
        local token = {}
        dofToken = token
        CreateThread(function()
            while dofToken == token do
                SetUseHiDof()
                Wait(0)
            end
        end)
    end
end

local function stopCinematic()
    dofToken = nil
    if activeTimecycle then
        ClearTimecycleModifier()
        activeTimecycle = nil
    end
end

---@param c st_multichar.Vec3
---@param r st_multichar.Vec3
---@param fov number
---@return integer
local function createScripted(c, r, fov)
    return CreateCamWithParams(
        'DEFAULT_SCRIPTED_CAMERA',
        c.x, c.y, c.z,
        r.x, r.y, r.z,
        fov, false, 2
    )
end

function Camera.startSelect()
    if cam then DestroyCam(cam, false) end

    local cfg = Config.Camera
    cam = createScripted(cfg.coords, cfg.rotation, cfg.fov)
    applyCinematic(cam, cfg)
    SetCamActiveWithInterp(cam, true, cfg.interp, true, true)
    RenderScriptCams(true, false, cfg.interp, true, true)
    startCinematic(cfg)
    DisplayRadar(false)
end

function Camera.startWelcome()
    local cfg = Config.WelcomeCamera
    if not cfg then return end

    local sa = cfg.start
    welcomeA = createScripted(sa.coords, sa.rotation, cfg.fov or 50.0)
    welcomeB = nil

    RequestCollisionAtCoord(sa.coords.x, sa.coords.y, sa.coords.z)
    SetFocusPosAndVel(sa.coords.x, sa.coords.y, sa.coords.z, 0.0, 0.0, 0.0)

    local interiorId = GetInteriorAtCoords(sa.coords.x, sa.coords.y, sa.coords.z)
    if interiorId ~= 0 then
        LoadInterior(interiorId)
        lib.waitFor(function() return IsInteriorReady(interiorId) or nil end, nil, 1500)
    end

    applyCinematic(welcomeA, cfg)
    SetCamActive(welcomeA, true)
    RenderScriptCams(true, false, 600, true, true)
    startCinematic(cfg)
    DisplayRadar(false)

    local token = {}
    welcomeActive = token

    local bob     = cfg.bob or {}
    local ampZ    = bob.amplitudeZ    or 0.015
    local ampX    = bob.amplitudeX    or 0.008
    local ampPit  = bob.amplitudePitch or 0.10
    local periodZ = bob.periodZ       or 3800
    local periodX = bob.periodX       or 5200
    local TAU     = math.pi * 2

    CreateThread(function()
        local t0 = GetGameTimer()
        while welcomeActive == token do
            local t  = GetGameTimer() - t0
            local pz = math.sin((t / periodZ) * TAU)
            local px = math.sin((t / periodX) * TAU + 1.0)
            SetCamCoord(welcomeA,
                sa.coords.x + px * ampX,
                sa.coords.y,
                sa.coords.z + pz * ampZ
            )
            SetCamRot(welcomeA,
                sa.rotation.x + pz * ampPit,
                sa.rotation.y,
                sa.rotation.z,
                2
            )
            Wait(0)
        end
    end)
end

function Camera.transitionToSelect()
    if not welcomeA then
        Camera.startSelect()
        return
    end

    local cfg = Config.WelcomeCamera
    local from = (welcomeB and IsCamActive(welcomeB)) and welcomeB or welcomeA

    welcomeActive = nil

    local main = Config.Camera
    cam = createScripted(main.coords, main.rotation, main.fov)
    applyCinematic(cam, main)
    SetCamActiveWithInterp(cam, from, cfg.transitionMs or 1200, 1, 1)
    startCinematic(main)

    local stale = { welcomeA, welcomeB }
    welcomeA, welcomeB = nil, nil

    SetTimeout((cfg.transitionMs or 1200) + 100, function()
        for i = 1, #stale do
            if stale[i] and DoesCamExist(stale[i]) then DestroyCam(stale[i], false) end
        end
    end)
end

---@param ped integer
function Camera.panToSlot(ped)
    if not ped or not DoesEntityExist(ped) then return end

    local off = GetOffsetFromEntityInWorldCoords(ped, 0.0, 1.5, 0.2)
    local newCam = CreateCam('DEFAULT_SCRIPTED_CAMERA', true)
    SetCamCoord(newCam, off.x, off.y, off.z)
    PointCamAtEntity(newCam, ped, 0.0, 0.0, 0.3, true)

    SetCamActiveWithInterp(newCam, zoomCam or cam, Config.PanInterp, 1, 1)

    if zoomCam and zoomCam ~= newCam then
        local stale = zoomCam
        SetTimeout(Config.PanInterp + 50, function()
            if DoesCamExist(stale) then DestroyCam(stale, false) end
        end)
    end
    zoomCam = newCam
end

function Camera.restoreSelect()
    if not zoomCam or not cam then return end
    SetCamActiveWithInterp(cam, zoomCam, Config.RestoreInterp, 1, 1)
    local stale = zoomCam
    zoomCam = nil
    SetTimeout(Config.RestoreInterp + 50, function()
        if DoesCamExist(stale) then DestroyCam(stale, false) end
    end)
end

local function destroyAll()
    welcomeActive = nil
    for _, c in ipairs({ welcomeA, welcomeB, zoomCam, cam }) do
        if c and DoesCamExist(c) then DestroyCam(c, false) end
    end
    welcomeA, welcomeB, zoomCam, cam = nil, nil, nil, nil
end

function Camera.stop()
    destroyAll()
    RenderScriptCams(false, true, 1000, true, true)
    stopCinematic()
    DisplayRadar(true)
    ClearFocus()
end

function Camera.releaseForHandoff()
    destroyAll()
    stopCinematic()
end

---@param duration integer?
function Camera.fadeOut(duration)
    duration = duration or 500
    DoScreenFadeOut(duration)
    lib.waitFor(function() return IsScreenFadedOut() or nil end, nil, duration + 1500)
end

---@param duration integer?
function Camera.fadeIn(duration)
    duration = duration or 500
    DoScreenFadeIn(duration)
    lib.waitFor(function() return IsScreenFadedIn() or nil end, nil, duration + 1500)
end
