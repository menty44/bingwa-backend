import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BingwaDataSource} from '../datasources';
import {Users, UsersRelations} from '../models';

export class UserRepository extends DefaultCrudRepository<
  Users,
  typeof Users.prototype.email,
  UsersRelations
> {
  constructor(
    @inject('datasources.bingwa') dataSource: BingwaDataSource,
  ) {
    super(Users, dataSource);
  }
}
