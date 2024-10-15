// // Uncomment these imports to begin using these cool features!

// // import {inject} from '@loopback/core';


// export class AuthControllerController {
//   constructor() {}
// }


import {repository} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {compareSync, genSaltSync, hashSync} from 'bcrypt';
import {sign} from 'jsonwebtoken';
import {User} from '../models';
import {UserRepository} from '../repositories';

export class AuthController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) { }

  @post('/register')
  async register(@requestBody() user: User): Promise<string> {
    const salt = genSaltSync(10);
    user.password = hashSync(user.password, salt);
    await this.userRepository.create(user);
    return 'User registered successfully';
  }

  @post('/login')
  async login(@requestBody() user: User): Promise<{token: string}> {
    const foundUser = await this.userRepository.findOne({
      where: {email: user.email},
    });

    if (!foundUser || !compareSync(user.password, foundUser.password)) {
      throw new Error('Invalid credentials');
    }

    const token = sign({id: foundUser.id}, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h',
    });

    return {token};
  }
}
