import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { TodoList } from './todo-list/todoList.entity';
import { Todo } from './todo/todo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TodoList, Todo])],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
