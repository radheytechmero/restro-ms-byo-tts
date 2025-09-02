// import { PrismaClient } from '@prisma/client/edge'
import { PrismaClient } from '@prisma/client'
// import { PrismaClient } from '../../prisma/client'
// import { withAccelerate } from '@prisma/extension-accelerate'
import { MiddlewareHandler } from 'hono';
import type { Context } from "hono";

export type Env = {
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
  Variables: {
    // userId: string
    prisma: PrismaClient
    authenticatedRestaurantId: number
  }
};

export type AppContext = Context<Env>;


export const getPrisma: MiddlewareHandler = async (c, next) => {
  // const prisma = new PrismaClient()
  const dbURL = process.env.DATABASE_URL;
  if (!dbURL) {
    console.error("DATABASE_URL is not set in the environment.");
    return c.json({ error: "Server misconfiguration" }, 500);
  }
  const prisma = new PrismaClient({
    datasourceUrl: dbURL,
  })
  // .$extends(withAccelerate())
  c.set('prisma', prisma)

  try {
    await next()
  } finally {
    await prisma.$disconnect()
  }
}