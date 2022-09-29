import Datastore from 'nedb'
import { join } from 'path'

const FILE_NAME = 'habits.db'

export interface IHabit {
  _id?: string
  title: string
  resolver: string
  start_date: Date
  end_date: Date | null
}

class HabitDb {
  db: Datastore<IHabit>

  constructor() {
    const filename = join(__dirname, 'database/' + FILE_NAME)
    this.db = new Datastore<IHabit>({
      filename,
      autoload: true,
      corruptAlertThreshold: 1
    })
  }

  createHabit(habit: Omit<IHabit, '_id'>): Promise<IHabit> {
    return new Promise((resolve, reject) => {
      this.db.insert<IHabit>(habit, (errors, newHabit) => {
        if (errors) {
          return reject(errors)
        }
        return resolve(newHabit)
      })
    })
  }

  getHabit(id: string): Promise<IHabit> {
    return new Promise((resolve) => {
      this.db.findOne<IHabit>({ _id: id }, (errors, habit) => {
        return resolve(habit)
      })
    })
  }

  deleteHabit(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.remove({ _id: id }, {}, function (errors) {
        if (errors) {
          return reject(false)
        }
        return resolve(true)
      })
    })
  }

  updateHabit(habit: IHabit): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const editHabit = { ...habit }
      delete editHabit._id

      this.db.update(
        { _id: habit._id },
        { $set: editHabit },
        {},
        function (errors) {
          if (errors) {
            console.log(errors)
            return reject(false)
          }
          return resolve(true)
        }
      )
    })
  }

  getHabits(
    commonUserId: string,
    id: string,
    date: Date,
    excludedIds: string[] = []
  ): Promise<IHabit[]> {
    return new Promise((resolve) => {
      this.db.find<IHabit>(
        {
          $not: { $or: [...excludedIds.map((i) => ({ _id: i }))] },
          $or: [{ resolver: id }, { resolver: commonUserId }],
          $where: function (): boolean {
            const dayStart = new Date(date)
            dayStart.setHours(0, 0, 0, 1)

            const dayEnd = new Date(date)
            dayEnd.setHours(23, 59, 59, 998)

            return (
              this.start_date <= dayStart &&
              (!this.end_date || this.end_date >= dayEnd)
            )
          }
        },
        { title: 1, resolver: 1 },
        (errors, result) => {
          const habits = result.sort((habit1, habit2) => {
            const resolver1 = habit1.resolver
            const resolver2 = habit2.resolver

            if (resolver1 !== resolver2) {
              if (resolver1 === commonUserId) return -1
              if (resolver1 === id) return 1
            }

            return habit1.title.localeCompare(habit2.title)
          })

          return resolve(habits)
        }
      )
    })
  }
}

export default HabitDb
