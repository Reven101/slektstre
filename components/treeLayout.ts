/**
 * Pedigree-chart connector geometry: evenly-spaced verticals that merge
 * pairwise into their midpoint, one level per generation gap — the classic
 * ahnentafel "Y" shape. `pct`/`mergeStep`/`stems` generate x-positions from
 * the leaf count instead of hand-measured percentages, so charts of any
 * size (the fixed 6-generation chart, or a rerooted mini-fan) can share the
 * same layout math instead of re-deriving pixel positions by eye.
 */
export const pct = (i: number, n: number) => ((i + 0.5) / n) * 100

export function mergeStep(
  positions: number[],
  barY: number,
  keyPrefix: string,
  conn: (style: React.CSSProperties, key?: React.Key) => React.ReactElement
): { elements: React.ReactElement[]; next: number[] } {
  const elements: React.ReactElement[] = []
  const next: number[] = []
  for (let i = 0; i < positions.length; i += 2) {
    const a = positions[i]
    const b = positions[i + 1]
    elements.push(
      conn({ top: barY, left: `${a}%`, right: `${100 - b}%`, height: '1.5px' }, `${keyPrefix}-h${i / 2}`)
    )
    next.push((a + b) / 2)
  }
  return { elements, next }
}

export function stems(
  positions: number[],
  top: number,
  height: number,
  keyPrefix: string,
  conn: (style: React.CSSProperties, key?: React.Key) => React.ReactElement
): React.ReactElement[] {
  return positions.map((x, i) => conn({ top, left: `${x}%`, width: '1.5px', height }, `${keyPrefix}-v${i}`))
}
