import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Users} from '../models';
// @ts-ignore
import {CredentialsRepository, UserRepository} from '../repositories';
import {authenticate, TokenService} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {SecurityBindings} from "@loopback/security";
import {
  TokenServiceBindings,
  UserServiceBindings,
  User,
  Credentials,
  MyUserService,
} from '@loopback/authentication-jwt';
import {hash, genSalt} from 'bcryptjs';
import _ from 'lodash';
// import { Credentials } from '../models/credentials.model';

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

export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: Users,
    @repository(UserRepository)
    public usersRepository : UserRepository,
    @repository(CredentialsRepository)
    public credRepository : CredentialsRepository,
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
      let us = await this.usersRepository.create(users);
      // Credentials.id = us.id;
      // Credentials.password = us.password;
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
    return this.usersRepository.count(where);
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
  ): Promise<Users[]> {
    return this.usersRepository.find(filter);
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
    return this.usersRepository.updateAll(users, where);
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
  ): Promise<Users> {
    return this.usersRepository.findById(id, filter);
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
    await this.usersRepository.updateById(id, users);
  }

  @put('/users/{id}')
  @response(204, {
    description: 'Users PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() users: Users,
  ): Promise<void> {
    await this.usersRepository.replaceById(id, users);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'Users DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usersRepository.deleteById(id);
  }

  async checkUser(email: string): Promise<any> {
    let foundUser = await this.usersRepository.findOne({where: {email: email}});
    return foundUser;
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
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(Users, {partial: true}),
          },
        },
      }) credentials: Credentials,
  ): Promise<{ token: string }> {
    console.log(credentials)
    console.table(credentials)

    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);
    console.log(user)
    console.table(user)
    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);
    console.log(userProfile)
    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    console.log(token)

    return { token };
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


