import list from '../../data/list.json'
import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  if (req.method === 'GET') {
    console.log('list', list)
    res.status(200).json(list)
  }

  if (req.method === 'PUT') {
    // process PUT request
    const body = req.body
    let objIndex = list.findIndex(obj => obj.id === body.id)
    list[objIndex] = body
    const dir = path.resolve('./data')
    console.log('dir', dir)
    fs.writeFileSync(dir + '/list.json', JSON.stringify(list, null, 2))
    res.status(201).json(list)
  }
}