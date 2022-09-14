import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {BingwaDataSource} from '../datasources';
import {Users, UsersRelations} from '../models';
import {User, UserCredentials} from "@loopback/authentication-jwt/src/models";
import {UserCredentialsRepository} from "@loopback/authentication-jwt/src/repositories/user-credentials.repository";

export class UserCredRepository extends DefaultCrudRepository<
// export class UserRepository extends DefaultCrudRepository<
  Users,
  typeof Users.prototype.id,
  // typeof Users.prototype.email,
  UsersRelations
> {

    public readonly userCredentials: HasOneRepositoryFactory<
        UserCredentials,
        typeof User.prototype.id
        >;

  constructor(
    @inject('datasources.bingwa') dataSource: BingwaDataSource,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>,
  ) {
    super(Users, dataSource);

      // this.userCredentials = this.createHasOneRepositoryFactoryFor(
      //     'userCredentials',
      //     userCredentialsRepositoryGetter,
      // );
      // this.registerInclusionResolver(
      //     'userCredentials',
      //     this.userCredentials.inclusionResolver,
      // );
  }

  async findCredentials(
      userId: typeof User.prototype.id,
  ): Promise<UserCredentials | undefined> {
    return this.userCredentials(userId)
        .get()
        .catch(err => {
          if (err.code === 'ENTITY_NOT_FOUND') return undefined;
          throw err;
        });
  }
}
