import { BaseModel } from '../../../core/base/base-model';

export class Client extends BaseModel {
  public static readonly COLLECTIONSTRING = 'client';

  public readonly appName: string;
  public readonly appDescription: string;
  public readonly redirectUrl: string;

  public readonly clientId: string;
  public clientSecret: string;

  public constructor(input?: any) {
    super(Client.COLLECTIONSTRING, input);
  }
}
