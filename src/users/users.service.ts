import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './dto/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { Avatar, AvatarDocument } from './dto/avatar.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
  @InjectModel(Avatar.name) private avatarModel: Model<AvatarDocument>,
  private rabbitmqService: RabbitmqService) {}

  async create(createUserDto: CreateUserDto): Promise< User> {
    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();

    await this.rabbitmqService.sendEvent('User was created successfully', savedUser)

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not Found');
    }
    return user;
  }

  async getAvatar(id: string): Promise <string> {
    const existingAvatar = await this.avatarModel.findOne({id}).exec();
    if (existingAvatar) {
        return existingAvatar.base64;
    }

    const userData = await this.getUserFromExternalApi(id);
    const avatarUrl = userData.avatar;

    const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    const base64 = buffer.toString('base64');

    const newAvatar = new this.avatarModel({id, hash, base64});
    await newAvatar.save();

    return base64;
    // const user = await this.userModel.findById(id).select('avatar').exec();
    // if (!user || !user.avatar) {
    //    throw new NotFoundException('Avatar not found');
    // }
    // return user.avatar
  }

  async getUserFromExternalApi(userId: string): Promise <any> {
    try {
        const numericUserId = parseInt(userId, 10)

        const idToUse = !isNaN(numericUserId) ? numericUserId : userId;

        this.logger.log(`Fetching user data for userId: ${idToUse}`);
        const response = await axios.get(`https://reqres.in/api/users/${idToUse}`);
        this.logger.log(`Successfully fetched user data for userId: ${idToUse}`);
        return response.data.data
    } catch (error) {
        this.logger.error(`Error fetching user data for userId: ${userId}`, error.stack);
        if (axios.isAxiosError(error) && error.response.status === 404) {
            throw new NotFoundException ('The User was not found in the external API');
        }
        throw new InternalServerErrorException(`Failed to fetch user data for userId: ${userId}`);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    if (!updatedUser) {
      throw new NotFoundException('User not Found');
    }
    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException('User not Found');
    }
    return deletedUser;
  }
}
