import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from "hono/jwt";
import { createBlogSchema, updateBlogSchema } from "@mahesh7979/blog-common";
const blog = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_TOKEN: string
    },
    Variables: {
        userId: string
    }
}>();

blog.use('/*', async (c, next) => {
    const jwt = c.req.header('Authorization') || "";

    if (!jwt) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    try {
        const payload = await verify(jwt, c.env.JWT_TOKEN);
        if (!payload) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        c.set('userId', payload.id);
        await next();
    } catch (Error) {
        return c.json({
            Error
        })
    }

});

blog.post('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = c.get('userId');
    const body = await c.req.json();
    const success =  createBlogSchema.safeParse(body);
        if(!success.success){
            return c.json({
                msg : "Seems like you just gave some gibbrish, kindly provide us some valid inputs."
            })
        }
    try {
        const post = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: userId
            }
        })
        if (post) {
            return c.json({
                postId: post.id
            })
        }
        else {
            return c.json({
                error: "Unable to create this blog"
            })
        }
    } catch (Error) {
        return c.json({
            Error

        })
    }
});

blog.put('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = c.get('userId');
    const body = await c.req.json();
    const success =  updateBlogSchema.safeParse(body);
        if(!success.success){
            return c.json({
                msg : "Seems like you just gave some gibbrish, kindly provide us some valid inputs."
            })
        }
    try {
        const post = await prisma.post.update({
            where: {
                id: body.postId,
                authorId : userId
            },
            data: {
                title: body.title,
                content: body.content
            }
        })
        if (post) {
            return c.json({
                msg: "Blog successfully updated"
            })
        } else {
            return c.json({
                msg: "Unable to update blog"
            })
        }
    } catch (Error) {
        return c.json({
            Error
        })
    }

});

blog.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    try {
      const posts = await prisma.post.findMany();
  
      if (posts) {
        return c.json({
          posts,
        });
      } else {
        return c.json({
          msg: "No posts found",
        });
      }
    } catch (Error) {
      return c.json({
        Error
      });
    }
  });

blog.get('/s/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const postId =  c.req.param('id')
    try{
    const post = await prisma.post.findUnique({
        where: {
            id : postId
        }
    })
    if(post){
        return c.json({
            post
        })
    }
    else{
        return c.json({
           post
        })
    }
}catch(Error){
    return c.json({
        Error
    })
}
});



export default blog;
