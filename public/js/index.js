document.addEventListener("DOMContentLoaded", async () => {
    await loadTodos()
    setSubmitTodoListener();
    openTodoForm()
});

function openTodoForm() {

    const newTaskBtn = document.getElementById("new-task");
    const formContainer = document.getElementById("todo-form-container");
    const closeFormBtn = document.getElementById("close-form");

    newTaskBtn.addEventListener("click", () => {
        formContainer.classList.remove("hidden");
    });

    closeFormBtn.addEventListener("click", () => {
        formContainer.classList.add("hidden");
    });

    formContainer.addEventListener("click", (event) => {
        if (event.target === formContainer) {
            formContainer.classList.add("hidden");
        }
    });
}

function setSubmitTodoListener() {
    const form = document.getElementById("todo-form");
    const formContainer = document.getElementById("todo-form-container");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const fields = Object.fromEntries(formData);
        console.log(fields);

        if (!fields.title || !fields.description) {
            console.log("Empty fields");
            return;
        }

        const response = await fetch("http://localhost:4221/todo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(fields)
        })

        if (response.ok) {
            // Handle success
            console.log("Todo successfully added");

            // Apply the todo on the screen

            formContainer.classList.add("hidden");
            e.target.reset();
        } else {
            // Handle failure
            console.error("Failed to add todo");
        }
    })
}

async function loadTodos() {
    const toStartSection = document.getElementById("to-start")
    const inProgressSection = document.getElementById("in-progress")
    const completedSection = document.getElementById("completed")

    const response = await fetch("http://localhost:4221/todo");

    if (!response.ok) {
        console.log("Failed to fetch todos");
        // Handle error
        return
    }
    const todos = await response.json();

    for (const todo of todos) {

        const child = createElements('div', { class: 'task-card' }, createElements('h4', {}, `${todo.title}`), createElements('p', {}, `${todo.description}`), createElements('div', { class: 'task-date' }, `${todo.createdAt}`))

        if (todo.stage === "start") {
            toStartSection.appendChild(child)
        } else if (todo.stage === "in progress") {
            inProgressSection.appendChild(child)
        } else {
            completedSection.appendChild(child)
        }
    }
}

function createElements(type, atrib, ...content) {

    const element = document.createElement(type);

    if (Object.keys(atrib).length !== 0) {
        for (let prop in atrib) {
            element.classList.add(atrib[prop]);
        }
    }

    for (let el of content) {
        if (typeof el == 'string' || typeof el == 'number') {
            el = document.createTextNode(el)
        }
        element.appendChild(el)
    }
    return element;

}
