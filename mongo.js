
const mongoose = require('mongoose')


const url = `mongodb+srv://myAtlasDBUser:${password}@myatlasclusteredu.7deub.mongodb.net/?retryWrites=true&w=majority&appName=myAtlasClusterEDU`

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

mongoose
  .connect(url)
  .then(() => {
    if (process.argv.length > 3) {
      const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
      })
      return person
        .save()
        .then((savedPerson) => console.log(`added ${savedPerson.name} number ${savedPerson.number} to phonebook`))
    } else {
      return Person.find({}).then((persons) => {
        console.log('phonebook:')
        persons.forEach((person) => {
          console.log(`${person.name} ${person.number}`)
        })
      })
    }
  })
  .then(() => {
    mongoose.connection.close()
  })
  .catch((error) => {
    console.log(error.message)
  })
