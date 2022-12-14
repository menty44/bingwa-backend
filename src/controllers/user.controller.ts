import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where,} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef, HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
  SchemaObject,
} from '@loopback/rest';
import {Users, UsersRelations} from '../models';
// @ts-ignore
import {CredentialsRepository, UserCredRepository} from '../repositories';
import {inject} from "@loopback/core";
import { authenticate, TokenService } from '@loopback/authentication';
import {
  MyUserService,
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import { SecurityBindings, securityId, UserProfile } from '@loopback/security';
import { compare, genSalt, hash } from 'bcryptjs';

// Describes the type of grant object taken in by method "refresh"
type RefreshGrant = {
  refreshToken: string;
};

export type Credentials = {
  email: string;
  password: string;
};

// Describes the schema of grant object
const RefreshGrantSchema: SchemaObject = {
  type: 'object',
  required: ['refreshToken'],
  properties: {
    refreshToken: {
      type: 'string',
    },
  },
};

// Describes the request body of grant object
const RefreshGrantRequestBody = {
  description: 'Reissuing Acess Token',
  required: true,
  content: {
    'application/json': {schema: RefreshGrantSchema},
  },
};
let  CredentialsSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 5,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

const UserSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 6,
    },
  },
};

export const RequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': { schema: UserSchema },
  },
};

export class UserController {
  constructor(
      @inject(TokenServiceBindings.TOKEN_SERVICE)
      public jwtService: TokenService,
      @inject(UserServiceBindings.USER_SERVICE)
      public userService: MyUserService,
      @inject(SecurityBindings.USER, { optional: true })
      public user: UserProfile,
      @repository(UserCredRepository) protected userCRepository: UserCredRepository,
      @repository(CredentialsRepository) protected credRepository: CredentialsRepository,
  ) {}
  
  @post('/users')
  @response(200, {
    description: 'Users model instance',
    content: {'application/json': {schema: getModelSchemaRef(Users)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {
            title: 'NewUsers'
          }),
        },
      },
    })
    users: Omit<Users, 'id'>,
  ): Promise<any> {
    let checker = await this.checkUser(users.email);
    const password = await hash(users.password, await genSalt());

    if (checker && checker.email === users.email) {
      return {message: 'Email already in use'};
    }else {
      users.password = password
      let us = await this.userCRepository.create(users);
      await this.credRepository.create(us);
      return us;
    }
  }

  @get('/users/count')
  @response(200, {
    description: 'Users model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Users) where?: Where<Users>,
  ): Promise<Count> {
    return this.userCRepository.count(where);
  }

  @get('/users')
  @response(200, {
    description: 'Array of Users model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Users, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Users) filter?: Filter<Users>,
  ): Promise<any> {
    return this.userCRepository.find(filter);
  }

  @patch('/users')
  @response(200, {
    description: 'Users PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {partial: true}),
        },
      },
    })
    users: Users,
    @param.where(Users) where?: Where<Users>,
  ): Promise<Count> {
    return this.userCRepository.updateAll(users, where);
  }

  @get('/users/{id}')
  @response(200, {
    description: 'Users model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Users, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Users, {exclude: 'where'}) filter?: FilterExcludingWhere<Users>
  ): Promise<any> {
    return this.userCRepository.findById(id, filter);
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'Users PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {partial: true}),
        },
      },
    })
    users: Users,
  ): Promise<void> {
    await this.userCRepository.updateById(id, users);
  }

  @put('/users/{id}')
  @response(204, {
    description: 'Users PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() users: Users,
  ): Promise<void> {
    await this.userCRepository.replaceById(id, users);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'Users DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userCRepository.deleteById(id);
  }

  async checkUser(email: string): Promise<any> {
    return await this.userCRepository.findOne({where: {email: email}});
  }

  // @ts-ignore
  @post('/signin', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async signIn(
      @requestBody(RequestBody) credentials: Credentials,
  ): Promise<any> {
    console.log(credentials)
    // ensure the user exists, and the password is correct
    const user = await this.verifyCredentials(credentials);
    console.table(user)
    // convert a User object into a UserProfile object (reduced set of properties)
    // @ts-ignore
    const userProfile = this.userService.convertToUserProfile(user);
    console.table(userProfile)
    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    return {
      token: token,
      user: user
    }
  }

  async verifyCredentials(credentials: Credentials): Promise<Users> {
    const invalidCredentialsError = 'Invalid email or password.';

    const foundUser = await this.userCRepository.findOne({
      where: {email: credentials.email},
    });
    console.error(foundUser);
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await compare(
        credentials.password,
        foundUser.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  @authenticate('jwt')
  @get('/whoami', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async whoAmI(
      @inject(SecurityBindings.USER)
          loggedInUserProfile: Users,
  ): Promise<string> {
    // @ts-ignore
    return loggedInUserProfile[securityId];
  }

}


