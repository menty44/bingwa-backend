import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {TicketRepository, UserCredRepository} from '../repositories';
import {Users} from "../models";

import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where,} from '@loopback/repository';


@injectable({scope: BindingScope.TRANSIENT})
export class CommonService {
  constructor(
      /* Add @inject to inject parameters */
      @repository(UserCredRepository) protected userCRepository: UserCredRepository,
  ) {}

  /*
   * Add service methods here
   */

  async checkUser(email: string | undefined): Promise<any> {
    return await this.userCRepository.findOne({where: {email: email}});
  }

  async findTempUserByID(id: string | undefined): Promise<any> {
    // @ts-ignore
    return this.userCRepository.findById(id, Users);
  }
}
