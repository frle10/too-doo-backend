import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoList } from './todo-list/todoList.entity';
import { Todo } from './todo/todo.entity';
import { AddTodoDto } from './todo/dto/add-todo.dto';
import { UpdateNameDto } from './todo-list/dto/update-name.dto';

// Newest todos first. The list is small, so an in-memory sort is fine and keeps
// ordering independent of insertion/return order from the driver.
function sortTodosDescending(todoList: TodoList): void {
  todoList.todos.sort((a, b) => b.id - a.id);
}

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(TodoList)
    private readonly todoListRepository: Repository<TodoList>,
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  // Returns null when no list exists for the uuid. Nest serializes that to a
  // 200 with an empty body, which the frontend reads as "no such list".
  async getTodoList(uuid: string): Promise<TodoList | null> {
    const todoList = await this.todoListRepository.findOne({ where: { uuid } });

    if (todoList) {
      sortTodosDescending(todoList);
    }

    return todoList;
  }

  async addTodo(uuid: string, addTodoDto: AddTodoDto): Promise<Todo> {
    const todoList = await this.findOrCreateTodoList(uuid);

    const todo = this.todoRepository.create({
      completed: false,
      content: addTodoDto.content,
      todoList,
    });
    await this.todoRepository.save(todo);

    // Drop the back-reference so the response is just the todo, not the whole
    // list nested inside it.
    delete todo.todoList;
    return todo;
  }

  async deleteTodoById(id: number): Promise<void> {
    const result = await this.todoRepository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Todo with ID ${id} does not exist.`);
    }
  }

  async updateName(
    uuid: string,
    updateNameDto: UpdateNameDto,
  ): Promise<TodoList> {
    const todoList = await this.findOrCreateTodoList(uuid);

    todoList.name = updateNameDto.name;
    await this.todoListRepository.save(todoList);

    sortTodosDescending(todoList);
    return todoList;
  }

  async updateCompleted(id: number): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id } });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} does not exist.`);
    }

    todo.completed = !todo.completed;

    await this.todoRepository.save(todo);
    return todo;
  }

  // A list is created lazily: it does not exist until the user names it or adds
  // the first todo. A fresh list is named 'untitled' with no todos.
  private async findOrCreateTodoList(uuid: string): Promise<TodoList> {
    const existing = await this.todoListRepository.findOne({ where: { uuid } });
    if (existing) {
      return existing;
    }

    const todoList = this.todoListRepository.create({
      uuid,
      name: 'untitled',
      todos: [],
    });
    return this.todoListRepository.save(todoList);
  }
}
