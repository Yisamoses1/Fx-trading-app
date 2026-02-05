import { SetMetadata } from '@nestjs/common'

export const PUBLIC_ROUTE = 'isPublicRoute'

export const Public = () => SetMetadata(PUBLIC_ROUTE, true)
