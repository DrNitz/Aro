import { onRequest as __api___catchall___js_onRequest } from "C:\\Aro\\functions\\api\\[[catchall]].js"

export const routes = [
    {
      routePath: "/api/:catchall*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___catchall___js_onRequest],
    },
  ]