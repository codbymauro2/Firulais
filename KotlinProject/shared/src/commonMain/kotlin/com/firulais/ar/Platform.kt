package com.firulais.ar

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform