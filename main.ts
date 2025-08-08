namespace SpriteKind {
    export const Log = SpriteKind.create()
    export const Gap = SpriteKind.create()
}

interface Position {
    x: number
    y: number
}

interface Dimensions {
    width: number
    height: number
}

enum SoundCustomSetting {
    ON,
    OFF,
}

namespace CustomSettings {
    export enum Sound {
        ON,
        OFF,
    }
}

namespace CustomSettingKeys {
    export const SOUND = "SOUND"
}

// Constants
const screenWidth = scene.screenWidth()
const screenHeight = scene.screenHeight()

function main() {
    scene.setBackgroundImage(sprites.background.cityscape)
    scroller.setLayerImage(
        scroller.BackgroundLayer.Layer0,
        sprites.background.cityscape
    )

    game.setGameOverMessage(true, "Game over")
    game.setGameOverSound(true, music.pewPew)
    music.stopAllSounds()

    let soundCustomSetting = settings.readNumber(CustomSettingKeys.SOUND)
    if (typeof soundCustomSetting === "undefined") {
        const soundOn = game.ask("Do you want sound?")
        console.log("sound custom setting is unset")
        if (soundOn) {
            music.setVolume(150)
        } else {
            music.setVolume(0)
        }
        soundCustomSetting = soundOn
            ? CustomSettings.Sound.ON
            : CustomSettings.Sound.OFF
        settings.writeNumber(CustomSettingKeys.SOUND, soundCustomSetting)
        console.log(
            `sound custom setting is newly set to: ${soundCustomSetting}`
        )
    }
    if (soundCustomSetting == SoundCustomSetting.ON) {
        music.setVolume(150)
    } else {
        music.setVolume(0)
    }

    music.play(music.createSong(assets.song`cheerySong`), music.PlaybackMode.LoopingInBackground)

    game.splash("Frapi Duck", "Press A to fly")
    music.stopAllSounds()

    const duck = sprites.create(sprites.duck.duck1, SpriteKind.Player)
    duck.vy = 50
    scroller.scrollBackgroundWithSpeed(-20, 0)

    controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
        duck.y -= 20
        animation.runImageAnimation(
            duck,
            [
                sprites.duck.duck1,
                sprites.duck.duck2,
                sprites.duck.duck3,
                sprites.duck.duck4,
                sprites.duck.duck5,
                sprites.duck.duck6,
                sprites.duck.duck1,
            ],
            60
        )
        const birdJumpSFX = music.createSoundEffect(
            WaveShape.Triangle,
            400,
            600,
            255,
            0,
            100,
            SoundExpressionEffect.None,
            InterpolationCurve.Linear
        )
        music.play(birdJumpSFX, music.PlaybackMode.UntilDone)
    })

    sprites.onOverlap(SpriteKind.Player, SpriteKind.Log, function () {
        duck.setImage(sprites.duck.duckHurt)
        music.play(
            music.melodyPlayable(music.smallCrash),
            music.PlaybackMode.UntilDone
        )
        game.over(true)
    })

    sprites.onOverlap(SpriteKind.Player, SpriteKind.Gap, function (_bird, gap) {
        if (_bird.x > gap.x + _bird.width / 2) {
            // Here, the bird has passed through the gap
            info.changeScoreBy(1)
            gap.destroy()
            music.play(
                music.melodyPlayable(music.baDing),
                music.PlaybackMode.InBackground
            )
        }
    })

    forever(() => {
        addTopAndBottomLogs()

        pause(randint(750, 3000))
    })

    game.onUpdate(function () {
        if (duck.y < 0) {
            duck.y = 0
        }
        if (duck.y > scene.screenHeight()) {
            game.gameOver(true)
        }
    })
}

/**
 * Creates a new log and adds it to the game
 * @param startPos The position where the log is initially spawned. The position is expressed as
 * the top-left corner of the log, and translated accordingly to center coordinates as `sprite.setLocation` expects
 * @param height The height of the log
 */

function addLog(startPos: Position, height: number) {
    const imgSize: Dimensions = { width: 10, height }

    const logImg = image.create(imgSize.width, imgSize.height)
    logImg.fill(12)

    const log = sprites.create(logImg, SpriteKind.Log)
    log.setPosition(
        startPos.x + logImg.width / 2,
        startPos.y + logImg.height / 2
    )
    log.vx = -50
}

function addGap(startPos: Position, height: number) {
    const gapImg = image.create(10, height)
    gapImg.fillRect(0, 0, gapImg.width, gapImg.height, 1)
    const gap = sprites.create(gapImg, SpriteKind.Gap)
    gap.setFlag(SpriteFlag.Invisible, true)
    gap.setPosition(startPos.x + gap.width / 2, startPos.y + gap.height / 2)
    gap.vx = -50
}

function addTopAndBottomLogs() {
    const topLogHeight = randint(5, 50)
    const topLogStartPos = { x: screenWidth + 10, y: 0 }
    addLog(topLogStartPos, topLogHeight)

    const gapHeight = randint(35, 70)
    const gapStartPos = {
        x: screenWidth + 10,
        y: topLogHeight,
    }
    addGap(gapStartPos, gapHeight)

    const bottomLogHeight = screenHeight - (topLogHeight + gapHeight)
    const bottomLogStartPos = {
        x: screenWidth + 10,
        y: topLogHeight + gapHeight,
    }
    addLog(bottomLogStartPos, bottomLogHeight)
}

// Run the game
main()
