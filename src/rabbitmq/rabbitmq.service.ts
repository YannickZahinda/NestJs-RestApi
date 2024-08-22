import { Injectable } from '@nestjs/common';
import { ClientProxyFactory, Transport, ClientProxy } from '@nestjs/microservices';
import { log } from 'console';

@Injectable()
export class RabbitmqService {
    private client: ClientProxy;

    constructor () {
        this.client = ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://localhost:5672'],
                queue: 'user_events',
                queueOptions: {
                    durable: false
                }
            }
        })
    }
    
    async sendEvent (event: string, data: any) {
        try {
            await this.client.emit(event, data).toPromise();
            console.log(`Event ${event}, and sent successfully`);
        } catch (error) {
          console.log(`Failed to send event ${event}`, error);  
        }
    }
}
