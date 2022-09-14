import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BingwaDataSource} from '../datasources';
import {Ticket, TicketRelations} from '../models';

export class TicketRepository extends DefaultCrudRepository<
  Ticket,
  typeof Ticket.prototype.id,
  TicketRelations
> {
  constructor(
    @inject('datasources.bingwa') dataSource: BingwaDataSource,
  ) {
    super(Ticket, dataSource);
  }
}
