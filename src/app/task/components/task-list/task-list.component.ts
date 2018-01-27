import { Component, OnInit } from '@angular/core';

import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  public tasks: Task[];
  public loading: boolean;

  public constructor(private _taskService: TaskService) {
    //
  }

  public ngOnInit() {
    this.loadTasks();
  }

  public loadTasks() {
    this.loading = true;
    this._taskService.list().subscribe(
      tasks => {
        this.tasks = tasks;
        this.loading = false;
      }
    );
  }

  public addNewTask() {
    this.loading = true;
    const task = new Task();
    task.name = 'New Task';
    console.log(this.tasks.length);
    if (this.tasks.length > 0) {
      task.position = this.tasks[this.tasks.length-1].position + 1;
    } else {
      task.position = 0;
    }
    
    this._taskService.create(task).subscribe(
      () => this.loadTasks(),
      () => this.loadTasks()
    );
  }

  public removeTask(task: Task) {
    const index = this.tasks.indexOf(task);
    if (index !== -1) {
      this.tasks.splice(index, 1);
    }
  }

  public moveTask(event) {
    const task = event.task;
    const direction = event.direction;
    const index= this.tasks.indexOf(task);

    if (direction == 'up') {      
      if (index > 0) {
        this.loading = true;

        let tempItem = this.tasks[index-1];
        let tempPosition = this.tasks[index].position;
        this.tasks[index-1] = task;
        this.tasks[index] = tempItem;

        this.tasks[index-1].position = tempItem.position;
        this.tasks[index].position = tempPosition;

        this._taskService.update(this.tasks[index-1]).subscribe(
          () => this.loadTasks(),
          () => this.loadTasks()
        );
        this._taskService.update(this.tasks[index]).subscribe(
          () => this.loadTasks(),
          () => this.loadTasks()
        );
      }
    }
    
    if (direction == 'down') {      
      if (index < this.tasks.length-1) {
        this.loading = true;

        let tempItem = this.tasks[index+1];
        let tempPosition = this.tasks[index].position;

        this.tasks[index+1] = task;
        this.tasks[index] = tempItem;
        this.tasks[index+1].position = tempItem.position;
        this.tasks[index].position = tempPosition;

        this._taskService.update(this.tasks[index+1]).subscribe(
          () => this.loadTasks(),
          () => this.loadTasks()
        );
        this._taskService.update(this.tasks[index]).subscribe(
          () => this.loadTasks(),
          () => this.loadTasks()
        );
      }
    }    
  }  
}
