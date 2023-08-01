import { EntityRepository, Repository } from 'typeorm';
import { Todo } from './todo.entity';
import { AddTodoDto } from './dto/add-todo.dto';
import { TodoList } from '../todo-list/todoList.entity';
import { NotFoundException } from '@nestjs/common';

@EntityRepository(Todo)
export class TodoRepository extends Repository<Todo> {
  async addTodo(todoList: TodoList, addTodoDto: AddTodoDto): Promise<Todo> {
    const todo = new Todo();
    todo.completed = false;
    todo.content = addTodoDto.content;
    todo.todoList = todoList;

    await todo.save();

    delete todo.todoList;
    return todo;
  }

  async updateCompleted(id: number): Promise<Todo> {
    const todo = await this.findOne({ where: { id } });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} does not exist.`);
    }

    todo.completed = !todo.completed;

    await todo.save();
    return todo;
  }
}
