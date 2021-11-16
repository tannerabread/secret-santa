import Head from 'next/head'
import React from 'react'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import list from '../data/list.json'

export default function Home() {
  const [people, setPeople] = useState(list.map(name => name))
  const selectRef = React.createRef()
  const [chosen, setChosen] = useState()

  function forceFourth(remaining, id) {
    // check if one couple has had no choices yet
    remaining = remaining.filter(p => p.id !== id)
    let coupleHash = {}
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].partnerId in coupleHash) {
        return [ list[remaining[i].id], list[remaining[i].partnerId] ]
      }
      coupleHash[remaining[i].partnerId] = remaining[i].partnerid
    }
    return remaining
  }

  function forceSixth(remaining, id) {
    // check if one couple has not picked yet
    // if so, check that if this sixth person picks, it leaves the last 2 with valid choices
    // if this sixth person is the last of the first 3 couples, and the last couple that hasn't chosen yet
    //    still has an available chosen, the sixth person must pick the available one from that couple
    // check if two of the entries are from the same couple
    let remainingToPick = list.filter(p => !p.hasChosen)
    // if 2 of these ^^ have the same coupleId and one has not been chosen, must return that one
    let coupleHash = {}
    let duplicate = false
    for (let i = 0; i < remainingToPick.length; i++) {
      if (remainingToPick[i].coupleId in coupleHash) { 
        let person1 = remainingToPick[i]
        let person2 = remainingToPick[coupleHash[remainingToPick[i].coupleId]]
        if (!person1.hasBeenChosen && person1.id !== id) { return [person1] }
        else if (!person2.hasBeenChosen && person2.id !== id) { return [person2] }
      }
      coupleHash[remainingToPick[i].coupleId] = i
    }
    return remaining
  }

  function handleClick() {
    // find current id for who is picking and the remaining people that have not been chosen
    let id = selectRef.current.selectedIndex
    let remaining = people.filter(p => !p.hasBeenChosen)
    
    let allowableList
    // edge case for 4th pick
    if (remaining.length === 5) {
      allowableList = forceFourth(remaining, id)
    } 
    // edge case for 6th pick
    else if (remaining.length === 3) { 
      allowableList = forceSixth(remaining, id)
    } 
    // every other option
    else {
      allowableList = people.filter(p => {
      return people[id].coupleId !== p.coupleId && !p.hasBeenChosen
        && people[people[id].partnerId].choseeCoupleId !== p.coupleId
    })}

    // chooses a "random" person from those that are left
    let chosenOne
    if (allowableList.length === 1) {
      chosenOne = allowableList[0]
    } else {
      let random = Math.floor(Math.random() * allowableList.length)
      chosenOne = allowableList[random]
    }
    setChosen(chosenOne.santa)
    
    // put request parameter update for the person that just picked
    let chooserParams = people[id]
    chooserParams.hasChosen = true
    chooserParams.chosee = people[chosenOne.id].santa
    chooserParams.choseeCoupleId = people[chosenOne.id].coupleId
    postData(`/api`, chooserParams)

    // put request parameter update for the person that was chosen
    let chosenParams = people[chosenOne.id]
    chosenParams.hasBeenChosen = true
    postData(`/api`, chosenParams)
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
          <div className={styles.row}>
            <label className={styles.description} htmlFor="list">Your name: </label>
            <select className={styles.list} name="list" ref={selectRef}>
              {people.map(p => (
                <option className={styles.option} key={p.santa} value={p.santa}>{p.santa}</option>
              ))}
            </select>
          </div>
          <button className={styles.button} onClick={handleClick}>PICK MY PERSON</button>
          <h2 className={styles.description}>You will be Santa for: {chosen}</h2>
        </div>
      </main>
    </div>
  )
}
