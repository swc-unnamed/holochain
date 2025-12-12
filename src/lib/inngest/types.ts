import { EventSchemas } from 'inngest';

type Events = {
  'demo/hello.world': {
    data: {
      message: string;
    }
  }
}

export const schemas = new EventSchemas().fromRecord<Events>();