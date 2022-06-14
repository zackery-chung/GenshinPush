export type DailyNote = {
  current_resin: number
  current_home_coin: number
  transformer: {
    recovery_time: {
      Day: number
      Hour: number
      Minute: number
      Second: number
    }
  }
}