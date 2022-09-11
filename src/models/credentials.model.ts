import {Entity, model, property} from '@loopback/repository';

@model()
export class Credentials extends Entity {
  @property({
    type: 'string',
    required: true,
    id: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  first_name: string;

  @property({
    type: 'string',
  })
  last_name?: string;

  @property({
    type: 'string',
    id: false,
    generated: false,
    required: true,
    'index': {'unique': true}
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;


  constructor(data?: Partial<Credentials>) {
    super(data);
  }
}

export interface CredentialsRelations {
  // describe navigational properties here
}

export type CredentialsWithRelations = Credentials & CredentialsRelations;
