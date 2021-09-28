import {collab, getSyncedVersion, receiveUpdates, sendableUpdates, Update} from '@codemirror/collab'
import {ChangeSet} from '@codemirror/state'
import {EditorView, ViewPlugin, ViewUpdate} from '@codemirror/view'
import {proxy, RemoteRPC} from '~main/rpc'

function pullUpdates(rpc: RemoteRPC, documentId: string, version: number): Promise<readonly Update[]> {
  return new Promise(async resolve => {
    await rpc.netDocumentPullUpdates(
      documentId,
      version,
      proxy(updates => {
        console.log('Pull:', updates)
        resolve(updates.map(update => ({
          changes: ChangeSet.fromJSON(update.changes),
          clientID: update.clientID,
        })))
      }),
    )
  })
}

async function pushUpdates(rpc: RemoteRPC, documentId: string, version: number, updates: readonly Update[]): Promise<void> {
  console.log('Push:', version, updates)
  await rpc.netDocumentPushUpdates(documentId, version, updates.map(update => ({
    changes: update.changes.toJSON(),
    clientID: update.clientID,
  })))
}

export function peerExtension(documentId: string, startVersion: number, rpc: RemoteRPC) {
  console.log(`peerExtension(${documentId}, ${startVersion})`)

  let plugin = ViewPlugin.fromClass(class {
    private pushing = false
    private done = false

    constructor(private view: EditorView) {
      this.pull().then()
    }

    async update(update: ViewUpdate) {
      if (update.docChanged) {
        await this.push()
      }
    }

    async push() {
      const updates = sendableUpdates(this.view.state)

      if (this.pushing || !updates.length) {
        return
      }

      this.pushing = true
      await pushUpdates(rpc, documentId, getSyncedVersion(this.view.state), updates)
      this.pushing = false

      // Regardless of whether the push failed or new updates came in
      // while it was running, try again if there's updates remaining
      if (sendableUpdates(this.view.state).length) {
        setTimeout(() => this.push(), 100)
      }
    }

    async pull() {
      while (!this.done) {
        let version = getSyncedVersion(this.view.state)
        let updates = await pullUpdates(rpc, documentId, version)
        this.view.dispatch(receiveUpdates(this.view.state, updates))
      }
    }

    destroy() {
      this.done = true
    }
  })

  return [collab({startVersion}), plugin]
}
