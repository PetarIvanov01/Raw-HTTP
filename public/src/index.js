import { loadTodos } from "./components/todoSections.js"

import {
    openTodoForm,
    setSubmitTodoListener,
} from "./components/submitForm.js";

document.addEventListener("DOMContentLoaded", () => {
    loadTodos();
    setSubmitTodoListener();
    openTodoForm();
});

