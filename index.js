class Component {
    constructor() {
        this.state = {};
        this._domNode = null; // Добавим переменную для хранения DOM-узла
    }

    getDomNode() {
        this._domNode = this.render();
        return this._domNode;
    }

    update() {
        const newDomNode = this.render();
        if (this._domNode !== null && this._domNode.parentNode !== null)
            this._domNode.parentNode.replaceChild(newDomNode, this._domNode);
        this._domNode = newDomNode;
    }

    render() {
        // Базовая реализация render, которую нужно будет переопределить в дочерних классах
        return document.createElement("div");
    }
}

function createElement(tag, attributes, children, callbacks) {
    const element = document.createElement(tag);

    if (attributes) {
        Object.keys(attributes).forEach((key) => {
            if (key.startsWith('on') && typeof attributes[key] === 'function') {
                const eventName = key.substring(2).toLowerCase(); // Удаляем "on" и приводим к нижнему регистру
                element.addEventListener(eventName, attributes[key]);
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
    }

    if (Array.isArray(children)) {
        children.forEach((child) => {
            if (typeof child === "string") {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    } else if (typeof children === "string") {
        element.appendChild(document.createTextNode(children));
    } else if (children instanceof HTMLElement) {
        element.appendChild(children);
    }

    return element;
}

class AddTask extends Component {
    constructor(onAddTask) {
        super();
        this.onAddTask = onAddTask;
        this.state = {
            inputText: ""
        };
    }

    onInputChange(text) {
        this.state = {...this.state, inputText: text};
    }

    render() {
        return createElement("div", {class: "add-todo"}, [
            createElement("input", {
                id: "new-todo",
                type: "text",
                placeholder: "Задание",
                onchange: (e) => this.onInputChange(e.target.value),
            }),
            createElement("button", {
                id: "add-btn",
                onclick: () => this.onAddTask(this.state.inputText),
            }, "+"),
        ]);
    }
}

class Task extends Component {
    constructor(taskText, onDeleteTask) {
        super();
        this.taskText = taskText;
        this.buttonColor = 'green';
        this.btn = null;
        this.lastClickTime = 0;
        this.onDeleteTask = onDeleteTask;
        this.onDeleteTaskHandler = this.onDeleteTaskHandler.bind(this);
        this.state = {
            firstClick: false
        };
    }

    onDeleteTaskHandler() {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - this.lastClickTime;

        if (elapsedTime < 1000 && this.state.firstClick === true) {
            this.onDeleteTask();
            this.resetState();
        } else {
            this.state = {...this.state, firstClick: true};
            this.buttonColor = 'red';
            setTimeout(() => {
                this.resetState();
            }, 1000);
        }

        this.lastClickTime = currentTime;
        if (this.buttonColor === 'red') {
            this.btn.style.backgroundColor = this.buttonColor;
        } else {
            this.btn.style.backgroundColor = this.buttonColor;
            this.update();
        }
    }


    resetState() {
        this.buttonColor = 'green';
        this.state = {...this.state, firstClick: false};
        this.btn.style.backgroundColor = this.buttonColor;
    }

    render() {
        const checkbox = createElement("input", {type: "checkbox"});
        checkbox.addEventListener('change', () => {
            const label = checkbox.nextElementSibling;
            if (checkbox.checked) {
                label.classList.add('completed');
            } else {
                label.classList.remove('completed');
            }
        });

        let btn = createElement("button", {
            onclick: this.onDeleteTaskHandler,
        }, "🗑");
        btn.style.backgroundColor = 'green';

        this.btn = btn;

        return createElement('li', {}, [
            checkbox,
            createElement("label", {}, this.taskText),
            btn,
        ]);
    }
}


class TodoList extends Component {
    constructor() {
        super();
        this.localStorageKey = "todoListTasks";
        const savedTasks = localStorage.getItem(this.localStorageKey);
        this.state = {
            task: savedTasks ? JSON.parse(savedTasks) : ["Сделать домашку", "Сделать практику", "Пойти домой"],
        };
    }

    onAddTask = (newTask) => {
        const updatedTaskList = [...this.state.task, newTask];
        this.saveTasks(updatedTaskList);
        this.state = {...this.state, task: updatedTaskList};
        this.update();
    }

    onDeleteTask = (index) => {
        const updatedTaskList = [...this.state.task];
        updatedTaskList.splice(index, 1);
        this.saveTasks(updatedTaskList);
        this.state = {...this.state, task: updatedTaskList};
        this.update();
    }

    saveTasks(tasks) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(tasks));
    }

    render() {
        return createElement("div", {class: "todo-list"}, [
            createElement("h1", {}, "TODO List"),
            createElement("div", {}, new AddTask(this.onAddTask).render()),
            createElement("ul", {id: "todos"}, this.state.task.map((elem, index) => {
                return createElement("div", {}, new Task(elem, () => this.onDeleteTask(index)).render());
            })),
        ]);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(new TodoList().getDomNode());
});
