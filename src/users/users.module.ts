import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './dto/user.schema';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { Avatar, AvatarSchema } from './dto/avatar.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}, 
        { name: Avatar.name, schema: AvatarSchema }
    ])],
    controllers: [UsersController],
    providers: [UsersService, RabbitmqService]
})
export class UsersModule {}
