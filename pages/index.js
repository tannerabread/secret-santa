import Head from 'next/head'
import React, { useRef, useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import styles from '../styles/Home.module.css'
import client from '../helpers/apolloClient'

const ALL_USERS_QUERY = gql`
  query {
    allUsers {
      name
      coupleId
      partnerId
      hasChosen
      hasBeenChosen
      choseeName
    }
  }
`

const UPDATE_USER_CHOICE_MUTATION = gql`
  mutation UpdateUserChoice($name: String!, $choseeName: String!) {
    updateUserChoice(name: $name, choseeName: $choseeName) {
      hasChosen
      choseeName
    }
  }
`

export default function Home() {
  const { data, loading, error } = useQuery(ALL_USERS_QUERY, {
    client,
    fetchPolicy: 'network-only',
  })
  const people = data?.allUsers || []
  const [updateUserChoice] = useMutation(UPDATE_USER_CHOICE_MUTATION, {
    client,
  })
  const selectRef = useRef()
  const [chosen, setChosen] = useState()

  function forceSixth(remaining, selectedName, selectedUser) {
    remaining = remaining.filter(
      (p) => p.name !== selectedName && p.partnerId !== selectedUser.partnerId
    )
    let coupleHash = {}
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].partnerId in coupleHash) {
        let person1 = people.find(
          (person) => person.partnerId === remaining[i].partnerId
        )
        let person2 = people.find((person) => person.name === remaining[i].name)
        return [person1, person2]
      }
      coupleHash[remaining[i].partnerId] = remaining[i].name
    }
    return remaining
  }

  function forceEighth(remaining, selectedName) {
    let remainingToPick = remaining.filter(
      (p) => !p.hasChosen && p.name !== selectedName
    )
    let coupleHash = {}
    for (let i = 0; i < remainingToPick.length; i++) {
      if (remainingToPick[i].coupleId in coupleHash) {
        let person1 = remainingToPick[i]
        let person2 = people.find(
          (person) => person.name === coupleHash[remainingToPick[i].coupleId]
        )
        if (!person1.hasBeenChosen && person1.name !== selectedName) {
          return [person1]
        } else if (!person2.hasBeenChosen && person2.name !== selectedName) {
          return [person2]
        }
      }
      coupleHash[remainingToPick[i].coupleId] = remainingToPick[i].name
    }

    let remainingHash = {}
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].coupleId in remainingHash) {
        let person1 = remaining[i]
        let person2 = people.find(
          (person) => person.name === remainingHash[remaining[i].coupleId]
        )
        return [person1, person2]
      }
      remainingHash[remaining[i].coupleId] = remaining[i].name
    }
    return remaining
  }

  function handleClick() {
    let selectedName = selectRef.current.value
    let selectedUser = people.find((p) => p.name === selectedName)

    let remaining = people.filter((p) => {
      return (
        !p.hasBeenChosen &&
        p.name !== selectedName &&
        p.partnerId !== selectedUser.partnerId
      )
    })

    if (selectedUser.hasChosen) {
      setChosen('YOU HAVE ALREADY PICKED')
      return
    }

    let allowableList
    if (remaining.length === 5) {
      allowableList = forceSixth(remaining, selectedName, selectedUser)
    } else if (remaining.length === 3) {
      allowableList = forceEighth(remaining, selectedName)
    } else {
      allowableList = remaining.filter(
        (p) => selectedUser.coupleId !== p.coupleId
      )
    }

    // Double-check the allowableList
    allowableList = allowableList.filter((p) => !p.hasBeenChosen)

    let chosenOne
    if (allowableList.length === 1) {
      chosenOne = allowableList[0]
    } else {
      let random = Math.floor(Math.random() * allowableList.length)
      chosenOne = allowableList[random]
    }
    setChosen(chosenOne.name)

    updateUserChoice({
      variables: {
        name: selectedUser.name,
        choseeName: chosenOne.name,
      },
    })
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className={styles.container}>
      <Head>
        <title>Tanner 2023 Secret Santa</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Tanner Family! 2023!! Secret Santa Picker!!!
        </h1>
        <p className={styles.description}>
          Guaranteed to not let you pick your own partners name!
        </p>

        <div className={styles.grid}>
          <div className={styles.row}>
            <label className={styles.description} htmlFor="list">
              Your name:{' '}
            </label>
            <select className={styles.list} name="list" ref={selectRef}>
              {data.allUsers.map((p) => (
                <option className={styles.option} key={p.name} value={p.name}>
                  {p.name}
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
