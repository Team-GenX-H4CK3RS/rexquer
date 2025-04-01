
import React from 'react';

interface TaskQueueDisplayProps {
  tasks: string[];
}

const TaskQueueDisplay: React.FC<TaskQueueDisplayProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-3">Task Queue</h3>
        <div className="text-center text-muted-foreground py-4 bg-muted/20 rounded-md">
          No tasks in queue
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Task Queue ({tasks.length})</h3>
      <div className="border rounded-md overflow-hidden">
        {tasks.map((task, index) => (
          <div 
            key={index}
            className={`p-3 ${index % 2 === 0 ? 'bg-muted/20' : ''} ${
              index < tasks.length - 1 ? 'border-b' : ''
            }`}
          >
            <div className="flex gap-3 items-center">
              <div className="w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium">
                {index + 1}
              </div>
              <div>{task}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskQueueDisplay;
