import { Channel, connect, Connection } from "amqplib";

export class RabbitMQ {
  private connection: Connection;
  private channel: Channel = null;
  private bindings: {exchanges: string[], queues: string[]} = {exchanges: [], queues: []}
  private ready = false;
  private waiting: ((value: boolean) => void)[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    this.connection = await connect('amqp://thidle-mail:123456789@172.16.0.122/mail', {});
    this.channel = await this.connection.createChannel();
    this.ready = true;
    this.waiting.forEach(i => i(true));
    this.waiting = [];
  }

  async sendToQueue(queue: string, data: Buffer | object | string | number){
    if(!this.ready) await new Promise((resolve) => { this.waiting.push(resolve) });

    if(!this.bindings.queues.includes(queue)) await this.channel.assertQueue(queue, { durable: true });

    this.channel.sendToQueue(
      queue, 
      Buffer.isBuffer(data) ? 
        data : 
        Buffer.from(
          ['string', 'number'].includes(typeof data) ? 
            data.toString() : 
            JSON.stringify(data)
        )
    );
  }
}
