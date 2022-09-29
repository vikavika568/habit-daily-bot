import UsersDb from './users'
import HabitsDb, { IHabit } from './habits'
import DoneHabits from './done-habits'

type DbType = {
  users: UsersDb
  habits: HabitsDb
  doneHabits: DoneHabits
}

class Database {
  db: DbType

  constructor() {
    this.db = {
      users: new UsersDb(),
      habits: new HabitsDb(),
      doneHabits: new DoneHabits()
    }
  }

  async auth(telegramId: number): Promise<boolean> {
    return Boolean(await this.db.users.authedUser(telegramId))
  }

  async getHabits(
    telegramId: number,
    date: Date | undefined = new Date()
  ): Promise<IHabit[]> {
    const user = await this.db.users.authedUser(telegramId)

    if (!user) {
      throw new Error('not authed')
    }

    const commonUserId = await this.db.users.getCommonUserId()

    if (!commonUserId) {
      throw new Error('common ID not found')
    }

    const doneHabits = await this.db.doneHabits.getDoneHabitByDate(date)

    return await this.db.habits.getHabits(
      commonUserId,
      user._id as string,
      date,
      [...doneHabits.map(({ habit }) => habit)]
    )
  }

  async doneHabit(telegramId: number, habit: string): Promise<boolean> {
    const user = await this.db.users.authedUser(telegramId)

    if (!user) {
      throw new Error('not authed')
    }

    return await this.db.doneHabits.doneHabit(
      new Date(),
      user._id as string,
      habit
    )
  }
}

export default Database
