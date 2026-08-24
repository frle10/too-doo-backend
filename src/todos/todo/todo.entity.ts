import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TodoList } from '../todo-list/todoList.entity';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  completed: boolean;

  @Column()
  content: string;

  @ManyToOne(() => TodoList, (todoList) => todoList.todos)
  todoList?: TodoList;
}
