import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }
  async users(): Promise<User[] | null> {
    return await this.prisma.user.findMany();
  }
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({ data });
  }

  async solutionSingle(): Promise<User | { error: boolean; message: string }> {
    try {
      // 1. Send API request to Reqres to get a user
      const getSingleUser = await axios.get('https://reqres.in/api/users/1');
      console.log('getSingleUser', getSingleUser.data.data);
      const {
        data: { data },
      } = getSingleUser;
      console.log('info', data);
      //1.5 Check if email exists before adding them
      const emailExists = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      console.log('email exists', emailExists);
      if (emailExists) {
        return { error: true, message: `${data.email} already exists!` };
      }
      // 2. Extract their data and add them to the database
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: `${data.first_name} ${data.last_name}`,
        },
      });
      console.log('user', user);
      // 3. Check that the new users exist in database
      const userExists = await this.prisma.user.findUnique({
        where: { id: user.id },
      });
      console.log('userExists', userExists);
    } catch (error) {
      console.log('error solution', error);
      return { error: true, message: error };
    }
  }
  async solutionMultiple(): Promise<
    User[] | { error: boolean; message: string }
  > {
    try {
      // Deleting everything because of limited data
      await this.prisma.user.deleteMany();

      // 4. Send API request to Reqres to get a list of users
      const getMultipleUser = await axios.get(
        'https://reqres.in/api/users?page=1',
      );
      const {
        data: { data },
      } = getMultipleUser;
      console.log('info', data);

      // 5. Extract their data and add them in bulk to db
      // SQLite does not support createMany view remarks section on the createMany entry
      // https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#remarks-9

      const insertUsers = await Promise.all(
        data.map(async (user) => {
          const insert = await this.prisma.user.create({
            data: {
              email: user.email,
              name: `${user.first_name} ${user.last_name}`,
            },
          });
          return insert.id;
        }),
      );
      console.log('bulk users', insertUsers);
      // 6. Check that all of them exist in the database
      const usersFound = await this.prisma.user.findMany({
        where: { id: { in: insertUsers } },
      });
      console.log('usersFound', usersFound);
      return usersFound;
    } catch (error) {
      console.log('error solution', error);
      return { error: true, message: error };
    }
  }
}
