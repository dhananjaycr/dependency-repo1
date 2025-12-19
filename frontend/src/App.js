import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState({
    task: '',
    goal: '',
    breakHours: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/todos`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.task.trim()) {
      alert('Please enter a task!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTodos([...todos, newTodo]);
        setFormData({ task: '', goal: '', breakHours: '' });
      } else {
        alert('Failed to create todo');
      }
    } catch (error) {
      console.error('Error creating todo:', error);
      alert('Error creating todo. Make sure the backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const response = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map(t => t.id === todo.id ? updatedTodo : t));
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Todo Application</h1>
        
        <div className="main-content">
          {/* Left Side - Form */}
          <div className="form-section">
            <h2>Hi, what is your to-do task today?</h2>
            <form onSubmit={handleSubmit} className="todo-form">
              <div className="form-group">
                <label htmlFor="task">Task *</label>
                <input
                  type="text"
                  id="task"
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  placeholder="Enter your task..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="goal">What is your goal?</label>
                <input
                  type="text"
                  id="goal"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  placeholder="Enter your goal..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="breakHours">Break Hours</label>
                <input
                  type="text"
                  id="breakHours"
                  value={formData.breakHours}
                  onChange={(e) => setFormData({ ...formData, breakHours: e.target.value })}
                  placeholder="e.g., 2 hours, 30 minutes"
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Adding...' : 'Add Todo'}
              </button>
            </form>
          </div>

          {/* Right Side - Todo List */}
          <div className="todos-section">
            <h2>Your Todos</h2>
            {todos.length === 0 ? (
              <div className="empty-state">
                <p>No todos yet. Add one to get started!</p>
              </div>
            ) : (
              <div className="todos-list">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`todo-item ${todo.completed ? 'completed' : ''}`}
                  >
                    <div className="todo-content">
                      <h3>{todo.task}</h3>
                      {todo.goal && <p className="todo-goal">Goal: {todo.goal}</p>}
                      {todo.breakHours && (
                        <p className="todo-break">Break Hours: {todo.breakHours}</p>
                      )}
                      <p className="todo-date">
                        Created: {new Date(todo.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="todo-actions">
                      <button
                        onClick={() => handleToggleComplete(todo)}
                        className={`toggle-btn ${todo.completed ? 'completed' : ''}`}
                      >
                        {todo.completed ? '✓ Done' : 'Mark Done'}
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

