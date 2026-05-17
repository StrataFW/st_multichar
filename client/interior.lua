---@class st_multichar.Interior
Interior = {}

local pinnedId

function Interior.pin()
    local c = Config.Interior and Config.Interior.coords
    if not c then return end
    local id = GetInteriorAtCoords(c.x, c.y, c.z)
    if id == 0 then return end
    LoadInterior(id)
    PinInteriorInMemory(id)
    pinnedId = id
end

function Interior.unpin()
    if not pinnedId then return end
    UnpinInterior(pinnedId)
    pinnedId = nil
end
