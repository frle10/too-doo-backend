import { EntityRepository, Repository } from 'typeorm';
import { Todo } from './todo.entity';
import { AddTodoDto } from './dto/add-todo.dto';
import { TodoList } from '../todoList/todoList.entity';

@EntityRepository(Todo)
export class TodoRepository extends Repository<Todo> {
  async addTodo(todoList: TodoList, addTodoDto: AddTodoDto): Promise<Todo> {
    const todo = new Todo();
    todo.completed = false;
    todo.content = addTodoDto.content;
    todo.todoList = todoList;

    await todo.save();
    return todo;
  }

  async updateCompleted(id: number): Promise<Todo> {
    const todo = await this.findOne(id);
    todo.completed = !todo.completed;

    await todo.save();
    return todo;
  }
}
