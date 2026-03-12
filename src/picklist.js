
export function generatePicklist(matchData) {
  const teams = {};

  matchData.forEach(entry => {
    const team = entry.team;

    if (!teams[team]) {
      teams[team] = {
        matches: 0,
        autoFuel: 0,
        teleopFuel: 0,
        climbs: 0,
        defense: 0
      };
    }

    teams[team].matches++;
    teams[team].autoFuel += entry.autoFuelScored || 0;
    teams[team].teleopFuel += entry.teleopFuelScored || 0;

    if (entry.towerClimb && entry.towerClimb !== "None") {
      teams[team].climbs++;
    }

    if (entry.playedDefense) {
      teams[team].defense++;
    }
  });

  const rankings = Object.keys(teams).map(team => {
    const t = teams[team];

    const score =
      (t.autoFuel / t.matches) * 3 +
      (t.teleopFuel / t.matches) * 2 +
      (t.climbs / t.matches) * 10 +
      (t.defense / t.matches) * 2;

    return { team, score };
  });

  return rankings.sort((a, b) => b.score - a.score);
}
