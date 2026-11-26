import type { PageLabelProps } from './page-label.types'

export const PageLabel = ({ current, total }: PageLabelProps) => <output>{current} / {total}</output>
