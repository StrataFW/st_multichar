---@class st_multichar.Player
Player = {}

function Player.reset()
    local ped = cache.ped

    if IsPedInAnyVehicle(ped, false) then
        TaskLeaveVehicle(ped, GetVehiclePedIsIn(ped, false), 16)
        lib.waitFor(function()
            return not IsPedInAnyVehicle(ped, false) and true or nil
        end, nil, 1500)
    end

    if IsCutsceneActive() then StopCutsceneImmediately() end
    lib.waitFor(function() return not IsScreenFadingOut() and true or nil end, nil, 2000)

    ClearPedTasksImmediately(ped)
    SetEntityCollision(ped, true, true)
    SetEntityVisible(ped, true, false)
    NetworkResurrectLocalPlayer(GetEntityCoords(ped), GetEntityHeading(ped), true, false)
    SetEntityHealth(ped, GetEntityMaxHealth(ped))
    SetPedArmour(ped, 0)
    DisableIdleCamera(true)
end

---@param timeoutMs integer
---@return integer ped
function Player.waitForReady(timeoutMs)
    return lib.waitFor(function()
        local p = PlayerPedId()
        if p and p ~= 0 and DoesEntityExist(p) then return p end
    end, nil, timeoutMs) or PlayerPedId()
end

---@param ped integer
---@param x number
---@param y number
---@param z number
---@param heading number
function Player.teleport(ped, x, y, z, heading)
    SetEntityCoordsNoOffset(ped, x, y, z, false, false, false)
    SetEntityHeading(ped, heading)
    RequestCollisionAtCoord(x, y, z)
    SetFocusPosAndVel(x, y, z, 0.0, 0.0, 0.0)

    local interiorId = GetInteriorAtCoords(x, y, z)
    if interiorId ~= 0 then
        LoadInterior(interiorId)
        lib.waitFor(function() return IsInteriorReady(interiorId) or nil end, nil, 1500)
    end

    lib.waitFor(function() return HasCollisionLoadedAroundEntity(ped) or nil end, nil, 2000)
end

---@param x number
---@param y number
---@param z number
---@param timeoutMs integer?
function Player.streamSceneAt(x, y, z, timeoutMs)
    RequestCollisionAtCoord(x, y, z)
    NewLoadSceneStart(x, y, z, 0.0, 0.0, 0.0, 50.0, 0)
    lib.waitFor(function()
        return (not IsNewLoadSceneActive() or IsNewLoadSceneLoaded()) and true or nil
    end, nil, timeoutMs or 4000)
    NewLoadSceneStop()
end
