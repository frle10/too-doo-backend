import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { TodoList } from './todoList/todoList.entity';
import { TodoListService } from './todoList/todoList.service';

@Controller('todos')
export class TodosController {
  constructor(private todoListService: TodoListService) {}

  @Get('/:uuid')
  getTodoList(@Param('uuid', ParseUUIDPipe) uuid: string): Promise<TodoList> {
    return this.todoListService.getTodoList(uuid);
  }
}
