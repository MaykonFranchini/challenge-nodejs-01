import fs from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf8').then(data => {
      this.#database = JSON.parse(data)
    }).catch(()=> {
      this.#persist()
    })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database))
  }
  select(table, search) {
    let data = this.#database[table] ?? []

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase())
        }) 
      })
    }

    return data
  }

  insert(table, data) {
    const task = {
      id: randomUUID(),
      title: data.title,
      description: data.description,
      created_at: new Date(),
      completed_at: null,
      updated_at: null
    }

    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(task)
    } else {
      this.#database[table] = [task]
    }
    this.#persist()
    return data
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)
    if (rowIndex > -1) {
      const task = this.#database[table][rowIndex]
      if (data) {
        this.#database[table][rowIndex] = { 
          id: task.id,
          title: data.title,
          description: data.description,
          created_at: task.created_at,
          completed_at: null,
          updated_at: new Date()
        }
      } else {
        this.#database[table][rowIndex].completed_at = new Date()
        this.#database[table][rowIndex].updated_at = new Date()
      }
    }
    this.#persist()
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if(rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist()
    }
  }
}