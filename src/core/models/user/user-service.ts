import { uuid } from 'uuidv4';

import DatabaseAdapter from '../../../adapter/services/database-adapter';
import { DatabasePort } from '../../../adapter/interfaces/database-port';
import { Constructable, Inject, InjectService } from '../../modules/decorators';
import User from './user';
import { UserServiceInterface } from './user-service.interface';

@Constructable(UserServiceInterface)
export default class UserService implements UserServiceInterface {
  public name = 'UserService';

  @Inject(DatabasePort, User)
  private readonly database: DatabaseAdapter;

  private readonly userCollection: Map<string, User> = new Map();

  public constructor() {
    this.mockUserData();
    this.getAllUsersFromDatabase()
      .then(users => this.initUserCollection(users))
      .catch(e => console.log(e));
  }

  public async create(username: string, password: string): Promise<User> {
    console.log('promise21');
    const userId = uuid();
    const user: User = new User({ username, password, userId });
    const done = await this.database.set(User.COLLECTIONSTRING, userId, user);
    if (done) {
      this.userCollection.set(userId, user);
    }
    return user;
  }

  public async getUserByCredentials(username: string, password: string): Promise<User | undefined> {
    console.log('promise19');
    const users = this.getAllUsers();
    return users.find(user => user.username === username && user.password === password);
  }

  public async getUserBySessionId(sessionId: string): Promise<User | undefined> {
    console.log('promise20');
    const users = this.getAllUsers();
    return users.find(user => user.sessionId === sessionId);
  }

  public async getUserByUserId(userId: string): Promise<User | undefined> {
    console.log('promise22');
    const users = this.getAllUsers();
    return users.find(user => user.userId === userId);
  }

  public async hasUser(username: string, password: string): Promise<boolean> {
    console.log('promise23');
    const users = this.getAllUsers();
    return !!users.find(user => user.username === username && user.password === password);
  }

  public getAllUsers(): User[] {
    console.log('promise24');
    return Array.from(this.userCollection.values());
  }

  private async getAllUsersFromDatabase(): Promise<User[]> {
    console.log('promise25');
    return await this.database.getAll(User.COLLECTIONSTRING);
  }

  private initUserCollection(users: User[]): void {
    console.log('promise26');
    for (const user of users) {
      this.userCollection.set(user.userId, user);
    }
  }

  private async mockUserData(): Promise<void> {
    console.log('promise27');
    await this.create('demo', 'demo')
      .then(() => console.log('success'))
      .catch(e => console.log(e));
  }
}
