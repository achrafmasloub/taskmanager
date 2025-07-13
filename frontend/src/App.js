import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";

const STATUSES = ["ouvert", "encours", "cloture"];

const TaskCard = ({ task, moveTask }) => {
  const [, ref] = useDrag({
    type: "TASK",
    item: { ...task }
  });

  return (
    <div
      ref={ref}
      className="bg-white p-2 mb-2 rounded shadow cursor-move border"
    >
      <h4 className="font-semibold">{task.title}</h4>
      <p className="text-sm">Créé par: {task.createdBy}</p>
      <p className="text-xs text-gray-500">{task.createdAt}</p>
    </div>
  );
};

const Column = ({ status, tasks, moveTask }) => {
  const [, drop] = useDrop({
    accept: "TASK",
    drop: (item) => moveTask(item._id, status)
  });

  return (
    <div ref={drop} className="w-1/3 p-4 bg-gray-100 rounded">
      <h3 className="text-lg font-bold mb-4 capitalize">{status}</h3>
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} moveTask={moveTask} />
      ))}
    </div>
  );
};

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:4000/api/tasks");
    setTasks(res.data);
  };

  const addTask = async () => {
    if (!newTitle.trim()) return;
    const newTask = {
      title: newTitle,
      createdBy: "admin"
    };
    await axios.post("http://localhost:4000/api/tasks", newTask);
    setNewTitle("");
    fetchTasks();
  };

  const moveTask = async (id, newStatus) => {
    await axios.put(`http://localhost:4000/api/tasks/${id}`, { status: newStatus });
    fetchTasks();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestionnaire de Tâches</h1>
        <div className="mb-4">
          <input
            type="text"
            className="border p-2 rounded mr-2"
            placeholder="Nouvelle tâche"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Ajouter
          </button>
        </div>
        <div className="flex gap-4">
          {STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasks.filter((t) => t.status === status)}
              moveTask={moveTask}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default App;