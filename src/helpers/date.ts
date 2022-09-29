export const isAfterToday = (date: Date): boolean => {
  const today = new Date()

  today.setHours(23, 59, 59, 998)

  return date > today
}

export const isBeforeToday = (date: Date): boolean => {
  const today = new Date()

  today.setHours(0, 0, 0, 1)

  return date < today
}
