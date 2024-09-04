import { html, render } from "../packs.js"
import { getTodos } from "../service/todoService.js";

export async function loadTodos() {
    try {
        const todos = await getTodos();
        renderTodos(todos);

    } catch (error) {
        console.log("Failed to fetch todos:", error);
        return;
    }
}

function renderTodos(todos) {
    const toStartSection = document.getElementById("to-start");
    const inProgressSection = document.getElementById("in-progress");
    const completedSection = document.getElementById("completed");

    const todosToStart = []
    const todosInProgress = []
    const todosCompleted = []

    for (const todo of todos) {
        if (todo.stage === "start") {
            todosToStart.push(todo)
        } else if (todo.stage === "in progress") {
            todosInProgress.push(todo)
        } else {
            todosCompleted.push(todo)
        }
    }

    render(html`${todosToStart.map(todo => template(todo))}`, toStartSection);
    render(html`${todosInProgress.map(todo => template(todo))}`, inProgressSection);
    render(html`${todosCompleted.map(todo => template(todo))}`, completedSection);
}

const template = (todo) => {
    return html`
        <div class="task-card">
            <h4>${todo.title}</h4>
            <p>${todo.description}</p>
            <div class="task-date">${todo.createdAt}</div>
        </div>
        `}