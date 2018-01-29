import { Component, OnInit } from '@angular/core';

import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';
import { forkJoin } from 'rxjs/observable/forkJoin';



@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  public tasks: Task[];
  public loading: boolean;
  public sortBy;
  public sortDirection;

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

  public sortTasks(sortBy) {
    this.loading = true;
    this.sortBy = sortBy;
    this.sortDirection = this.sortDirection == 'desc' ? 'asc' : 'desc';
    const baseOrdering = this.sortBy == 'name' ? 'asc' : 'desc';

    this.tasks.sort(
      (a,b) => {
        if (a[sortBy] > b[sortBy]) return this.sortDirection == baseOrdering ? -1 : 1;
        if (a[sortBy] < b[sortBy]) return this.sortDirection == baseOrdering ? +1 : -1;

        return 0;
      } 
    );

    let tasksToUpdate = [];
    for (let i = 0; i <= this.tasks.length-1; i++) {
      this.tasks[i].position = i;
      tasksToUpdate.push(this._taskService.update(this.tasks[i]));
    }

    forkJoin(tasksToUpdate).subscribe(
      () => {
        this.loadTasks();
      },
      error => {
        console.log(error);
        this.loadTasks();
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

    let referenceTask = this.tasks[this.tasks.indexOf(event.task) + event.direction];
    let referenceTaskPosition = referenceTask.position;

    referenceTask.position = event.task.position;
    event.task.position = referenceTaskPosition;

    forkJoin(
      this._taskService.update(event.task),
      this._taskService.update(referenceTask)
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