import { Injectable, OnModuleInit } from '@nestjs/common';
import * as winston from 'winston';
import * as net from 'net';
import * as stream from 'stream';

@Injectable()
export class LoggerService implements OnModuleInit {
  private logger!: winston.Logger;

  onModuleInit() {
    console.log('>> LoggerService initialized');
    const socket = net.createConnection({ port: 5000, host: 'localhost' });

    const tcpStream = new stream.Writable({
      write: (chunk: Buffer, _encoding: BufferEncoding, callback) => {
        socket.write(chunk.toString());
        callback();
      },
    });

    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
      new winston.transports.Stream({
        stream: tcpStream,
        format: winston.format.json(),
      }),
    ];

    this.logger = winston.createLogger({
      level: 'info',
      transports,
    });
  }

  info(message: string, meta?: Record<string, any>) {
    this.logger.info(message, { meta });
  }

  error(message: string, meta?: Record<string, any>) {
    this.logger.error(message, { meta });
  }

  warn(message: string, meta?: Record<string, any>) {
    this.logger.warn(message, { meta });
  }

  debug(message: string, meta?: Record<string, any>) {
    this.logger.debug(message, { meta });
  }
}
