import Head from 'next/head'
import React from 'react'
import { useState } from 'react'
import useSWR from 'swr'
import styles from '../styles/Home.module.css'

const fetcher = (url) => fetch(url).then((r) => r.json())

export default function Home() {
  const { data: people, error } = useSWR('/api', fetcher)
  const selectRef = React.createRef()
  const [chosen, setChosen] = useState()

  function forceFourth(remaining, id) {
    // check if one couple has had no choices yet
    remaining = remaining.filter((p) => p.id !== id && p.partnerId !== id)
    let coupleHash = {}
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].partnerId in coupleHash) {
        return [list[remaining[i].id], list[remaining[i].partnerId]]
      }
      coupleHash[remaining[i].partnerId] = remaining[i].partnerid
    }
    return remaining
  }

  // also forceFifth because edge cases
  function forceSixth(remaining, id) {
    // check if one couple has not picked yet
    // if so, check that if this sixth person picks, it leaves the last 2 with valid choices
    // if this sixth person is the last of the first 3 couples, and the last couple that hasn't chosen yet
    //    still has an available chosen, the sixth person must pick the available one from that couple
    // check if two of the entries are from the same couple
    let remainingToPick = people.filter((p) => !p.hasChosen && p.id !== id)
    // if 2 of these ^^ have the same coupleId and one has not been chosen, must return that one
    let coupleHash = {}
    for (let i = 0; i < remainingToPick.length; i++) {
      if (remainingToPick[i].coupleId in coupleHash) {
        let person1 = remainingToPick[i]
        let person2 = remainingToPick[coupleHash[remainingToPick[i].coupleId]]
        if (!person1.hasBeenChosen && person1.id !== id) {
          return [person1]
        } else if (!person2.hasBeenChosen && person2.id !== id) {
          return [person2]
        }
      }
      coupleHash[remainingToPick[i].coupleId] = i
    }

    // edge case where 2 people are left unchosen from same couple
    // one has chosen and other has not
    // one of them must be chosen on 6th 
    let remainingHash = {}
    remaining = remaining.filter(p => p.id !== id)
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].coupleId in remainingHash) {
        return [remaining[i], remaining[remainingHash[remaining[i].coupleId]]]
      }
      remainingHash[remaining[i].coupleId] = i
    }
    return remaining
  }

  // force 7th if one person hasn't picked and hasn't been picked
  function forceSeventh(remaining, id) {
    // check if out of the remaining there is one person who hasn't picked,
    //    isn't the person picking,
    //    and hasn't been chosen (hence in remaining)
    remaining = remaining.filter(p => p.id !== id && p.coupleId !== people[id].coupleId)
    let person
    if (remaining.length === 2) {
      if (
        !remaining[0].hasChosen &&
        !remaining[0].hasBeenChosen &&
        remaining[0].id !== id &&
        remaining[0].coupleId !== person[id].coupleId
      ) {
        return [remaining[0]]
      } else if (
        !remaining[1].hasChosen &&
        !remaining[1].hasBeenChosen &&
        remaining[1].id !== id &&
        remaining[0].coupleId !== person[id].coupleId
      ) {
        return [remaining[1]]
      }
    }
    return remaining
  }

  function handleClick() {
    // find current id for who is picking and the remaining people that have not been chosen
    let id = selectRef.current.selectedIndex
    let remaining = people.filter((p) => !p.hasBeenChosen)
    if (people[id].hasChosen) {
      setChosen('YOU HAVE ALREADY PICKED')
      return
    }

    let allowableList
    // edge case for 4th pick
    if (remaining.length === 5) {
      allowableList = forceFourth(remaining, id)
      allowableList = allowableList.filter(
        (p) => p.coupleId !== people[id].coupleId
      )
    }
    // edge case for 5th/6th pick
    else if (remaining.length === 4 || remaining.length === 3) {
      allowableList = forceSixth(remaining, id)
      console.log('initial allowableList', allowableList)
      allowableList = allowableList.filter(
        (p) => p.coupleId !== people[id].coupleId
      )
    } else if (remaining.length === 2) {
      allowableList = forceSeventh(remaining, id)
    }
    // every other option
    else {
      allowableList = people.filter(
        (p) => people[id].coupleId !== p.coupleId && !p.hasBeenChosen
      )
    }
    console.log('allowableList', allowableList)
    // chooses a "random" person from those that are left
    let chosenOne
    if (allowableList.length === 1) {
      chosenOne = allowableList[0]
    } else {
      let random = Math.floor(Math.random() * allowableList.length)
      chosenOne = allowableList[random]
    }
    console.log('chosenOne', chosenOne)
    setChosen(chosenOne.santa)

    // put request parameter update for the person that just picked
    let chooserParams = {}
    chooserParams._id = people[id]._id
    chooserParams.hasChosen = true
    chooserParams.chosee = people[chosenOne.id].santa
    chooserParams.choseeCoupleId = people[chosenOne.id].coupleId
    postData(`/api`, chooserParams)

    // put request parameter update for the person that was chosen
    let chosenParams = {}
    chosenParams._id = chosenOne._id
    chosenParams.hasBeenChosen = true
    console.log('chosenParams', chosenParams)
    postData(`/api`, chosenParams)
  }

  async function postData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  }

  if (!people) return <div>Loading...</div>

  return (
    <div className={styles.container}>
      <Head>
        <title>Tanner 2021 Secret Santa</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Tanner 2021 Secret Santa Picker!</h1>

        <p className={styles.description}>
          {`Guaranteed to not let you pick your own partner's name!`}
        </p>

        <div className={styles.grid}>
          <div className={styles.row}>
            <label className={styles.description} htmlFor="list">
              Your name:{' '}
            </label>
            <select className={styles.list} name="list" ref={selectRef}>
              {people.map((p) => (
                <option className={styles.option} key={p.santa} value={p.santa}>
                  {p.santa}
                </option>
              ))}
            </select>
          </div>
          <button className={styles.button} onClick={handleClick}>
            PICK MY PERSON
          </button>
          <h2 className={styles.description}>
            You will be Santa for: {chosen}
          </h2>
        </div>
      </main>
    </div>
  )
}
