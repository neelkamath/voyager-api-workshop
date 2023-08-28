import "regenerator-runtime";
import {Voyager} from "./voyager";

async function getTokens(api: Voyager.Api, input?: Voyager.TokensInput): Promise<void> {
  let res: Voyager.TokensOutput
  try {
    res = await api.getTokens(input)
  } catch (err: any) {
    if (err in Voyager.NetworkErr) console.error(err)
    else throw new Error(err)
  }
  console.info('Tokens:', res)
}

async function getTxns(api: Voyager.Api, input?: Voyager.TxnsInput): Promise<void> {
  let res: Voyager.TxnsOutput
  try {
    res = await api.getTxns(input)
  } catch (err: any) {
    if (err in Voyager.NetworkErr) console.error(err)
    else throw new Error(err)
  }
  console.info('Txns:', res)
}

type EventsInput = Readonly<{
  api: Voyager.Api
  input?: Voyager.EventsInput
  /** These {@link Voyager.EventItem.eventId}s won't be notified of. */
  blacklistedEventIds: Set<string>
  /** Whether notifications can be sent. */
  canNotify: boolean
}>

/** @returns The fetched {@link Voyager.EventItem.eventId}s. */
async function getEvents({api, blacklistedEventIds, canNotify, input}: EventsInput): Promise<string[]> {
  let res: Voyager.EventsOutput
  try {
    res = await api.getEvents(input)
  } catch (err: any) {
    if (err in Voyager.NetworkErr) console.error(err)
    else throw new Error(err)
  }
  res.items.map((item) => {
    if (blacklistedEventIds.has(item.eventId)) return
    console.info(`**********EVENT**********`)
    if (item.timestamp !== undefined) console.info('Date:', new Date(item.timestamp * 1_000))
    console.info('Name:', item.name)
    console.info('Tx hash:', item.transactionHash)
    console.info('From address:', item.fromAddress)
    console.info('Data:', item.dataDecoded)
    if (canNotify) {
      const body = `Tx (${item.transactionHash}) from ${item.fromAddress}.`
      new Notification(item.name, {body})
    }
  })
  return res.items.map(({eventId}) => eventId)
}

type SleepInput = Readonly<{
  ms: number
}>

/** Does nothing for the specified number of {@link ms}. */
async function sleep({ms}: SleepInput): Promise<void> {
  return await new Promise((resolve) => setTimeout(resolve, ms))
}

async function main(): Promise<void> {
  const api = new Voyager.Api({
    apiBaseUrl: Voyager.apiBaseUrls.goerli,
    apiKey: '31g7uSufDL98RKPQeeSSX4QSRtVSNP729Tqv5gUV'
  })

  // await getTokens(api)
  // await getTxns(api)

  const input = {contract: '0x074eA6D0166315b4b00893483dadF07eA384725cB76E2E2C36eaF753F89Bf31B'}
  let canNotify = false
  const blacklistedEventIds = new Set<string>()
  while (true) {
    const eventIds = await getEvents({api, input, canNotify, blacklistedEventIds})
    for (const eventId of eventIds) blacklistedEventIds.add(eventId)
    canNotify = true
    await sleep({ms: 1_000})
  }
}

main()
