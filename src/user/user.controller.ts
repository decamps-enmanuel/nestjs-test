import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/test/solution/single')
  async getSolutionSingle(): Promise<
    User | { error: boolean; message: string }
  > {
    return await this.userService.solutionSingle();
  }
  @Get('/test/solution/multiple')
  async getSolutionMultiple(): Promise<
    User[] | { error: boolean; message: string }
  > {
    return await this.userService.solutionMultiple();
  }
  @Get('/:id')
  async getUser(@Param('id') id: string): Promise<User | null> {
    return await this.userService.user({ id: Number(id) });
  }
  @Get()
  async getUsers(): Promise<User[] | null> {
    return await this.userService.users();
  }
  @Get('create')
  async createUser(): Promise<User | null> {
    // 1. Send API request to Reqres to get a user
    // 2. Extract their data and add them to the database
    // 3. Check that the new users exist in database
    // 4. Send API request to Reqres to get a list of users
    // 5. Extract their data and add them in bulk to db
    // 6. Check that all of them exist in the database
    return await this.userService.createUser({
      name: 'test',
      email: 'test.test1@test.com',
    });
  }
}
