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
      choseeId
    }
  }
`

const UPDATE_USER_CHOICE_MUTATION = gql`
  mutation UpdateUserChoice($userId: ID!, $choseeId: ID!) {
    updateUserChoice(userId: $userId, choseeId: $choseeId) {
      id
      hasChosen
      choseeId
    }
  }
`

export default function Home() {
  const { data, loading, error } = useQuery(ALL_USERS_QUERY, { client })
  const [updateUserChoice] = useMutation(UPDATE_USER_CHOICE_MUTATION, {
    client,
  })
  const selectRef = useRef()
  const [chosen, setChosen] = useState()

  function handleClick() {
    const selectedName = selectRef.current.value // Get the name from the selected option value
    const currentUser = data.allUsers.find((user) => user.name === selectedName) // Find the user by name
    if (currentUser.hasChosen) {
      setChosen('YOU HAVE ALREADY PICKED')
      return
    }

    // Filter out the current user by name, their partner by coupleId, and anyone who has already been chosen
    const allowableList = data.allUsers.filter(
      (p) =>
        p.name !== currentUser.name &&
        p.coupleId !== currentUser.coupleId &&
        !p.hasBeenChosen
    )

    // If no one is left to choose, set the message and return
    if (allowableList.length === 0) {
      setChosen('No available person to pick.')
      return
    }

    // Randomly select a user from the allowable list
    const chosenOne =
      allowableList[Math.floor(Math.random() * allowableList.length)]

    setChosen(chosenOne.name)

    updateUserChoice({
      variables: {
        userId: currentUser.id,
        choseeId: chosenOne.id,
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
                <option className={styles.option} key={p.santa} value={p.santa}>
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
