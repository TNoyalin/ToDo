// To-Do List Application

// Main class to handle the to-do list functionality
class TodoList {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    this.render();
    this.setupEventListeners();
  }

  // Add a new task to the list
  addTask(taskText) {
    if (taskText.trim() === '') return;
    
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      createdAt: new Date()
    };
    
    this.tasks.push(newTask);
    this.saveToLocalStorage();
    this.render();
  }

  // Remove a task from the list
  removeTask(taskId) {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveToLocalStorage();
    this.render();
  }

  // Toggle the completed status of a task
  toggleTaskStatus(taskId) {
    this.tasks = this.tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    
    this.saveToLocalStorage();
    this.render();
  }

  // Save tasks to localStorage
  saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  // Render the task list to the DOM
  render() {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;
    
    todoList.innerHTML = '';
    
    if (this.tasks.length === 0) {
      todoList.innerHTML = '<li class="empty-list">No tasks yet. Add a task!</li>';
      return;
    }
    
    this.tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      if (task.completed) {
        li.classList.add('completed');
      }
      
      li.innerHTML = `
        <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
        <span class="task-text">${task.text}</span>
        <button class="delete-btn" data-id="${task.id}">Delete</button>
      `;
      
      todoList.appendChild(li);
    });
  }

  // Set up event listeners for the application
  setupEventListeners() {
    const addTaskForm = document.getElementById('add-task-form');
    const todoList = document.getElementById('todo-list');
    
    if (addTaskForm) {
      addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskInput = document.getElementById('new-task');
        this.addTask(taskInput.value);
        taskInput.value = '';
      });
    }
    
    if (todoList) {
      todoList.addEventListener('click', (e) => {
        // Handle delete button click
        if (e.target.classList.contains('delete-btn')) {
          const taskId = Number(e.target.getAttribute('data-id'));
          this.removeTask(taskId);
        }
        
        // Handle checkbox click
        if (e.target.classList.contains('task-checkbox')) {
          const taskId = Number(e.target.getAttribute('data-id'));
          this.toggleTaskStatus(taskId);
        }
      });
    }
  }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create the HTML structure if it doesn't exist
  // Initialize the TodoList
  const todoApp = new TodoList();
  
  // Make it globally accessible (optional)
  window.todoApp = todoApp;
});
