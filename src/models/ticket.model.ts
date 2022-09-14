import {Entity, model, property} from '@loopback/repository';

@model()
export class Ticket extends Entity {

  @property({
    type: 'string',
    required: false,
    id: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'boolean',
    required: true,
  })
  impersonate: boolean;

  @property({
    type: 'string',
    required: true,
  })
  created_by: string;

  @property({
    type: 'string',
    default: 'phantom',
  })
  act_as?: string;

  @property({
    type: 'string',
    required: false,
  })
  naration: string;


  constructor(data?: Partial<Ticket>) {
    super(data);
  }
}

export interface TicketRelations {
  // describe navigational properties here
}

export type TicketWithRelations = Ticket & TicketRelations;
