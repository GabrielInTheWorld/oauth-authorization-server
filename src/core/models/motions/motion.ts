import { BaseModel } from '../../../core/base/base-model';

export class Motion extends BaseModel {
  public static readonly COLLECTIONSTRING = 'motion';

  public readonly motionId: string;
  public title: string;
  public description: string;

  public constructor(input?: any) {
    super(input);
  }

  public update(motion: Partial<Motion>): void {
    this.assign(motion);
  }
}
