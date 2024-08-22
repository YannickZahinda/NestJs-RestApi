import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './dto/user.schema';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';

@Module({
    imports: [MongooseModule.forFeature([{name: User.name, schema: UserSchema}])],
    controllers: [UsersController],
    providers: [UsersService, RabbitmqService]
})
export class UsersModule {}
