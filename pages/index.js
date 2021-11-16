import Head from 'next/head'
import React from 'react'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import { server } from '../config/index'

export default function Home({ data }) {
  const [people, setPeople] = useState(data.map(name => name))
  const selectRef = React.createRef()
  const [chosen, setChosen] = useState()

  function handleClick() {
    let id = selectRef.current.selectedIndex
    let allowableList = people.filter(p => {
      return people[id].coupleId !== p.coupleId && !p.hasBeenChosen
    })
    console.log('allowableList', allowableList)
    let random = Math.floor(Math.random() * allowableList.length)
    let chosenOne = allowableList[random]
    console.log('chosenOne', chosenOne)
    setChosen(chosenOne.santa)
    
    let chooserParams = people[id]
    chooserParams.hasChosen = true
    chooserParams.chosee = people[chosenOne.id].santa
    console.log('chooserParams', chooserParams)
    postData(`${server}/api`, chooserParams)

    let chosenParams = people[chosenOne.id]
    chosenParams.hasBeenChosen = true
    console.log('chosenParams', chosenParams)
    postData(`${server}/api`, chosenParams)
  }

  async function postData(url = '', data={}) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return response.json()
  }
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Tanner 2021 Secret Santa</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Tanner 2021 Secret Santa Picker!
        </h1>

        <p className={styles.description}>
          {`Guaranteed to not let you pick your own partner's name!`}
        </p>

        <div className={styles.grid}>
          <select ref={selectRef}>
            {people.map(p => (
              <option key={p.santa} value={p.santa}>{p.santa}</option>
            ))}
          </select>
          <button onClick={handleClick}>Who are you Santa for?</button>
          <h2 className={styles.description}>You will be Santa for: {chosen}</h2>
        </div>
      </main>
    </div>
  )
}

export async function getStaticProps() {
  const res = await fetch(`${server}/api`)
  const data = await res.json()
  console.log('data', data)

  return {
    props: {
      data
    }
  }
}