fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'st_multichar'
author 'Strata Framework'
description 'Strata multi-character selector — replaces ox_core default UI.'
version '1.0.0'
repository 'https://github.com/StrataFW/st_multichar'

shared_scripts {
    '@ox_lib/init.lua',
    'shared/types.lua',
    'shared/config.lua',
}

client_scripts {
    'client/interior.lua',
    'client/player.lua',
    'client/camera.lua',
    'client/preview.lua',
    'client/main.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    '@ox_core/lib/init.lua',
    '@st_log/lib/init.lua',
    'server/db.lua',
    'server/main.lua',
}

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/assets/*.js',
    'web/dist/assets/*.css',
    'web/dist/assets/*.png',
    'web/dist/assets/*.webp',
    'web/dist/assets/*.svg',
    'web/dist/assets/*.woff2',
    'web/dist/assets/*.ttf',
    'data/peds.meta',
}

data_file 'PED_METADATA_FILE' 'data/peds.meta'

dependencies {
    'ox_core',
    'ox_lib',
}
