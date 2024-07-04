import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useState } from "react"
import { Button } from "./button";

export function ModeToggle() {
  const [toggle, setToggle] = useState(false);
  const { setTheme } = useTheme();

  return (
    <div className="flex gap-2 ">
      <Button className="transition-all active:transform active:scale-[0.9]" onClick={()=>{
        setToggle(!toggle);
        setTheme(toggle?"light":"dark");
      }}>
        { toggle ? (
          <Sun className="h-[1.9rem] w-[1.5rem]  " />
        ):(
          <Moon className="h-[1.9rem] w-[1.5rem] " />
        )
        }
      </Button>
    </div>
  )
}
