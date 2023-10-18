import Head from 'next/head';
import React, { useRef, useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import styles from '../styles/Home.module.css';
import client from '../helpers/apolloClient';

const ALL_USERS_QUERY = gql`
  query {
    allUsers {
      id
      name
      coupleId
      partnerId
      hasChosen
      choseeId
    }
  }
`;

const UPDATE_USER_CHOICE_MUTATION = gql`
  mutation UpdateUserChoice($userId: ID!, $choseeId: ID!) {
    updateUserChoice(userId: $userId, choseeId: $choseeId) {
      id
      hasChosen
      choseeId
    }
  }
`;

export default function Home () {
  const { data, loading, error } = useQuery(ALL_USERS_QUERY, { client });
  const [updateUserChoice] = useMutation(UPDATE_USER_CHOICE_MUTATION, { client });
  const selectRef = useRef();
  const [chosen, setChosen] = useState();

  function handleClick () {
    const id = selectRef.current.selectedIndex;
    const currentUser = data.allUsers[id];
    if (currentUser.hasChosen) {
      setChosen('YOU HAVE ALREADY PICKED');
      return;
    }

    const allowableList = data.allUsers.filter(p => p.id !== currentUser.id && p.partnerId !== currentUser.id && !p.hasChosen);
    const chosenOne = allowableList[Math.floor(Math.random() * allowableList.length)];

    setChosen(chosenOne.name);

    updateUserChoice({
      variables: {
        userId: currentUser.id,
        choseeId: chosenOne.id
      }
    });
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Tanner 2023 Secret Santa</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Tanner Family! 2023!! Secret Santa Picker!!!</h1>
        <p className={styles.description}>Guaranteed to not let you pick your own partners name!</p>

        <div className={styles.grid}>
          <div className={styles.row}>
            <label className={styles.description} htmlFor="list">Your name: </label>
            <select className={styles.list} name="list" ref={selectRef}>
              {people.map((p) => (
                <option className={styles.option} key={p.santa} value={p.santa}>
                  {p.santa}
                </option>
              ))}
            </select>
          </div>
          <button className={styles.button} onClick={handleClick}>PICK MY PERSON</button>
          <h2 className={styles.description}>You will be Santa for: {chosen}</h2>
        </div>
      </main>
    </div>
  );
}
