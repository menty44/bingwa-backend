import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BingwaDataSource} from '../datasources';
// @ts-ignore
import {Credentials, CredentialsRelations} from '../models';

export class CredentialsRepository extends DefaultCrudRepository<
  Credentials,
  typeof Credentials.prototype.id,
  CredentialsRelations
> {
  constructor(
    @inject('datasources.bingwa') dataSource: BingwaDataSource,
  ) {
    super(Credentials, dataSource);
  }
}
