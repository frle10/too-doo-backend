import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AddTodoDto } from './todo/dto/add-todo.dto';
import { TodoList } from './todoList/todoList.entity';
import { TodosService } from './todos.service';
import { Todo } from './todo/todo.entity';
import { UpdateNameDto } from './todoList/dto/update-name.dto';

@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Get('/:uuid')
  getTodoList(@Param('uuid', ParseUUIDPipe) uuid: string): Promise<TodoList> {
    return this.todosService.getTodoList(uuid);
  }

  @Post('/todo/:uuid')
  addTodo(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() addTodoDto: AddTodoDto,
  ): Promise<Todo> {
    return this.todosService.addTodo(uuid, addTodoDto);
  }

  @Patch('/:uuid')
  updateName(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateNameDto: UpdateNameDto,
  ): Promise<TodoList> {
    return this.todosService.updateName(uuid, updateNameDto);
  }

  @Patch('/todo/:id')
  updateCompleted(@Param('id', ParseIntPipe) id: number): Promise<Todo> {
    return this.todosService.updateCompleted(id);
  }
}
