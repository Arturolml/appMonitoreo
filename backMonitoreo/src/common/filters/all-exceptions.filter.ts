import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const response = exception instanceof HttpException ? exception.getResponse() : null;
        const message = 
            typeof response === 'object' && response !== null && 'message' in response
                ? (response as any).message
                : (exception as any)?.message || 'Internal server error';

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: message,
        };

        this.logger.error(`RAW EXCEPTION RESPONSE: ${JSON.stringify(response)}`);

        this.logger.error(
            `Exception caught: ${JSON.stringify(responseBody)}`,
            (exception as any)?.stack,
        );

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
