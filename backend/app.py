from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# In-memory storage (you can replace this with a database later)
todos = []

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """Get all todos"""
    return jsonify(todos), 200

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """Create a new todo"""
    data = request.json
    
    if not data or not data.get('task'):
        return jsonify({'error': 'Task is required'}), 400
    
    todo = {
        'id': str(uuid.uuid4()),
        'task': data.get('task', ''),
        'goal': data.get('goal', ''),
        'breakHours': data.get('breakHours', ''),
        'createdAt': datetime.now().isoformat(),
        'completed': False
    }
    
    todos.append(todo)
    return jsonify(todo), 201

@app.route('/api/todos/<todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Update a todo (mark as complete/incomplete)"""
    todo = next((t for t in todos if t['id'] == todo_id), None)
    
    if not todo:
        return jsonify({'error': 'Todo not found'}), 404
    
    data = request.json
    if 'completed' in data:
        todo['completed'] = data['completed']
    if 'task' in data:
        todo['task'] = data['task']
    if 'goal' in data:
        todo['goal'] = data['goal']
    if 'breakHours' in data:
        todo['breakHours'] = data['breakHours']
    
    return jsonify(todo), 200

@app.route('/api/todos/<todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Delete a todo"""
    global todos
    todos = [t for t in todos if t['id'] != todo_id]
    return jsonify({'message': 'Todo deleted'}), 200

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

