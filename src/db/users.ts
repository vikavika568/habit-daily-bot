import Datastore from 'nedb'
import { join } from 'path'

const FILE_NAME = 'users.db'

export interface IUser {
  _id?: string
  name: string
  telegram_id: number
}

class UsersDb {
  db: Datastore<IUser & { common?: boolean }>

  constructor() {
    const filename = join(__dirname, 'database/' + FILE_NAME)
    this.db = new Datastore<IUser & { common?: boolean }>({
      filename,
      autoload: true,
      corruptAlertThreshold: 1
    })
  }

  async authedUser(telegramId: number): Promise<Omit<IUser, 'telegram_id'>> {
    return new Promise((resolve) => {
      this.db.findOne<IUser>(
        { telegram_id: telegramId },
        { name: 1 },
        (errors, user) => {
          return resolve(user)
        }
      )
    })
  }

  async getUserById(id: string): Promise<Omit<IUser, 'telegram_id'>> {
    return new Promise((resolve) => {
      this.db.findOne<IUser>({ _id: id }, { name: 1 }, (errors, user) => {
        return resolve(user)
      })
    })
  }

  async getCommonUserId(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.db.findOne<IUser & { common?: boolean }>(
        { common: true },
        (errors, user) => {
          if (errors) {
            return reject(errors)
          }

          return resolve(user._id as string)
        }
      )
    })
  }
}

export default UsersDb
