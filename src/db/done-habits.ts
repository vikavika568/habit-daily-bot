import Datastore from 'nedb'
import { join } from 'path'

const FILE_NAME = 'done-habits.db'

export interface IDoneHabit {
  _id?: string
  date: Date
  resolver: string
  habit: string
}

class DoneHabits {
  db: Datastore<IDoneHabit>

  constructor() {
    const filename = join(__dirname, 'database/' + FILE_NAME)
    this.db = new Datastore<IDoneHabit>({
      filename,
      autoload: true,
      corruptAlertThreshold: 1
    })
  }

  doneHabit(
    date: IDoneHabit['date'],
    resolver: IDoneHabit['resolver'],
    habit: IDoneHabit['habit']
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.findOne<IDoneHabit>(
        {
          $where: function (): boolean {
            const dayStart = new Date(date)
            dayStart.setHours(0, 0, 0, 1)

            const doneHabitDate = new Date(this.date)
            doneHabitDate.setHours(0, 0, 0, 1)

            return (
              dayStart.getTime() === doneHabitDate.getTime() &&
              this.resolver === resolver &&
              this.habit === habit
            )
          }
        },
        (errors, document) => {
          if (errors) {
            return reject(errors)
          }

          if (document) {
            return reject(new Error('habit is already done'))
          }

          this.db.insert<IDoneHabit>({ date, resolver, habit }, (errors) => {
            if (errors) {
              return reject(errors)
            }

            return resolve(true)
          })
        }
      )
    })
  }

  getDoneHabitByDate(date: IDoneHabit['date']): Promise<IDoneHabit[]> {
    return new Promise((resolve, reject) => {
      this.db.find<IDoneHabit>(
        {
          $where: function (): boolean {
            const dayStart = new Date(date)
            dayStart.setHours(0, 0, 0, 1)

            const doneHabitDate = new Date(this.date)
            doneHabitDate.setHours(0, 0, 0, 1)

            return dayStart.getTime() === doneHabitDate.getTime()
          }
        },
        { resolver: 1, date: 1, habit: 1 },
        (errors, habits) => {
          if (errors) {
            return reject(errors)
          }
          return resolve(habits)
        }
      )
    })
  }
}

export default DoneHabits
