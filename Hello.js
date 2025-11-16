// write node Hello.js in terminal to print console.log("Life is good!");
export default function Hello(app) { // function accepts app reference to express module routes here.
  const sayHello = (req, res) => {
    res.send("Life is good!");
  };
  const sayWelcome = (req, res) => {
    res.send("Welcome to Full Stack Development!");
  };
  app.get("/hello", sayHello);
  app.get("/", sayWelcome);
}
