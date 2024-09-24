require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const PORT = process.env.PORT || 3001

// MongoDB connection
const url = process.env.MONGODB_URI

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

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then((addedPerson) => {
    response.status(201).json(addedPerson)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  console.log(request.params.id)
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => response.status(500).json({ error: 'Error while deleting' }))
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

// app.get('/info', (request, response) => {
//   const requestTime = new Date()
//   response.send(`
//     <p>Phonebook has info for ${data.length} people</p>
//     <br/>
//     <p>${requestTime}</p>
//     `)
// })

// app.get('/api/persons/:id', (request, response) => {
//   const id = request.params.id
//   const person = data.find((person) => person.id === id)
//   if (person) {
//     response.status(200).json(person)
//   } else {
//     response.status(404).end()
//   }
// })

// app.delete('/api/persons/:id', (request, response) => {
//   const id = request.params.id
//   const personToDelete = data.find((person) => person.id === id)
//   if (personToDelete) {
//     data = data.filter((person) => person.id !== id)
//     response.status(204).end()
//   } else {
//     response.status(404).end()
//   }
// })

// app.post('/api/persons', (request, response) => {
//   const personData = request.body

//   if (!personData.name || !personData.number) {
//     return response.status(400).json({ error: 'Name and number fields are required' })
//   }

//   const duplicate = data.find((person) => person.name === personData.name || person.number === personData.number)

//   if (duplicate) {
//     if (duplicate.name === personData.name) {
//       return response.status(400).json({ error: 'Person with this name already exists' })
//     }
//     if (duplicate.number === personData.number) {
//       return response.status(400).json({ error: 'Person with this number already exists' })
//     }
//   }

//   const id = generateId()
//   const newPerson = { id, ...personData }

//   data = [newPerson, ...data]
//   response.json(newPerson)
// })
