import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TodoListRepository } from './todoList/todoList.repository';
import { AddTodoDto } from './todo/dto/add-todo.dto';
import { Todo } from './todo/todo.entity';
import { TodoRepository } from './todo/todo.repository';
import { UpdateNameDto } from './todoList/dto/update-name.dto';
import { TodoList } from './todoList/todoList.entity';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(TodoListRepository)
    private todoListRepository: TodoListRepository,
    @InjectRepository(TodoRepository)
    private todoRepository: TodoRepository,
  ) {}

  async getTodoList(uuid: string) {
    const todoList = await this.todoListRepository.getTodoList(uuid);
    return todoList;
  }

  async addTodo(uuid: string, addTodoDto: AddTodoDto): Promise<Todo> {
    const todoList = await this.todoListRepository
      .findOne({ uuid })
      .then(tl => {
        if (!tl) {
          return this.todoListRepository.createTodoList(uuid);
        }
      });

    return this.todoRepository.addTodo(todoList, addTodoDto);
  }

  updateName(uuid: string, updateNameDto: UpdateNameDto): Promise<TodoList> {
    return this.todoListRepository.updateName(uuid, updateNameDto);
  }

  async updateCompleted(id: number) {
    return this.todoRepository.updateCompleted(id);
  }
}
