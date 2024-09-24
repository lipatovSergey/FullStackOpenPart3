require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const PORT = process.env.PORT || 3001

const url = process.env.MONGODB_URI

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    response.status(400).json({ error: error.message })
  }

  next(error)
}

mongoose
  .connect(url)
  .then(() => {
    console.log('connected to mongoDb')
  })
  .catch((error) => console.log('error connecting to MongoDB'))

morgan.token('body', (request) => {
  return request.method === 'POST' ? JSON.stringify(request.body) : ''
})

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('dist'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'content missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((addedPerson) => {
      response.status(201).json(addedPerson)
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then((result) => {
      if (result) {
        response.status(204).end()
      } else {
        response.status(404).json({ error: 'Person not found' })
      }
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body
  if (!body) {
    return response.status(400).json({ error: 'content missing' })
  }

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' })
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then((person) => {
      console.log(person)
      if (person) {
        response.status(200).send(person)
      } else {
        response.status(404).json({ error: 'Person not found' })
      }
    })
    .catch((error) => next(error))
})

app.get('/info', (request, response, next) => {
  const requestTime = new Date()

  Person.countDocuments({})
    .then((count) =>
      response.send(`
    <p>Phonebook has info for ${count} people</p>
    <br/>
    <p>${requestTime}</p>
    `)
    )
    .catch((error) => next(error))
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
