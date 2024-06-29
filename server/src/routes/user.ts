import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { signinSchema, signupSchema } from "@mahesh7979/blog-common";

const user = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_TOKEN : string
    }
}>()
user.post('/k' ,async (c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json()
try{
    const user = await prisma.user.findUnique({
        where:{
            email : body.email
        },
        select:{
            password: true
        }
    })
    return c.json({
        password: user?.password
    })
}catch(Error){
    return c.json({
        Error
    })
}
})
user.post('/signup', async (c)=>{
   
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    
        const body = await c.req.json();
        const success =  signupSchema.safeParse(body);
        if(!success.success){
            return c.json({
                msg : "Seems like you just gave some gibbrish, kindly provide us some valid inputs."
            })
        }
       
        try{
        const user = await prisma.user.findUnique({
            where: {
                email : body.email
            }
        })
        if(!user){
       
        const myText = new TextEncoder().encode(body.password);
    
        const myDigest = await crypto.subtle.digest(
            {
                name: 'SHA-256',
            },
            myText
        );
        const hexString = [...new Uint8Array(myDigest)]
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
        console.log(new Uint8Array(myDigest));
        
       const createuser =  await prisma.user.create({
            data:{
                email: body.email,
                password: hexString
            }
        })
        const token = await sign({
            id: createuser.id
        }, c.env.JWT_TOKEN)

        return c.json({
            msg : "User successfully created",
            token : token
        })
    
        }
        else{
          return c.json({
                msg : "User already exists"
            })
        }
    }catch(Error){
        return c.json({
            Error
        })
    }

})

user.post('/signin', async (c)=>{

    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate())

    const body = await c.req.json();
    const success =  signinSchema.safeParse(body);
        if(!success.success){
            return c.json({
                msg : "Seems like you just gave some gibbrish, kindly provide us some valid inputs."
            })
        }
    try{
    const user = await prisma.user.findUnique({
        where: {
            email : body.email
        }
    })
    if(user){
    const myText = new TextEncoder().encode(body.password);

    const myDigest = await crypto.subtle.digest(
        {
            name: 'SHA-256',
        },
        myText
    );
    const hexString = [...new Uint8Array(myDigest)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    console.log(new Uint8Array(myDigest));
    
   const validuser = await prisma.user.findUnique({
        where :{
            email: body.email,
            password: hexString
        }
    })
    if(validuser){
        const token = await sign({id : validuser.id}, c.env.JWT_TOKEN)
    return c.json({
        msg : "User successfully loggedin.",
        token : token
    })}
    else{
        return c.json({
            msg : "Invalid email/password."
        })
    }

    }
    else{
      return c.json({
            msg : "User not found"
        })
    }

    }catch(Error){
        return c.json({
            Error
        })
    }
})



export default user