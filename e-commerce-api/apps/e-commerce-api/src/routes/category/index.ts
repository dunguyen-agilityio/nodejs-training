import { FastifyPluginCallback } from 'fastify'

export const categoryRoutes: FastifyPluginCallback = (instance, _, done) => {
  const { categoryController } = instance.container.controllers
  instance.get('/', categoryController.getAll)
  done()
}
