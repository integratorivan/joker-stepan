import type { PageLabelProps } from './page-label.types'

// Геометрия и обычный Map не являются состоянием Reatom.
export const ProgressBar = ({ current, total }: PageLabelProps) => {
  const width = Math.ceil(current / total)
  const styles = new Map<string, number>()
  styles.set('width', width)
  return <div style={{ width: styles.get('width') }} />
}
