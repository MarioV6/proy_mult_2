import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("http://localhost:3000/api/test")
      .then(res => res.json())
      .then(data => console.log(data));
  }, []);

  return <h1>Pruebita 1</h1>;
}

export default App;