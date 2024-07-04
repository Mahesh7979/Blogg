
import { useState } from "react";
import { Button } from "../src/components/ui/button";
import './App.css'
import { ModeToggle } from "./components/ui/mode-toggle";

function App() {
  const [count , setCount] = useState(true);
  return (
    <div className='flex justify-between m-3'>
    <Button className="transition-all active:transform active:scale-[0.9]" 
       onClick={
         ()=>{
           setCount(!count);
          }
        }> click me ! {count}</Button>
    
        <ModeToggle/>

    </div>
  );
}

export default App
