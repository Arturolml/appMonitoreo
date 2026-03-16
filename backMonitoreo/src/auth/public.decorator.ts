import { SetMetadata } from '@nestjs/common';

// Custom decorator mapped out to override JWT constraints globally
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
