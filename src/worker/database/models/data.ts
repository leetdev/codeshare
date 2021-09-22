import {db} from '../index'

export class Data {
  static async get(name: string): Promise<any> {
    return (await db.data?.where({name}).first())?.value
  }

  static async set(name: string, value: any) {
    await db.data?.put({name, value})
  }
}
