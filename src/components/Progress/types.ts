import { TModuleProperties } from 'store/preferences/types'

export interface IProgressProps {
  leftValue?: number
  rightValue?: number
  children?: React.ReactNode
  background?: TModuleProperties
  leftCircleStart?: TModuleProperties
  leftCircleEnd?: TModuleProperties
  rightCircleStart?: TModuleProperties
  rightCircleEnd?: TModuleProperties
}
