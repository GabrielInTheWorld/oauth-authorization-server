import { BaseModel } from '../../../core/base/base-model';

interface IClient {
  clientId: string;
  clientSecret?: string;
  codeChallenge?: string;
  codeChallengeMethod?: undefined | 'S256';
  state: string;
  scope: string;
  redirectUrl?: string;
  appName?: string;
}

export class Client extends BaseModel implements IClient {
  public static readonly COLLECTIONSTRING = 'client';

  public readonly appName: string;
  public readonly appDescription: string;
  public readonly redirectUrl: string;

  public readonly clientId: string;
  public clientSecret: string;

  public constructor(input?: any) {
    super(Client.COLLECTIONSTRING, input);
  }
  public codeChallenge?: string | undefined;
  public codeChallengeMethod?: any;
  public state: string;
  public scope: string;
}
