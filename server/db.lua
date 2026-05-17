---@class st_multichar.DB
DB = {}

---@param n integer
---@return string
local function placeholders(n)
    if n <= 0 then return '' end
    local p = table.create(n, 0)
    for i = 1, n do p[i] = '?' end
    return table.concat(p, ',')
end

---@param userId integer
---@return table<integer, boolean>
function DB.charIdsForUser(userId)
    local rows = MySQL.query.await(
        'SELECT charId FROM characters WHERE userId = ? AND deleted IS NULL',
        { userId }
    ) or {}
    local set = {}
    for i = 1, #rows do set[rows[i].charId] = true end
    return set
end

---@param charIds integer[]
---@return { citizenid: integer, skin: string }[]
function DB.activeAppearancesByCharId(charIds)
    if #charIds == 0 then return {} end
    return MySQL.query.await(([[
        SELECT c.charId AS citizenid, j.skin
        FROM characters c
        JOIN st_appearance j ON j.identifier = c.stateId
        WHERE c.charId IN (%s)
    ]]):format(placeholders(#charIds)), charIds) or {}
end

---@param charIds integer[]
---@return { charId: integer, balance: integer }[]
function DB.defaultAccountBalances(charIds)
    if #charIds == 0 then return {} end
    return MySQL.query.await(
        ('SELECT owner AS charId, balance FROM accounts WHERE isDefault = 1 AND owner IN (%s)')
            :format(placeholders(#charIds)),
        charIds
    ) or {}
end

---@param charIds integer[]
---@return { charId: integer, label: string }[]
function DB.activeGroupLabels(charIds)
    if #charIds == 0 then return {} end
    return MySQL.query.await(([[
        SELECT cg.charId, g.label
        FROM character_groups cg
        JOIN ox_groups g ON g.name = cg.name
        WHERE cg.isActive = 1 AND cg.charId IN (%s)
    ]]):format(placeholders(#charIds)), charIds) or {}
end

---@param userId integer
---@param limit  integer?
---@return st_multichar.Character[]
function DB.charactersForUser(userId, limit)
    return MySQL.query.await([[
        SELECT charId, stateId, firstName, lastName, gender, x, y, z, heading,
               DATE_FORMAT(lastPlayed, '%d/%m/%Y') AS lastPlayed
        FROM characters
        WHERE userId = ? AND deleted IS NULL
        LIMIT ?
    ]], { userId, limit or 4 }) or {}
end

---@param charIds integer[]
---@return { charId: integer, dateOfBirth: string }[]
function DB.datesOfBirth(charIds)
    if #charIds == 0 then return {} end
    return MySQL.query.await(([[
        SELECT charId, DATE_FORMAT(dateOfBirth, '%%Y-%%m-%%d') AS dateOfBirth
        FROM characters
        WHERE charId IN (%s)
    ]]):format(placeholders(#charIds)), charIds) or {}
end
