import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosController } from './todos.controller';
import { TodoListRepository } from './todo-list/todoList.repository';
import { TodosService } from './todos.service';
import { TodoRepository } from './todo/todo.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TodoListRepository, TodoRepository])],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
