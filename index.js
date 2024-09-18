const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const PORT = process.env.PORT || 3001

let data = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  // {
  //   id: '4',
  //   name: 'Mary Poppendieck',
  //   number: '39-23-6423122',
  // },
]

morgan.token('body', (request) => {
  return request.method === 'POST' ? JSON.stringify(request.body) : ''
})

const generateId = () => {
  return Math.floor(Math.random() * Date.now()).toString() // Генерация уникального ID на основе текущего времени
}

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('dist'))

app.get('/api/persons', (request, response) => {
  response.json(data)
})

app.get('/info', (request, response) => {
  const requestTime = new Date()
  response.send(`
    <p>Phonebook has info for ${data.length} people</p>
    <br/>
    <p>${requestTime}</p>
    `)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = data.find((person) => person.id === id)
  if (person) {
    response.status(200).json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const personToDelete = data.find((person) => person.id === id)
  if (personToDelete) {
    data = data.filter((person) => person.id !== id)
    response.status(204).end()
  } else {
    response.status(404).end()
  }
})

app.post('/api/persons', (request, response) => {
  const personData = request.body

  if (!personData.name || !personData.number) {
    return response.status(400).json({ error: 'Name and number fields are required' })
  }

  const duplicate = data.find((person) => person.name === personData.name || person.number === personData.number)

  if (duplicate) {
    if (duplicate.name === personData.name) {
      return response.status(400).json({ error: 'Person with this name already exists' })
    }
    if (duplicate.number === personData.number) {
      return response.status(400).json({ error: 'Person with this number already exists' })
    }
  }

  const id = generateId()
  const newPerson = { id, ...personData }

  data = [newPerson, ...data]
  response.json(newPerson)
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
