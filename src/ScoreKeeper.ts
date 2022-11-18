export class ScoreKeeper {
  revenue = 0
  expenses = 0
  shroomForecast = 0
}

export function isBig(score: ScoreKeeper) {
  return score.revenue - score.expenses >= 50
}
