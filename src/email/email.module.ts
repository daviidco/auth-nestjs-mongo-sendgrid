import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { TemplateModeService } from './services/template-mode.service';
import { ApiCommandBuilderService } from './services/api-command-builder.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, TemplateModeService, ApiCommandBuilderService],
  exports: [EmailService, TemplateModeService, ApiCommandBuilderService],
})
export class EmailModule {}
