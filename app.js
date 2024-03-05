import { createBot, createProvider, createFlow, addKeyword, MemoryDB, utils } from '@bot-whatsapp/bot'
import { BaileysProvider } from '@bot-whatsapp/provider-baileys'

const welcomeFlow = addKeyword(['hello', 'hi']).addAnswer('Ey! welcome')

const emailValidationFlow = addKeyword(utils.setEvent('EMAIL_VALIDATION'))
    .addAnswer('¿Cual es tu nombre?', { capture: true })
    .addAnswer('¿Cual es tu edad?', { capture: true })
    .addAnswer('Gracias!!')

const main = async () => {

    const adapterDB = new MemoryDB()
    const adapterFlow = createFlow([welcomeFlow, emailValidationFlow])
    const adapterProvider = createProvider(BaileysProvider)

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    httpServer(3000)

    adapterProvider.http.server.post('/v1/messages', handleCtx(async (bot, req, res) => {
        const { number, message } = req.body
        await bot.sendMessage(number, message, {})
        return res.end('send')
    }))

    adapterProvider.http.server.post('/v1/validation-email', handleCtx(async (bot, req, res) => {
        const { number, name } = req.body
        await bot.dispatch('EMAIL_VALIDATION', { from: number, name })
        return res.end('send')
    }))

    adapterProvider.http.server.post('/v1/block', handleCtx(async (bot, req, res) => {
        const { number, message } = req.body
        bot.blacklist.add(`3400000000000`) // added to blacklist
        return res.end('blocked')
    }))
}

main()
