import * as dao from "./dao.js";

export default function TodoRoutes(app) {
    const findAllTodos = async (req, res) => {
        const { completed } = req.query;
        if (completed !== undefined) {
            const completedBool = completed === "true";
            // Fetch all and filter in memory or db? DB is better but schema is simple.
            // For simplicity, let's fetch all and filter or use DAO.
            // But DAO findAllTodos returns all.
            // Let's keep it simple for now, maybe add filtering later if needed.
            // Actually the original worked by filtering array.
            // Let's just return all for now or implement filtering in DAO.
            // The frontend Lab 5 usually doesn't strictly depend on the query param for the main list.
            const todos = await dao.findAllTodos();
            const filtered = todos.filter((t) => t.completed === completedBool);
            res.json(filtered);
            return;
        }
        const todos = await dao.findAllTodos();
        res.json(todos);
    };

    const createTodo = async (req, res) => {
        // Frontend sends nothing or body?
        // Lab5/WorkingWithArrays: createNewTodo just created a default one.
        // Client.ts calls: axios.get(`${TODOS_API}/create`) which is GET!
        // But workingWithArrays had: app.get("/lab5/todos/create", createNewTodo);
        // So we need to match that weird API.
        const newTodo = {
            title: "New Task",
            completed: false,
        };
        const todo = await dao.createTodo(newTodo);
        // Original returned ALL todos.
        // Client.ts expects list of todos?
        // client.ts: createNewTodo -> returns response.data.
        // Component: setTodos(todos).
        // So yes, it expects the FULL LIST.
        const todos = await dao.findAllTodos();
        res.json(todos);
    };

    const postTodo = async (req, res) => {
        // Client.ts: axios.post(TODOS_API, todo)
        // WorkingWithArrays: postNewTodo -> returns newTodo (single object).
        // WAIT! WorkingWithArrays: res.json(newTodo);
        // Client.ts: postNewTodo -> setTodos([...todos, newTodo]).
        // So POST expects SINGLE object.
        const newTodo = await dao.createTodo(req.body);
        res.json(newTodo);
    };

    const deleteTodo = async (req, res) => {
        const { id } = req.params;
        await dao.deleteTodo(id);
        // WorkingWithArrays: res.json(todos) (Full list) OR res.sendStatus(200) for DELETE method.
        // Client.ts: deleteTodo -> axios.delete -> setTodos(todos.filter..).
        // Client.ts: removeTodo -> axios.get(delete) -> setTodos(updatedTodos).
        // We should support both if we want full compat?
        // client.ts has `deleteTodo` using DELETE and `removeTodo` using GET.
        // frontend component `WorkingWithArraysAsynchronously` uses `deleteTodo` (DELETE returns 200) AND `removeTodo` (GET returns List).
        // I should implement both.
        // DELETE /lab5/todos/:id -> 200
        res.sendStatus(200);
    };

    const removeTodoLegacy = async (req, res) => {
        const { id } = req.params;
        await dao.deleteTodo(id);
        const todos = await dao.findAllTodos();
        res.json(todos);
    };

    const updateTodo = async (req, res) => {
        const { id } = req.params;
        await dao.updateTodo(id, req.body);
        res.sendStatus(200);
    };

    const getTodoById = async (req, res) => {
        const { id } = req.params;
        const todo = await dao.findTodoById(id);
        res.json(todo);
    };

    const updateTitle = async (req, res) => {
        const { id, title } = req.params;
        const todo = await dao.findTodoById(id);
        if (todo) {
            todo.title = title;
            await dao.updateTodo(id, todo);
        }
        const todos = await dao.findAllTodos();
        res.json(todos);
    };

    const updateDescription = async (req, res) => {
        const { id, description } = req.params;
        const todo = await dao.findTodoById(id);
        if (todo) {
            todo.description = description;
            await dao.updateTodo(id, todo);
        }
        const todos = await dao.findAllTodos();
        res.json(todos);
    };

    const updateCompleted = async (req, res) => {
        const { id, completed } = req.params;
        const todo = await dao.findTodoById(id);
        if (todo) {
            todo.completed = completed === "true";
            await dao.updateTodo(id, todo);
        }
        const todos = await dao.findAllTodos();
        res.json(todos);
    };

    app.get("/lab5/todos", findAllTodos);
    app.post("/lab5/todos", postTodo);
    app.get("/lab5/todos/create", createTodo); // Legacy GET create
    app.get("/lab5/todos/:id", getTodoById);
    app.put("/lab5/todos/:id", updateTodo);
    app.delete("/lab5/todos/:id", deleteTodo);
    app.get("/lab5/todos/:id/delete", removeTodoLegacy); // Legacy GET delete
    app.get("/lab5/todos/:id/title/:title", updateTitle);
    app.get("/lab5/todos/:id/description/:description", updateDescription);
    app.get("/lab5/todos/:id/completed/:completed", updateCompleted);
}
