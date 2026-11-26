import type { PlainLabelProps } from './plain-label.types'

export const PlainLabel = ({ label }: PlainLabelProps) => <span>{label()}</span>
