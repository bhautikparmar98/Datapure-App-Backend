import express from 'express'
import loader from './loaders'

export const app = express()
loader({ expressApp: app })
