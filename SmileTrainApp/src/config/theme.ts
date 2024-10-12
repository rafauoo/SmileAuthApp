import { dimensions, height, width } from '../utils/dimensions'

export const appTheme = {
  background: '#FFFFFF',
  primary: '#FFF859',
  secondary: '#FF8940',
  highlight: '#FF2353',
  size: dimensions,
  windowHeight: `${height}px`,
  windowWidth: `${width}px`
}


export const navTheme = {
  dark: false,
  colors: {
    background: appTheme.background,
    border: appTheme.secondary,
    card: appTheme.background,
    notification: appTheme.highlight,
    primary: appTheme.primary,
    text: appTheme.primary
  }
}