// UI enhancement for the To-Do List application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the TodoList from toDo.js
    const todoApp = window.todoApp;
    
    // Additional UI elements
    const totalTasksElement = document.getElementById('total-tasks');
    const completedTasksElement = document.getElementById('completed-tasks');
    const pendingTasksElement = document.getElementById('pending-tasks');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clearCompletedButton = document.getElementById('clear-completed');
    const clearAllButton = document.getElementById('clear-all');
    
    // Update task statistics
    function updateTaskStats() {
        const totalTasks = todoApp.tasks.length;
        const completedTasks = todoApp.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        
        totalTasksElement.textContent = totalTasks;
        completedTasksElement.textContent = completedTasks;
        pendingTasksElement.textContent = pendingTasks;
    }
    
    // Filter tasks based on status
    function filterTasks(filter) {
        const taskItems = document.querySelectorAll('.todo-item');
        
        taskItems.forEach(item => {
            switch(filter) {
                case 'all':
                    item.style.display = 'flex';
                    break;
                case 'completed':
                    item.classList.contains('completed') 
                        ? item.style.display = 'flex' 
                        : item.style.display = 'none';
                    break;
                case 'pending':
                    !item.classList.contains('completed') 
                        ? item.style.display = 'flex' 
                        : item.style.display = 'none';
                    break;
            }
        });
    }
    
    // Clear completed tasks
    function clearCompletedTasks() {
        const completedTaskIds = todoApp.tasks
            .filter(task => task.completed)
            .map(task => task.id);
            
        completedTaskIds.forEach(id => todoApp.removeTask(id));
        updateTaskStats();
    }
    
    // Clear all tasks
    function clearAllTasks() {
        if (confirm('Are you sure you want to delete all tasks?')) {
            todoApp.tasks = [];
            todoApp.saveToLocalStorage();
            todoApp.render();
            updateTaskStats();
        }
    }
    
    // Override the original render method to include stats update
    const originalRender = todoApp.render;
    todoApp.render = function() {
        originalRender.call(this);
        updateTaskStats();
    };
    
    // Set up event listeners for the enhanced UI
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Filter tasks
            filterTasks(button.getAttribute('data-filter'));
        });
    });
    
    clearCompletedButton.addEventListener('click', clearCompletedTasks);
    clearAllButton.addEventListener('click', clearAllTasks);
    
    // Initialize stats on page load
    updateTaskStats();
});
