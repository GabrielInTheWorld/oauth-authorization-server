import { Constructable, InjectService } from '../../../core/modules/decorators';
import User from './user';
import { UserHandlerInterface } from './user-handler.interface';
import UserService from './user-service';
import { UserServiceInterface } from './user-service.interface';

@Constructable(UserHandlerInterface)
export class UserHandler implements UserHandlerInterface {
  public name = 'UserHandler';

  @InjectService(UserServiceInterface)
  private readonly userService: UserService;

  public async getUserByCredentials(username: string, password: string): Promise<User | undefined> {
    return await this.userService.getUserByCredentials(username, password);
  }
}
