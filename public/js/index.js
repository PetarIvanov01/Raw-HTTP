document.addEventListener("DOMContentLoaded", () => {
    setSubmitTodoListener();
    openTodoForm()
});


function openTodoForm() {
    const addBtn = document.querySelector(".add-new-card");
    const form = document.querySelector("#todo-form");

    addBtn.addEventListener("click", () => {
        const isHidden = form.classList.contains("hidden");

        if (isHidden) {
            addBtn.children[0].textContent = "- Close Form"
            form.classList.remove("hidden");
            form.querySelector('input[name="title"]').focus();
            return;
        }

        addBtn.children[0].textContent = "+ Add New"
        form.classList.add("hidden");

    });
}

function setSubmitTodoListener() {
    const form = document.querySelector("#todo-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const urlencoded = new URLSearchParams(Object.fromEntries(formData)).toString()

        const response = await fetch("http://localhost:4221/todo", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: urlencoded
        })

        if (response.ok) {
            // Handle success
            console.log("Todo successfully added");
            e.target.reset();
        } else {
            // Handle failure
            console.error("Failed to add todo");
        }
    })
}