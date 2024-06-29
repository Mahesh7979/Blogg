import { Hono } from "hono";
import user from "./user";
import blog from "./blog";

const router = new Hono()

router.route('/user',user)
router.route('/blog',blog)


export default router