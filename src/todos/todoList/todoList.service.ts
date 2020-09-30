import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TodoListRepository } from './todoList.repository';

@Injectable()
export class TodoListService {
  constructor(
    @InjectRepository(TodoListRepository)
    private todoListRepository: TodoListRepository,
  ) {}

  async getTodoList(uuid: string) {
    const todoList = await this.todoListRepository.getTodoList(uuid);
    return todoList;
  }
}
