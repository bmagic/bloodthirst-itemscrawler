const axios = require('axios')

const zones = [{ id: 1000, name: 'mc' }, { id: 1001, name: 'onyxia' }, { id: 1002, name: 'bwl' }]

const partitions = [1, 2]
const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const run = async () => {
  const result = await axios.get(encodeURI(`${process.env.BACKEND_URL}/v1/characters`))

  const characters = result.data

  for (const indexCharacters in characters) {
    const character = characters[indexCharacters]
    for (const indexZone in zones) {
      const zone = zones[indexZone]
      for (const indexPartitions in partitions) {
        const partition = partitions[indexPartitions]
        console.log(`Loading data for user ${character.name} from zone ${zone.name} and partition ${partition}`)

        const result = await axios.get(encodeURI(`https://classic.warcraftlogs.com:443/v1/parses/character/${character.name}/Sulfuron/EU?zone=${zone.id}&partition=${partition}&api_key=${process.env.WARCRAFTLOGS_API_KEY}`))
        const encounters = result.data
        for (const indexEncounters in encounters) {
          const encounter = encounters[indexEncounters]
          for (const indexGear in encounter.gear) {
            if (indexGear === '3') continue
            const gear = encounter.gear[indexGear]
            if (gear.id === null) continue
            const itemSlots = ['head', 'neck', 'shoulder', 'empty', 'chest', 'waist', 'legs', 'feet', 'wrist', 'hands', 'finger', 'finger', 'trinket', 'trinket', 'back', 'mainHand', 'offHand', 'ranged']
            await axios.post(`${process.env.BACKEND_URL}/v1/items?token=${process.env.TOKEN}`, {
              wid: gear.id,
              slot: itemSlots[indexGear],
              character: character.name,
              date: encounter.startTime,
              zone: zone.name
            })
          }
        }
        await sleep(5000)
      }
    }
  }
}

run().then(r => console.log(r))
