// Mock the DOM environment for testing
document.body.innerHTML = `
  <div id="todo-app">
    <form id="add-task-form">
      <input type="text" id="new-task">
      <button type="submit">Add Task</button>
    </form>
    <ul id="todo-list"></ul>
  </div>
`;

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Import the TodoList class by including it directly in the test
// This is the actual implementation from toDo.js
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

describe('TodoList', () => {
  let todoList;
  
  beforeEach(() => {
    // Clear localStorage and DOM before each test
    localStorage.clear();
    document.getElementById('todo-list').innerHTML = '';
    
    // Mock Date.now() to return a consistent value for testing
    jest.spyOn(Date, 'now').mockImplementation(() => 12345);
    
    // Create a spy on the render method
    jest.spyOn(TodoList.prototype, 'render');
    jest.spyOn(TodoList.prototype, 'saveToLocalStorage');
    
    todoList = new TodoList();
    // Reset the call counts after initialization
    TodoList.prototype.render.mockClear();
    TodoList.prototype.saveToLocalStorage.mockClear();
  });

  afterEach(() => {
    // Restore original implementation of Date.now
    jest.restoreAllMocks();
  });

  test('should initialize with an empty tasks array when localStorage is empty', () => {
    expect(todoList.tasks).toEqual([]);
    expect(localStorage.getItem).toHaveBeenCalledWith('tasks');
  });

  test('should initialize with tasks from localStorage if available', () => {
    // Clear mocks and localStorage
    jest.clearAllMocks();
    localStorage.clear();
    
    const storedTasks = [
      { id: 1, text: 'Test task', completed: false, createdAt: '2023-01-01T00:00:00.000Z' }
    ];
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(storedTasks));
    
    todoList = new TodoList();
    
    expect(todoList.tasks).toEqual(storedTasks);
  });

  test('should add a new task to the tasks array', () => {
    const taskText = 'New task';
    todoList.addTask(taskText);
    
    expect(todoList.tasks.length).toBe(1);
    expect(todoList.tasks[0]).toEqual({
      id: 12345,
      text: taskText,
      completed: false,
      createdAt: expect.any(Date)
    });
    expect(todoList.saveToLocalStorage).toHaveBeenCalled();
    expect(todoList.render).toHaveBeenCalled();
  });

  test('should not add an empty task', () => {
    todoList.addTask('');
    todoList.addTask('   ');
    
    expect(todoList.tasks.length).toBe(0);
    expect(todoList.saveToLocalStorage).not.toHaveBeenCalled();
    expect(todoList.render).not.toHaveBeenCalled();
  });

  test('should remove a task by id', () => {
    // Add two tasks
    todoList.tasks = [
      { id: 1, text: 'Task 1', completed: false, createdAt: new Date() },
      { id: 2, text: 'Task 2', completed: false, createdAt: new Date() }
    ];
    
    todoList.removeTask(1);
    
    expect(todoList.tasks.length).toBe(1);
    expect(todoList.tasks[0].id).toBe(2);
    expect(todoList.saveToLocalStorage).toHaveBeenCalled();
    expect(todoList.render).toHaveBeenCalled();
  });

  test('should toggle task completion status', () => {
    // Add a task
    todoList.tasks = [
      { id: 1, text: 'Task 1', completed: false, createdAt: new Date() }
    ];
    
    todoList.toggleTaskStatus(1);
    
    expect(todoList.tasks[0].completed).toBe(true);
    
    todoList.toggleTaskStatus(1);
    
    expect(todoList.tasks[0].completed).toBe(false);
    expect(todoList.saveToLocalStorage).toHaveBeenCalledTimes(2);
    expect(todoList.render).toHaveBeenCalledTimes(2);
  });

  test('should save tasks to localStorage', () => {
    todoList.tasks = [
      { id: 1, text: 'Task 1', completed: false, createdAt: new Date() }
    ];
    
    todoList.saveToLocalStorage();
    
    expect(localStorage.setItem).toHaveBeenCalledWith('tasks', JSON.stringify(todoList.tasks));
  });

  test('should render tasks to the DOM', () => {
    // Add some tasks
    todoList.tasks = [
      { id: 1, text: 'Task 1', completed: false, createdAt: new Date() },
      { id: 2, text: 'Task 2', completed: true, createdAt: new Date() }
    ];
    
    // Call render directly
    todoList.render();
    
    // Check the DOM
    const todoListElement = document.getElementById('todo-list');
    const listItems = todoListElement.querySelectorAll('li.todo-item');
    
    expect(listItems.length).toBe(2);
    expect(listItems[0].querySelector('.task-text').textContent).toBe('Task 1');
    expect(listItems[1].querySelector('.task-text').textContent).toBe('Task 2');
    expect(listItems[1].classList.contains('completed')).toBe(true);
  });

  test('should render empty state when no tasks exist', () => {
    // Ensure tasks array is empty
    todoList.tasks = [];
    
    // Call render directly
    todoList.render();
    
    // Check the DOM
    const todoListElement = document.getElementById('todo-list');
    const emptyMessage = todoListElement.querySelector('.empty-list');
    
    expect(emptyMessage).not.toBeNull();
    expect(emptyMessage.textContent).toBe('No tasks yet. Add a task!');
  });
});

// Test the DOM interaction functionality
describe('TodoList DOM Interactions', () => {
  let todoList;
  
  beforeEach(() => {
    // Clear localStorage and reset DOM
    localStorage.clear();
    document.body.innerHTML = `
      <div id="todo-app">
        <form id="add-task-form">
          <input type="text" id="new-task">
          <button type="submit">Add Task</button>
        </form>
        <ul id="todo-list"></ul>
      </div>
    `;
    
    // Mock methods
    jest.spyOn(TodoList.prototype, 'addTask');
    jest.spyOn(TodoList.prototype, 'removeTask');
    jest.spyOn(TodoList.prototype, 'toggleTaskStatus');
    
    todoList = new TodoList();
    
    // Clear the call counts after initialization
    TodoList.prototype.addTask.mockClear();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  test('should add a task when form is submitted', () => {
    // Set up the input value
    const input = document.getElementById('new-task');
    input.value = 'New test task';
    
    // Submit the form
    const form = document.getElementById('add-task-form');
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);
    
    expect(todoList.addTask).toHaveBeenCalledWith('New test task');
    expect(input.value).toBe('');
  });
  
  test('should remove a task when delete button is clicked', () => {
    // Add a task first
    todoList.tasks = [{ id: 123, text: 'Test task', completed: false, createdAt: new Date() }];
    todoList.render();
    
    // Find and click the delete button
    const deleteButton = document.querySelector('.delete-btn');
    deleteButton.click();
    
    expect(todoList.removeTask).toHaveBeenCalledWith(123);
  });
  
  test('should toggle task status when checkbox is clicked', () => {
    // Add a task first
    todoList.tasks = [{ id: 456, text: 'Test task', completed: false, createdAt: new Date() }];
    todoList.render();
    
    // Find and click the checkbox
    const checkbox = document.querySelector('.task-checkbox');
    checkbox.click();
    
    expect(todoList.toggleTaskStatus).toHaveBeenCalledWith(456);
  });
});
