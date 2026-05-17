local SELF <const> = GetCurrentResourceName()

local selecting = false
---@type st_multichar.Character[]
local characters = {}

-- ─── nui ─────────────────────────────────────────────────────────────────

---@param payload table
local function showNui(payload)
    SetNuiFocus(true, true)
    SendNUIMessage({ type = 'show', payload = payload })
end

local function hideNui()
    SetNuiFocus(false, false)
    SendNUIMessage({ type = 'hide' })
end

-- ─── small helpers ───────────────────────────────────────────────────────

---@param s string?
---@return number
local function lastPlayedKey(s)
    if type(s) ~= 'string' then return math.huge end
    local d, m, y = s:match('(%d%d)/(%d%d)/(%d%d%d%d)')
    if not d then return math.huge end
    return tonumber(y) * 10000 + tonumber(m) * 100 + tonumber(d)
end

---@param yyyy_mm_dd string
---@return integer|nil unix_ms
local function dateToEpochMs(yyyy_mm_dd)
    local y, m, d = yyyy_mm_dd:match('^(%d%d%d%d)%-(%d%d)%-(%d%d)$')
    if not y then return nil end
    local function daysFromEpoch(yy, mm, dd)
        if mm <= 2 then yy, mm = yy - 1, mm + 12 end
        local era = (yy >= 0 and yy or yy - 399) // 400
        local yoe = yy - era * 400
        local doy = ((153 * (mm - 3) + 2) // 5) + dd - 1
        local doe = yoe * 365 + (yoe // 4) - (yoe // 100) + doy
        return era * 146097 + doe - 719468
    end
    return daysFromEpoch(tonumber(y), tonumber(m), tonumber(d)) * 86400 * 1000
end

---@param id integer
---@return st_multichar.Character|nil
local function characterByCharId(id)
    if not id then return nil end
    for i = 1, #characters do
        if characters[i].charId == id then return characters[i] end
    end
end

-- ─── slot hit-test ───────────────────────────────────────────────────────

---@param mx number normalised 0..1
---@param my number normalised 0..1
---@return integer|nil slot
local function pickSlotAt(mx, my)
    local hit, hitDist = nil, math.huge
    for i = 1, Config.MaxSlots do
        local ped = Preview.getSlotPed(i)
        if ped and DoesEntityExist(ped) then
            local bone = GetWorldPositionOfEntityBone(ped, 0)
            local cx, cy, cz
            if bone and (bone.x ~= 0.0 or bone.y ~= 0.0) then
                cx, cy, cz = bone.x, bone.y, bone.z
            else
                local c = GetEntityCoords(ped)
                cx, cy, cz = c.x, c.y, c.z
            end

            local onScreen, sx, sy = GetScreenCoordFromWorldCoord(cx, cy, cz)
            if onScreen then
                local dx, dy = math.abs(mx - sx), math.abs(my - sy)
                if dx < 0.05 and dy < 0.15 then
                    local d = dx * dx + dy * dy
                    if d < hitDist then hit, hitDist = i, d end
                end
            end
        end
    end
    return hit
end

-- ─── flows ───────────────────────────────────────────────────────────────

local function handlePostCreateSpawn()
    Camera.fadeOut(500)
    Camera.stop()
    Interior.unpin()
    ClearFocus()

    local coords = lib.callback.await('st_multichar:postCreateApartment', false)
    local ped = cache.ped

    if coords then
        Player.streamSceneAt(coords.x, coords.y, coords.z)
        Player.teleport(ped, coords.x, coords.y, coords.z, coords.h or 0.0)
    else
        local fb = Config.FallbackSpawn
        SetEntityCoordsNoOffset(ped, fb.x, fb.y, fb.z, false, false, false)
        SetEntityHeading(ped, fb.w)
    end

    FreezeEntityPosition(ped, false)
    Wait(300)
    Camera.fadeIn(1200)
end

---@param character st_multichar.Character
local function handleNewCharacterFlow(character)
    hideNui()
    Preview.clearPrimary()
    Preview.clearSlotPeds()
    Camera.releaseForHandoff()

    local scene = Config.Scene
    local heading = (scene.heading + 180.0) % 360.0
    local rad = math.rad(heading)
    local forward = 2.0
    local apx = scene.coords.x - math.sin(rad) * forward
    local apy = scene.coords.y + math.cos(rad) * forward

    local ped = Player.waitForReady(3000)
    SetEntityVisible(ped, true, false)
    SetPlayerVisibleLocally(cache.playerId, true)
    SetPlayerInvincible(cache.playerId, false)
    FreezeEntityPosition(ped, false)
    ClearPedTasksImmediately(ped)
    LocalPlayer.state:set('isDead', false, true)
    SetEntityCollision(ped, true, true)
    Player.teleport(ped, apx, apy, scene.coords.z, heading)

    local appHandler
    appHandler = AddEventHandler('st_appearance:closed', function()
        RemoveEventHandler(appHandler)
        CreateThread(handlePostCreateSpawn)
    end)

    Wait(100)
    pcall(function() exports.st_appearance:open({ pedMenu = true }) end)
end

---@param character st_multichar.Character
local function handleExistingCharacterFlow(character)
    DoScreenFadeOut(0)

    if GetResourceState('st_spawn') == 'started' then
        local ok, willHandle = pcall(function()
            return exports.st_spawn:willHandleSpawn(character)
        end)
        if ok and willHandle then
            Preview.clearPrimary()
            Preview.clearSlotPeds()
            Preview.showLocalPlayer()
            Camera.stop()
            Interior.unpin()
            hideNui()
            return
        end
    end

    local fb = Config.FallbackSpawn
    local x = character.x or fb.x
    local y = character.y or fb.y
    local z = character.z or fb.z
    local h = character.heading or fb.w

    Player.streamSceneAt(x, y, z, 5000)

    Preview.clearPrimary()
    Preview.clearSlotPeds()
    Preview.showLocalPlayer()
    Camera.stop()
    Interior.unpin()

    local ped = cache.ped
    SetEntityCoordsNoOffset(ped, x, y, z, false, false, false)
    SetEntityHeading(ped, h)
    FreezeEntityPosition(ped, false)
    ClearPedTasksImmediately(ped)
    SetPlayerInvincible(cache.playerId, false)

    if character.health and character.health > 0 then
        SetEntityHealth(ped, character.health)
    end
    if character.armour then SetPedArmour(ped, character.armour) end

    lib.waitFor(function() return HasCollisionLoadedAroundEntity(ped) or nil end, nil, 3000)

    hideNui()
    Wait(500)
    Camera.fadeIn(2400)

    if character.isNew and Config.OpenAppearanceOnCreate then
        SetTimeout(1500, function()
            exports.st_appearance:open({ pedMenu = true })
        end)
    end
end

-- ─── ox event handlers ───────────────────────────────────────────────────

RegisterNetEvent('ox:startCharacterSelect', function(_userId, list)
    selecting = true

    local ok, err = pcall(function() exports.st_bootstrap:shutdown() end)
    if not ok then Log.warn('st_multichar', 'st_bootstrap:shutdown failed', { err = tostring(err) }) end

    SetNuiFocus(false, false)
    Camera.fadeOut(400)

    Player.reset()
    Interior.pin()
    Preview.hideLocalPlayer()

    if Config.ShowWelcome and Config.WelcomeCamera then
        Camera.startWelcome()
    else
        Camera.startSelect()
    end

    local ids = {}
    for i = 1, #list do ids[i] = list[i].charId end

    local appearances = lib.callback.await('st_multichar:getAppearances', false, ids) or {}
    local summaries   = lib.callback.await('st_multichar:getSummaries',  false, ids) or {}

    table.sort(list, function(a, b)
        return lastPlayedKey(a.lastPlayed) > lastPlayedKey(b.lastPlayed)
    end)
    characters = list

    local primary = list[1]
    if primary then
        Preview.switchPrimary(primary, appearances[tostring(primary.charId)])
    end

    Camera.fadeIn(600)

    showNui({
        characters    = list,
        appearances   = appearances,
        summaries     = summaries,
        mugshots      = {},
        maxSlots      = Config.MaxSlots,
        brand         = Config.Brand,
        confirmByName = Config.RequireNameToDelete,
        skipWelcome   = not Config.ShowWelcome,
    })
end)

RegisterNetEvent('ox:setActiveCharacter', function(character)
    selecting = false
    if character.isNew then
        handleNewCharacterFlow(character)
    else
        handleExistingCharacterFlow(character)
    end
end)

-- ─── nui callbacks ───────────────────────────────────────────────────────

RegisterNUICallback('selectSlot', function(data, cb)
    cb({ ok = true })
    if not data or not data.charId then return end

    local character = characterByCharId(data.charId)
    if not character then return end

    CreateThread(function()
        Preview.switchPrimary(character, data.appearance)
    end)
end)

RegisterNUICallback('previewBlank', function(_, cb) cb({ ok = true }) end)
RegisterNUICallback('restoreCamera', function(_, cb) cb({ ok = true }) end)
RegisterNUICallback('exit', function(_, cb) cb({ ok = true }) end)

RegisterNUICallback('worldClick', function(data, cb)
    cb({ ok = true })
    if type(data) ~= 'table' or type(data.x) ~= 'number' or type(data.y) ~= 'number' then
        return
    end

    local slot = pickSlotAt(data.x, data.y)
    if slot then
        local ped = Preview.getSlotPed(slot)
        if ped then Camera.panToSlot(ped) end
        SendNUIMessage({ type = 'pedClicked', slotIndex = slot })
    else
        Camera.restoreSelect()
        SendNUIMessage({ type = 'deselected' })
    end
end)

RegisterNUICallback('play', function(data, cb)
    if not data or not data.charId then return cb({ ok = false }) end
    cb({ ok = true })
    TriggerServerEvent('ox:setActiveCharacter', data.charId)
end)

RegisterNUICallback('createCharacter', function(data, cb)
    if not data or not data.firstName or not data.lastName or not data.gender or not data.dateOfBirth then
        return cb({ ok = false, error = 'invalid payload' })
    end

    local ms = dateToEpochMs(tostring(data.dateOfBirth))
    if not ms then return cb({ ok = false, error = 'invalid date' }) end

    TriggerServerEvent('ox:setActiveCharacter', {
        firstName = data.firstName,
        lastName  = data.lastName,
        gender    = data.gender,
        date      = ms,
    })
    cb({ ok = true })
end)

RegisterNUICallback('deleteCharacter', function(data, cb)
    local charId = data and data.charId
    if not charId then return cb({ ok = false }) end
    local ok = lib.callback.await('ox:deleteCharacter', false, charId)
    cb({ ok = ok and true or false })
end)

RegisterNUICallback('welcomeDismissed', function(_, cb)
    if Config.WelcomeCamera then Camera.transitionToSelect() end
    cb({ ok = true })
end)

-- ─── teardown ────────────────────────────────────────────────────────────

AddEventHandler('onResourceStop', function(resource)
    if resource ~= SELF or not selecting then return end
    SetNuiFocus(false, false)
    Preview.clearPrimary()
    Preview.clearSlotPeds()
    Preview.showLocalPlayer()
    Camera.stop()
    Interior.unpin()
    DoScreenFadeIn(0)
end)
