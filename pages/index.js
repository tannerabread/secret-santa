import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import db from '../lib/db'

export default function Home(props) {
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
          Guaranteed to not let you pick your own partner's name!
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          
        </div>
      </main>
    </div>
  )
}

export async function getServerSideProps(context) {

  function onScan(err, data) {
    if (err) {
      console.error("unable to scan the table. Error JSON:", JSON.stringify(err, null, 2))
    } else {
      // print everything
      console.log('scan succeeded')
      console.log('data.items', data.Items)
      return data.Items
    }
  }

  const params = {
    TableName: process.env.TABLE_NAME,
    ProjectionExpression: "id, coupleId, santa, hasChosen"
  }

  const { Item } = await db.scan(params, onScan)
  console.log('Item', Item)
  
  return {
    props: {

    }
  }
}

