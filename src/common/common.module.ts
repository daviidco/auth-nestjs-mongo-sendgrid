import { Module } from '@nestjs/common';
import { responseProviders } from './providers/response.provider';

@Module({
  providers: [...responseProviders],
  exports: [...responseProviders],
})
export class CommonModule {}
