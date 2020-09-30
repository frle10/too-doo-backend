import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosController } from './todos.controller';
import { TodoListRepository } from './todoList/todoList.repository';
import { TodoListService } from './todoList/todoList.service';

@Module({
  imports: [TypeOrmModule.forFeature([TodoListRepository])],
  controllers: [TodosController],
  providers: [TodoListService],
})
export class TodosModule {}
