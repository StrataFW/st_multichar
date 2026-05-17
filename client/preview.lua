---@class st_multichar.Preview
Preview = {}

local PTFX_DICT   <const> = 'scr_rcbarry2'
local PTFX_EFFECT <const> = 'scr_clown_appears'
local POOF_HOLD_MS <const> = 280

---@type table<integer, integer>
local slotPeds = {}
local hidden = false

local primaryPed, primaryChair, primaryScene
local primaryCharId
local switching = false

---@param model string|integer
---@return integer|nil hash, boolean ok
local function ensureModel(model)
    local hash = type(model) == 'string' and joaat(model) or model
    if not IsModelInCdimage(hash) then return hash, false end
    return hash, lib.requestModel(hash, 5000) ~= nil
end

---@param ped integer
---@param slot st_multichar.SlotConfig
local function applySlotAnim(ped, slot)
    local anim = slot.animation
    if not anim then return end
    if not lib.requestAnimDict(anim.dict, 3000) then return end

    TaskPlayAnimAdvanced(ped, anim.dict, anim.name,
        slot.coords.x, slot.coords.y, slot.coords.z,
        0.0, 0.0, slot.heading,
        8.0, 1.0, -1, 2, 0)
    RemoveAnimDict(anim.dict)
end

---@param ped integer
local function configureActor(ped)
    SetEntityInvincible(ped, true)
    SetBlockingOfNonTemporaryEvents(ped, true)
    SetPedFleeAttributes(ped, 0, false)
    SetPedDiesWhenInjured(ped, false)
    SetPedCanRagdoll(ped, false)
end

---@param character st_multichar.Character?
---@param appearance st_multichar.Appearance?
---@return string|integer
local function resolveModel(character, appearance)
    if not character then return Config.EmptySlotModel end
    if appearance and appearance.model then return appearance.model end
    return (character.gender == 'male' or character.gender == 0)
        and 'mp_m_freemode_01'
        or 'mp_f_freemode_01'
end

---@param ped integer
---@param appearance st_multichar.Appearance?
---@param label string
local function applyAppearanceSafe(ped, appearance, label)
    if not appearance then return end
    local ok, err = pcall(function() exports.st_appearance:applyAppearance(ped, appearance) end)
    if not ok then
        Log.warn('st_multichar', 'applyAppearance failed', { slot = label, err = tostring(err) })
    end
end

function Preview.hideLocalPlayer()
    if hidden then return end
    local c = Config.PlayerHide.coords
    SetEntityCoordsNoOffset(cache.ped, c.x, c.y, c.z, false, false, false)
    SetEntityVisible(cache.ped, false, false)
    SetPlayerVisibleLocally(cache.playerId, false)
    FreezeEntityPosition(cache.ped, true)
    SetPlayerInvincible(cache.playerId, true)
    hidden = true
end

function Preview.showLocalPlayer()
    if not hidden then return end
    SetEntityVisible(cache.ped, true, false)
    SetPlayerVisibleLocally(cache.playerId, true)
    FreezeEntityPosition(cache.ped, false)
    SetPlayerInvincible(cache.playerId, false)
    hidden = false
end

---@param index integer
---@param character st_multichar.Character?
---@param appearance st_multichar.Appearance?
function Preview.spawnSlot(index, character, appearance)
    local slot = Config.Slots[index]
    if not slot then return end

    local model = resolveModel(character, appearance)
    local hash, ok = ensureModel(model)
    if not ok and model ~= Config.EmptySlotModel then
        hash, ok = ensureModel(Config.EmptySlotModel)
    end
    if not ok then return end

    local ped = CreatePed(1, hash, slot.coords.x, slot.coords.y, slot.coords.z, slot.heading, false, false)
    SetModelAsNoLongerNeeded(hash)
    SetEntityHeading(ped, slot.heading)
    FreezeEntityPosition(ped, true)
    configureActor(ped)

    if character then applyAppearanceSafe(ped, appearance, ('slot %d'):format(index)) end
    applySlotAnim(ped, slot)
    slotPeds[index] = ped
end

---@param index integer
---@return integer|nil
function Preview.getSlotPed(index)
    return slotPeds[index]
end

function Preview.clearSlotPeds()
    for i, ped in pairs(slotPeds) do
        if DoesEntityExist(ped) then DeleteEntity(ped) end
        slotPeds[i] = nil
    end
end

---@param character st_multichar.Character?
---@param appearance st_multichar.Appearance?
function Preview.spawnPrimary(character, appearance)
    if not character then return end
    local scene = Config.Scene
    if not scene then return end

    local model = resolveModel(character, appearance)
    local hash, ok = ensureModel(model)
    if not ok then return end

    local sx = scene.coords.x
    local sy = scene.coords.y
    local sz = scene.coords.z + (scene.deltaZ or 0)
    local sh = scene.heading or 0.0

    if not lib.requestAnimDict(scene.dict, 5000) then return end

    local chairHash, chairOk = ensureModel(scene.chairModel)
    if chairOk then
        primaryChair = CreateObject(chairHash, sx, sy, sz, true, true, true)
        SetModelAsNoLongerNeeded(chairHash)
    end

    primaryPed = CreatePed(1, hash, sx, sy, sz, sh, true, true)
    SetModelAsNoLongerNeeded(hash)
    configureActor(primaryPed)
    SetEntityCollision(primaryPed, false, false)
    ClearPedTasksImmediately(primaryPed)

    applyAppearanceSafe(primaryPed, appearance, 'primary')

    primaryScene = NetworkCreateSynchronisedScene(
        sx, sy, sz, 0.0, 0.0, sh, 2, true, false, -1.0, 0.0, 1.0
    )
    NetworkAddPedToSynchronisedScene(
        primaryPed, primaryScene, scene.dict, scene.anim,
        1.5, -4.0, 1, 16, 1148846080, 0
    )
    if primaryChair then
        NetworkAddEntityToSynchronisedScene(
            primaryChair, primaryScene, scene.dict, scene.chairAnim,
            1.0, 1.0, 1
        )
    end
    NetworkStartSynchronisedScene(primaryScene)
end

---@return integer|nil
function Preview.getPrimaryPed() return primaryPed end

---@return integer|nil
function Preview.getPrimaryCharId() return primaryCharId end

function Preview.clearPrimary()
    if primaryScene then
        NetworkStopSynchronisedScene(primaryScene)
        primaryScene = nil
    end
    if primaryPed and DoesEntityExist(primaryPed) then DeleteEntity(primaryPed) end
    primaryPed = nil
    if primaryChair and DoesEntityExist(primaryChair) then DeleteEntity(primaryChair) end
    primaryChair = nil
end

---@param x number
---@param y number
---@param z number
---@param scale number?
function Preview.playPoof(x, y, z, scale)
    if not lib.requestNamedPtfxAsset(PTFX_DICT, 2000) then return end
    UseParticleFxAssetNextCall(PTFX_DICT)
    StartParticleFxNonLoopedAtCoord(
        PTFX_EFFECT,
        x, y, z,
        0.0, 0.0, 0.0,
        scale or 1.1,
        false, false, false
    )
end

---@param character st_multichar.Character
---@param appearance st_multichar.Appearance?
function Preview.switchPrimary(character, appearance)
    if not character then return end
    if character.charId == primaryCharId and primaryPed then return end
    if switching then return end
    switching = true

    if not primaryPed or not DoesEntityExist(primaryPed) then
        Preview.spawnPrimary(character, appearance)
        primaryCharId = character.charId
        switching = false
        return
    end

    local oldCoords = GetEntityCoords(primaryPed)
    Preview.playPoof(oldCoords.x, oldCoords.y, oldCoords.z + 0.5, 1.2)

    Wait(POOF_HOLD_MS)
    Preview.clearPrimary()
    Wait(120)

    Preview.spawnPrimary(character, appearance)
    primaryCharId = character.charId

    local scene = Config.Scene
    if scene then
        Preview.playPoof(
            scene.coords.x, scene.coords.y,
            scene.coords.z + (scene.deltaZ or 0) + 0.4,
            0.9
        )
    end

    switching = false
end
