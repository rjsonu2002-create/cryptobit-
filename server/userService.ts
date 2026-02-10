import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class UserService {
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers() {
    return await db.select().from(users);
  }

  async updateUserRole(userId: string, role: string) {
    const [user] = await db.update(users).set({ role }).where(eq(users.id, userId)).returning();
    return user;
  }
}

export const userService = new UserService();
