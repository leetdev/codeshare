import {db} from '..'

export interface IData {
  name: string,
  value: string,
}

export class Data {
  static async get(name: string): Promise<any> {
    return (await db.data?.where({name}).first())?.value
  }

  static async set(name: string, value: any): Promise<void> {
    await db.data?.put({name, value})
  }
}
