import { Component, OnInit } from '@angular/core';

import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';
import { zip } from 'rxjs/observable/zip';


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
    this.loading = true;        
    const actualTask = event.task;

    const direction = event.direction;
    const actualTaskIndex = this.tasks.indexOf(actualTask); 
    const actualTaskPosition = actualTask.position;

    let referenceTaskIndex = direction == 'up'? actualTaskIndex - 1 : actualTaskIndex + 1;    
    let referenceTask = this.tasks[referenceTaskIndex];

    this.tasks[referenceTaskIndex] = actualTask;
    this.tasks[actualTaskIndex] = referenceTask;
    this.tasks[referenceTaskIndex].position = referenceTask.position;
    this.tasks[actualTaskIndex].position = actualTaskPosition;

    zip(
      this._taskService.update(this.tasks[referenceTaskIndex]),
      this._taskService.update(this.tasks[actualTaskIndex])
    ).subscribe(
      () => {
        this.loadTasks();
      },
      error => {
        console.log(error);
        this.loadTasks();
      }
    );     
  }  
}