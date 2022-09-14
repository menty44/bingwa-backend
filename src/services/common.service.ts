import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {TicketRepository, UserCredRepository} from '../repositories';
import {repository} from "@loopback/repository";

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
}
