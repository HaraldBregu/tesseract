import * as React from 'react'
import SvgIcon, { SvgIconProps } from '../../components/SvgIcon'

type ListSquareBulletProps = Omit<SvgIconProps, 'children' | 'viewBox'>

const ListSquareBullet = React.forwardRef<SVGSVGElement, ListSquareBulletProps>((props, ref) => {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props} ref={ref}>
      <path d="M9 9h6v6H9z" />
    </SvgIcon>
  )
})

ListSquareBullet.displayName = 'ListSquareBullet'

export default ListSquareBullet
