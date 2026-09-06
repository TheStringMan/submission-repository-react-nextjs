const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://maruko0798_db_user:${password}@cluster0.lux8zhv.mongodb.net/phonebookApp?appName=Cluster0`
mongoose.set('strictQuery', false)

mongoose.connect(url, { family: 4 })

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Phonebook = mongoose.model('Phonebook', phonebookSchema)

if (name && number) {
  const phonebook = new Phonebook({
    name: name,
    number: number,
  })

  phonebook.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  Phonebook.find({}).then((result) => {
    console.log('phonebook:')
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}
