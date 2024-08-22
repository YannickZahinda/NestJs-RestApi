import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './dto/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
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
    const user = await this.userModel.findById(id).select('avatar').exec();
    if (!user || !user.avatar) {
       throw new NotFoundException('Avatar not found');
    }
    return user.avatar
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
