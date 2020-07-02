import DatabaseAdapter from '../../../adapter/services/database-adapter';
import { DatabasePort } from '../../../adapter/interfaces/database-port';
import { Inject, InjectService } from '../../../core/modules/decorators';
import { Modules } from '../../../model-services/modules';
import { Motion } from './motion';
import { MotionServiceInterface } from './motion-service.interface';

export class MotionService implements MotionServiceInterface {
  public name = 'motionService';

  @Inject(DatabasePort, Motion)
  private readonly database: DatabaseAdapter;

  private readonly motionCollection = new Map<string, Motion>();

  public constructor() {
    this.getAllMotionsFromDatabase().then(motions => this.initMotionCollection(motions));
  }

  public async create(title: string, description: string): Promise<Motion> {
    const key = Modules.random();
    const id = `${Motion.COLLECTIONSTRING}_${key}`;
    const motion = new Motion({ id, key, title, description });
    const done = await this.database.set(Motion.COLLECTIONSTRING, key, motion);
    if (done) {
      this.motionCollection.set(key, motion);
    }
    return motion;
  }

  public getMotionById(motionId: string): Motion | undefined {
    return this.getAllMotions().find(motion => motion.key === motionId);
  }

  public async updateMotion(motionId: string, update: Partial<Motion>): Promise<Motion | undefined> {
    console.log('promise31');
    const motion = this.getMotionById(motionId);
    if (motion) {
      motion.update(update);
      this.motionCollection.set(motionId, motion);
      await this.database.set(Motion.COLLECTIONSTRING, motionId, motion);
    }
    return motion;
  }

  public hasClient(clientId: string): boolean {
    return !!this.getAllMotions().find(motion => motion.key === clientId);
  }

  public getAllMotions(): Motion[] {
    console.log('motions in motion service', Array.from(this.motionCollection.values()));
    return Array.from(this.motionCollection.values());
  }

  private async getAllMotionsFromDatabase(): Promise<Motion[]> {
    // console.log('promise30', this.database.getAll(Motion.COLLECTIONSTRING));
    return await this.database.getAll(Motion.COLLECTIONSTRING);
  }

  private initMotionCollection(motions: Motion[]): void {
    for (const motion of motions) {
      this.motionCollection.set(motion.key, motion);
    }
  }
}
