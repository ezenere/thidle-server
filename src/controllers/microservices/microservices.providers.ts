import { RabbitMQ } from "./rabbitmq/rabbitmq.microservice";

export const microservicesProvider = [
  {
    provide: 'RabbitMQ',
    useClass: RabbitMQ,
  },
];
