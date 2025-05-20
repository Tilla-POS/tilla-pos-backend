import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ConfigType } from '@nestjs/config';
import appConfig from '../../../config/app.config';

@Injectable()
export class DataResponseInterceptor implements NestInterceptor {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        apiVersion: this.appConfiguration.apiVersion,
        data,
      })),
    );
  }
}
