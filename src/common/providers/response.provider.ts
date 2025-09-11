import { Provider } from '@nestjs/common';
import { ResponseBuilderService } from '../services/response-builder.service';

export const RESPONSE_BUILDER = Symbol('RESPONSE_BUILDER');

export const responseProviders: Provider[] = [
  {
    provide: RESPONSE_BUILDER,
    useClass: ResponseBuilderService,
  },
];
