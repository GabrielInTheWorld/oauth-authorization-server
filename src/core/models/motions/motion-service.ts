import DatabaseAdapter from '../../../adapter/services/database-adapter';
import { DatabasePort } from '../../../adapter/interfaces/database-port';
import { Inject } from '../../../core/modules/decorators';
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
    const id = Modules.random();
    const client = new Motion({ title, description });
    const done = await this.database.set(Motion.COLLECTIONSTRING, id, client);
    if (done) {
      this.motionCollection.set(id, client);
    }
    return client;
  }

  public getMotionById(motionId: string): Motion | undefined {
    return this.getAllMotions().find(motion => motion.motionId === motionId);
  }

  public updateMotion(motionId: string, update: Partial<Motion>): Motion | undefined {
    const motion = this.getMotionById(motionId);
    if (motion) {
      motion.update(update);
      this.motionCollection.set(motionId, motion);
      this.database.set(Motion.COLLECTIONSTRING, motionId, motion);
    }
    return motion;
  }

  public hasClient(clientId: string): boolean {
    return !!this.getAllMotions().find(motion => motion.motionId === clientId);
  }

  public getAllMotions(): Motion[] {
    return Array.from(this.motionCollection.values());
  }

  private async getAllMotionsFromDatabase(): Promise<Motion[]> {
    return await this.database.getAll(Motion.COLLECTIONSTRING);
  }

  private initMotionCollection(motions: Motion[]): void {
    for (const motion of motions) {
      this.motionCollection.set(motion.motionId, motion);
    }
  }
}
