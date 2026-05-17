---@meta

---@alias st_multichar.Gender 'male'|'female'|'non_binary'|integer

---@class st_multichar.Character
---@field charId    integer
---@field stateId   string
---@field firstName string
---@field lastName  string
---@field gender    st_multichar.Gender
---@field x?        number
---@field y?        number
---@field z?        number
---@field heading?  number
---@field health?   integer
---@field armour?   integer
---@field lastPlayed? string
---@field isNew?    boolean

---@class st_multichar.CreatePayload
---@field firstName   string
---@field lastName    string
---@field gender      st_multichar.Gender
---@field date        integer

---@class st_multichar.Appearance
---@field model? string|integer
---@field [string] any

---@alias st_multichar.AppearancesByCharId table<string, st_multichar.Appearance>

---@class st_multichar.Summary
---@field cash?        integer
---@field groupLabel?  string
---@field dateOfBirth? string

---@alias st_multichar.SummariesByCharId table<string, st_multichar.Summary>

---@class st_multichar.Vec3
---@field x number
---@field y number
---@field z number

---@class st_multichar.SceneAnim
---@field dict string
---@field name string

---@class st_multichar.SlotConfig
---@field coords    st_multichar.Vec3
---@field heading   number
---@field animation st_multichar.SceneAnim?

---@class st_multichar.CamLook
---@field dof? { near?: number, far?: number, strength?: number }
---@field timecycle? string
---@field timecycleStrength? number
