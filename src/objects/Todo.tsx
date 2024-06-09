// Todo.tsx

export interface ToDoItem {
    id: string;
    title: string;
    description: string;
    date: string;
    hasReminder: boolean;
    selectedTime: Date | null;
  }
  
  class ToDo implements ToDoItem {
    id: string;
    title: string;
    description: string;
    date: string;
    hasReminder: boolean;
    selectedTime: Date | null;
  
    constructor(id: string, title: string, description: string, date: string, hasReminder: boolean, selectedTime: Date | null) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.date = date;
      this.hasReminder = hasReminder;
      this.selectedTime = selectedTime;
    }
  
    static fetchToDoItem(id: string): Promise<ToDoItem> {
      return new Promise((resolve, reject) => {
    
        setTimeout(() => {
          resolve({
            id,
            title: "Sample ToDo",
            description: "This is a sample ToDo item",
            date: new Date().toISOString(),
            hasReminder: true,
            selectedTime: new Date(),
          });
        }, 1000); // Simulated delay of 1 second
      });
    }
  }
  
  export default ToDo;
  