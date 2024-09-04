import { createTodo } from "../service/todoService.js";

export function openTodoForm() {
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

export function setSubmitTodoListener() {
    const form = document.getElementById("todo-form");
    const formContainer = document.getElementById("todo-form-container");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const fields = Object.fromEntries(formData);

        if (!fields.title || !fields.description) {
            console.log("Empty fields");
            return;
        }

        try {
            await createTodo(fields);
            console.log("Todo successfully added");
            formContainer.classList.add("hidden");
            e.target.reset();
        } catch (error) {
            console.error("Failed to add todo");
        }
    });
}
