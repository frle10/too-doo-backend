import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TodoList } from '../todoList/todoList.entity';

@Entity()
export class Todo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  completed: boolean;

  @Column()
  content: string;

  @ManyToOne(
    () => TodoList,
    todoList => todoList.todos,
  )
  todoList: TodoList;
}
