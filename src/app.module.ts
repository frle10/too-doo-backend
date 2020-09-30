import { Module } from '@nestjs/common';
import { TodosModule } from './todos/todos.module';
import { TodoListService } from './todos/todoList/todoList.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), TodosModule],
})
export class AppModule {}
