local SELF <const> = GetCurrentResourceName()

---@param source integer
---@return boolean
local function reopenSelector(source)
    local player = Ox.GetPlayer(source)
    if not player or not player.userId then return false end
    local list = DB.charactersForUser(player.userId, Config.MaxSlots or 4)
    TriggerClientEvent('ox:startCharacterSelect', source, player.userId, list)
    return true
end

---@param source integer
---@param charIds integer[]
---@return integer[]
local function filterOwnedCharIds(source, charIds)
    local player = Ox.GetPlayer(source)
    if not player or not player.userId then return {} end
    local owned = DB.charIdsForUser(player.userId)
    local out = {}
    for i = 1, #charIds do
        local id = tonumber(charIds[i])
        if id and owned[id] then out[#out + 1] = id end
    end
    return out
end

-- ─── callbacks ───────────────────────────────────────────────────────────

lib.callback.register('st_multichar:postCreateApartment', function(source)
    if GetResourceState('st_apartments') ~= 'started' then return nil end

    local deadline = GetGameTimer() + 3000
    while GetGameTimer() < deadline do
        local entry = exports.st_apartments:getSpawnEntry(source)
        if entry and entry.meta and entry.meta.type == 'apartment' then
            return exports.st_apartments:enterFromSpawn(source, entry.meta.aptId)
        end
        Wait(100)
    end
    return nil
end)

lib.callback.register('st_multichar:getAppearances', function(source, charIds)
    if type(charIds) ~= 'table' or #charIds == 0 then return {} end

    local owned = filterOwnedCharIds(source, charIds)
    local rows  = DB.activeAppearancesByCharId(owned)

    local result = {}
    for i = 1, #rows do
        local row = rows[i]
        local ok, decoded = pcall(json.decode, row.skin)
        if ok and decoded then
            result[tostring(row.citizenid)] = decoded
        else
            Log.warn('st_multichar', 'failed to decode saved appearance', {
                charId = row.citizenid,
                err    = tostring(decoded),
            })
        end
    end
    return result
end)

lib.callback.register('st_multichar:getSummaries', function(source, charIds)
    if type(charIds) ~= 'table' or #charIds == 0 then return {} end

    local owned     = filterOwnedCharIds(source, charIds)
    local cashRows  = DB.defaultAccountBalances(owned)
    local groupRows = DB.activeGroupLabels(owned)
    local dobRows   = DB.datesOfBirth(owned)

    local result = {}
    local function bucket(id)
        result[id] = result[id] or {}
        return result[id]
    end

    for i = 1, #cashRows  do bucket(tostring(cashRows[i].charId)).cash        = cashRows[i].balance     end
    for i = 1, #groupRows do bucket(tostring(groupRows[i].charId)).groupLabel = groupRows[i].label      end
    for i = 1, #dobRows   do bucket(tostring(dobRows[i].charId)).dateOfBirth  = dobRows[i].dateOfBirth  end

    return result
end)

-- ─── commands ────────────────────────────────────────────────────────────

lib.addCommand('logout', {
    help = 'Save your character and return to character selection.',
}, function(source)
    local player = Ox.GetPlayer(source)
    if not player then return end
    if player.charId then
        player.logout()
    else
        reopenSelector(source)
    end
end)

-- ─── lifecycle ───────────────────────────────────────────────────────────

AddEventHandler('onResourceStart', function(resource)
    if resource ~= SELF then return end
    SetTimeout(500, function()
        local players = Ox.GetPlayers and Ox.GetPlayers() or {}
        for _, player in pairs(players) do
            if player and player.userId and not player.charId then
                reopenSelector(player.source)
            end
        end
    end)
end)
