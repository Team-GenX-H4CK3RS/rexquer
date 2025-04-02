from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
# Enable CORS for all routes and all origins
CORS(app)

# Base URL for the Fleet Management API
BASE_URL = "https://fleetbots-production.up.railway.app"


@app.route('/api/session/start', methods=['POST'])
def start_session():
    """Creates a new session with an isolated fleet."""
    response = requests.post(f"{BASE_URL}/api/session/start")
    return jsonify(response.json())


@app.route('/api/fleet/status', methods=['GET'])
def get_fleet_status():
    """Returns the fleet status for a specific session."""
    session_id = request.args.get('session_id')
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    response = requests.get(
        f"{BASE_URL}/api/fleet/status", params={"session_id": session_id})
    return jsonify(response.json())


@app.route('/api/rover/<rover_id>/status', methods=['GET'])
def get_rover_status(rover_id):
    """Returns status of a specific rover (per session)."""
    session_id = request.args.get('session_id')
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    response = requests.get(
        f"{BASE_URL}/api/rover/{rover_id}/status",
        params={"session_id": session_id}
    )
    return jsonify(response.json())


@app.route('/api/rover/<rover_id>/task', methods=['POST'])
def assign_task(rover_id):
    """Assigns a task to a rover (per session)."""
    session_id = request.args.get('session_id')
    task = request.args.get('task')

    if not session_id:
        return jsonify({"error": "session_id is required"}), 400
    if not task:
        return jsonify({"error": "task is required"}), 400

    response = requests.post(
        f"{BASE_URL}/api/rover/{rover_id}/task",
        params={"session_id": session_id, "task": task}
    )
    return jsonify(response.json())


@app.route('/api/rover/<rover_id>/battery', methods=['GET'])
def get_battery_level(rover_id):
    """Returns battery level of a specific rover (per session)."""
    session_id = request.args.get('session_id')
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    response = requests.get(
        f"{BASE_URL}/api/rover/{rover_id}/battery",
        params={"session_id": session_id}
    )
    return jsonify(response.json())


@app.route('/api/rover/<rover_id>/sensor-data', methods=['GET'])
def get_sensor_data(rover_id):
    """Fetch sensor data from a specific rover (per session)."""
    session_id = request.args.get('session_id')
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    response = requests.get(
        f"{BASE_URL}/api/rover/{rover_id}/sensor-data",
        params={"session_id": session_id}
    )
    return jsonify(response.json())


@app.route('/api/rover/<rover_id>/coordinates', methods=['GET'])
def get_rover_coordinates(rover_id):
    """Returns the current coordinates of the rover."""
    session_id = request.args.get('session_id')
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    response = requests.get(
        f"{BASE_URL}/api/rover/{rover_id}/coordinates",
        params={"session_id": session_id}
    )
    return jsonify(response.json())


@app.route('/rover/<rover_id>/pos', methods=['GET'])
def rover_get_pos(rover_id):
    pos = request.args.get('pos')
    if not pos:
        return jsonify({"error": "session_id is required"}), 400
    return jsonify(pos)


rover_moves = {'rover-1': "stop",
               'rover-2': "stop", 'rover-3': "stop", 'rover-5': "stop", 'rover-5': "stop"}


@app.route('/api/rover/<rover_id>/move', methods=['POST'])
def move_rover(rover_id):
    global rover_moves
    """Moves the rover in a given direction (per session) and updates coordinates incrementally."""
    session_id = request.args.get('session_id')
    direction = request.args.get('direction')

    if not session_id:
        return jsonify({"error": "session_id is required"}), 400
    if not direction:
        return jsonify({"error": "direction is required"}), 400

    response = requests.post(
        f"{BASE_URL}/api/rover/{rover_id}/move",
        params={"session_id": session_id, "direction": direction}
    )
    rover_moves[rover_id.lower()] = direction
    data = response.json()
    return jsonify(data)


@app.route('/api/rover/<rover_id>/reset', methods=['POST'])
def reset_rover(rover_id):
    global rover_moves
    """Resets the rover to idle state (per session)."""
    session_id = request.args.get('session_id')
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    response = requests.post(
        f"{BASE_URL}/api/rover/{rover_id}/reset",
        params={"session_id": session_id}
    )
    rover_moves[rover_id.lower()] = "stop"
    print(rover_id, rover_moves[rover_id.lower()])
    return jsonify(response.json())


@app.route('/rover/<rover_id>/move', methods=['GET'])
def rover_get_move(rover_id):
    global rover_moves
    if not rover_id:
        return jsonify({"error": "session_id is required"}), 400
    return jsonify({'move':  rover_moves[f'rover-{rover_id}']})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
