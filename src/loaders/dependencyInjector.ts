import { Container } from 'typedi'
import LoggerInstance from './logger'
import config from '../config'

export default ({ services }: { services: { name: string; service: any }[] }) => {
  try {
    Container.set('logger', LoggerInstance)
  } catch (e) {
    LoggerInstance.error('🔥 Error on dependency injector loader: %o', e)
    throw e
  }
}
