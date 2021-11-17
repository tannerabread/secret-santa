import list from '../../data/list.json'
import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  // process GET request
  if (req.method === 'GET') {
    res.status(200).json(list)
  }

  // process PUT request
  if (req.method === 'PUT') {
    // for this project, body is only one entry at a time
    // to update multiple entries, PUT must be called multiple times
    const body = req.body
    let objIndex = list.findIndex((obj) => obj.id === body.id)
    list[objIndex] = body

    const dir = path.resolve('./data')
    fs.writeFileSync(dir + '/list.json', JSON.stringify(list, null, 2))

    res.status(201).json(list)
  }
}
