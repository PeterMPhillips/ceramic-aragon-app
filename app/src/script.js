import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Aragon, { events } from '@aragon/api'

const app = new Aragon()

app.store(
  async (state, { event, returnValues }) => {
    console.log('Event: ', event)
    console.log('Return values: ', returnValues)
    const nextState = {
      ...state,
    }

    try {
      switch (event) {
        case 'UpdateDocument':
          const newState = updateRegistry(nextState, returnValues)
          console.log('New State: ', newState)
          return { ...newState }
        case events.SYNC_STATUS_SYNCING:
          return { ...nextState, isSyncing: true }
        case events.SYNC_STATUS_SYNCED:
          return { ...nextState, isSyncing: false }
        default:
          return state
      }
    } catch (err) {
      console.log(err)
    }
  },
  {
    init: initializeState(),
  }
)

/***********************
 *                     *
 *   Event Handlers    *
 *                     *
 ***********************/

function initializeState() {
  return async cachedState => {
    return {
      ...cachedState,
      registry: [],
    }
  }
}

function updateRegistry(nextState, { documentId, documentHash }) {
  const { registry } = nextState
  const nextRegistry = [
    ...nextState.registry
  ]
  console.log('Document Id: ', documentId)
  console.log('Document Hash: ', documentHash)
  const registryIndex = registry.findIndex(({ id }) => id === documentId)
  if (registryIndex === -1) {
    nextRegistry.push({
      id: documentId,
      content: documentHash
    })
  } else {
    registry[registryIndex].content = documentHash
  }
  console.log('Next Registry: ', nextRegistry)
  return {
    ...nextState,
    registry: nextRegistry,
  }
}
