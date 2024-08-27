let taskId = 0;
let selectedTask = null;

// Function to calculate the color based on position
function calculateColor(xPercent, yPercent) {
    const hue = (xPercent * 1.5 + yPercent * 1.5) % 360; // Adjust hue based on x and y position
    return `hsl(${hue}, 70%, 60%)`;
}

// Function to extract task number and description
function parseTaskText(taskText) {
    const match = taskText.match(/^\s*(\d+)\.\s+(.+)/);
    if (match && match[2].trim().length > 0) {
        return {
            number: match[1].trim(),
            description: match[2].trim()
        };
    } else {
        return null;
    }
}

// Paste Tasks Function
function pasteTasks() {
    const taskPasteInput = document.getElementById('task-paste-input');
    const tasks = taskPasteInput.value.trim().split('\n');

    tasks.forEach((taskText) => {
        const parsedTask = parseTaskText(taskText);
        if (parsedTask) {
            createTaskDot(parsedTask, parsedTask.number);
        }
    });

    taskPasteInput.value = ""; // Clear the textarea after adding
}

// Function to create a task dot
function createTaskDot(parsedTask, taskNumber, left = null, top = null, isComplete = false) {
    const taskDot = document.createElement('div');
    taskDot.className = 'task-dot';
    taskDot.id = `task-${taskId++}`;
    taskDot.draggable = true;

    const x = left !== null ? left : Math.random() * 90;
    const y = top !== null ? top : Math.random() * 90;

    taskDot.style.left = `${x}%`;
    taskDot.style.top = `${y}%`;

    const taskLabel = document.createElement('span');
    taskLabel.textContent = taskNumber; // Set task number directly from the text
    taskLabel.dataset.description = parsedTask.description;

    taskDot.appendChild(taskLabel);

    // Set color based on position
    taskDot.style.backgroundColor = calculateColor(x, y);

    // Add the dot to the matrix
    document.getElementById('matrix').appendChild(taskDot);

    // Mark as complete if needed
    if (isComplete) {
        taskDot.style.opacity = 1.0; // Ensure it remains fully visible
    }

    // Enable dragging
    taskDot.addEventListener('dragstart', dragStart);
    taskDot.addEventListener('dragend', dragEnd);

    // Open task details on click
    taskDot.addEventListener('click', function() {
        openTaskModal(taskDot);
    });
}

// Drag Start Function
function dragStart(event) {
    event.target.classList.add('dragging');
    event.dataTransfer.setData('text/plain', event.target.id);
}

// Drag End Function
function dragEnd(event) {
    event.target.classList.remove('dragging');

    const taskDot = event.target;
    const matrix = document.getElementById('matrix');

    const rect = matrix.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const percentageX = (x / matrix.offsetWidth) * 100;
    const percentageY = (y / matrix.offsetHeight) * 100;

    taskDot.style.left = `${percentageX}%`;
    taskDot.style.top = `${percentageY}%`;

    // Update color based on new position
    taskDot.style.backgroundColor = calculateColor(percentageX, percentageY);
    saveMatrixState(); // Save the matrix state after dragging
}

// Drag-and-Drop Setup
document.getElementById('matrix').addEventListener('dragover', function(event) {
    event.preventDefault();
});

document.getElementById('matrix').addEventListener('drop', function(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text');
    const taskDot = document.getElementById(id);
    document.getElementById('matrix').appendChild(taskDot);
});

// Task Modal Functions
function openTaskModal(taskDot) {
    selectedTask = taskDot;
    const modal = document.getElementById('task-modal');
    const details = document.getElementById('task-details');
    const description = document.getElementById('task-description');

    const taskNumber = taskDot.querySelector('span').textContent;
    const taskDesc = taskDot.querySelector('span').dataset.description;

    details.textContent = `Task Number: ${taskNumber}`;
    description.innerHTML = `Description: ${taskDesc}`; // Show the description in the modal

    modal.style.display = 'block';
}

function closeTaskModal() {
    document.getElementById('task-modal').style.display = 'none';
}

document.querySelector('.close-btn').addEventListener('click', closeTaskModal);

document.getElementById('delete-task').addEventListener('click', function() {
    selectedTask.remove();
    closeTaskModal();
    saveMatrixState();
});

document.getElementById('mark-complete').addEventListener('click', function() {
    selectedTask.style.opacity = 1.0; // Ensure tasks don't become dim
    closeTaskModal();
    saveMatrixState();
});

// Dark Mode Toggle
document.getElementById('toggle-theme').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    document.getElementById('matrix').classList.toggle('dark-mode');
    document.querySelectorAll('.horizontal-line, .vertical-line').forEach(line => {
        line.classList.toggle('dark-mode');
    });
    document.querySelectorAll('.quadrant-label').forEach(label => {
        label.classList.toggle('dark-mode');
    });
    document.querySelector('.modal-content').classList.toggle('dark-mode');
    document.querySelectorAll('#mark-complete, #delete-task').forEach(button => {
        button.classList.toggle('dark-mode');
    });
    saveMatrixState(); // Save the theme state
});

// Search Functionality
document.getElementById('task-search').addEventListener('input', function(event) {
    const searchQuery = event.target.value.toLowerCase();
    document.querySelectorAll('.task-dot').forEach(task => {
        const taskNumber = task.querySelector('span').textContent.toLowerCase();
        if (taskNumber.includes(searchQuery)) {
            task.style.display = '';
        } else {
            task.style.display = 'none';
        }
    });
});

// Save Matrix State
function saveMatrixState() {
    const tasks = [];
    document.querySelectorAll('.task-dot').forEach(taskDot => {
        const task = {
            id: taskDot.id,
            left: parseFloat(taskDot.style.left),
            top: parseFloat(taskDot.style.top),
            text: taskDot.querySelector('span').textContent,
            description: taskDot.querySelector('span').dataset.description || "",
            isComplete: taskDot.style.opacity == 1.0
        };
        tasks.push(task);
    });
    localStorage.setItem('matrixTasks', JSON.stringify(tasks));
    localStorage.setItem('isDarkMode', document.body.classList.contains('dark-mode'));
}

// Load Matrix State
function loadMatrixState() {
    const tasks = JSON.parse(localStorage.getItem('matrixTasks')) || [];
    tasks.forEach(task => {
        createTaskDot({
            number: task.text,
            description: task.description
        }, task.text, task.left, task.top, task.isComplete);
    });

    const isDarkMode = JSON.parse(localStorage.getItem('isDarkMode'));
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('matrix').classList.add('dark-mode');
        document.querySelectorAll('.horizontal-line, .vertical-line').forEach(line => {
            line.classList.add('dark-mode');
        });
        document.querySelectorAll('.quadrant-label').forEach(label => {
            label.classList.add('dark-mode');
        });
        document.querySelector('.modal-content').classList.add('dark-mode');
        document.querySelectorAll('#mark-complete, #delete-task').forEach(button => {
            button.classList.add('dark-mode');
        });
    }
}

// Hide/Show Group of Numbers
function hideShowGroup() {
    const start = parseInt(document.getElementById('hide-task-start').value);
    const end = parseInt(document.getElementById('hide-task-end').value);
    if (!isNaN(start) && !isNaN(end)) {
        document.querySelectorAll('.task-dot').forEach(taskDot => {
            const taskNumber = parseInt(taskDot.querySelector('span').textContent);
            if (taskNumber >= start && taskNumber <= end) {
                taskDot.style.display = taskDot.style.display === 'none' ? '' : 'none';
            }
        });
    }
}

// Clear Board
function clearBoard() {
    document.querySelectorAll('.task-dot').forEach(taskDot => taskDot.remove());
    saveMatrixState(); // Clear the saved state as well
}

document.getElementById('save-matrix').addEventListener('click', saveMatrixState);
document.getElementById('clear-board').addEventListener('click', clearBoard);


// Function to give the next task based on priority
function giveNewTask() {
    const tasks = document.querySelectorAll('.task-dot');
    let highestPriorityTask = null;
    let highestPriorityValue = -1;

    tasks.forEach(task => {
        const left = parseFloat(task.style.left);
        const top = parseFloat(task.style.top);

        // Calculate priority (higher priority for top-left quadrant)
        let priorityValue = (100 - left) + (100 - top);

        if (task.style.opacity == 1.0) {
            // Skip completed tasks
            return;
        }

        if (priorityValue > highestPriorityValue) {
            highestPriorityValue = priorityValue;
            highestPriorityTask = task;
        }
    });

    if (highestPriorityTask) {
        openTaskModal(highestPriorityTask);
    } else {
        alert("No more tasks available!");
    }
}

// Event listener for "Give New Task" button
document.getElementById('give-task').addEventListener('click', giveNewTask);


// Load the saved matrix state on page load
window.onload = loadMatrixState;


