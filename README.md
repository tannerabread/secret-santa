# Secret Santa "Random" Picker

## Constraints:

* User cannot pick themselves or their partner. 
* Users must all have a different choice. 
* Users must all get chosen once every user has picked.
* User cannot pick more than once.

This project is designed for 8 people grouped into 4 couples to pick a secret santa for each other.

It is not optimized for any other group size and would need to be modified to do so.

It also does not always work. It works every time when I test it myself and as soon as a certain someone watches it breaks.

## Other Project/Algorithm Notes

This project is also an example of bad planning, as when it was started it was assumed the chances of the outcome leaving the last person with only themself or their partner to pick from was slim.
That is not the case.
Those chances are very high, as demonstrated by the first test run that yielded those exact results.

Many more tests later and we have the mess that is the "random" algorithm to help the program run once without having to reset the database and restart.
This is the nature of secret santa though, and if done in person pulling names from a hat, it is believed the group would have to restart many times in order to meet the constraints listed above.

What started as a *simple* project took many hours of refining and many tests to find edge cases without planning.

This project could definitely use some refactoring, but as of now it seems to work 99% of the time, which is good enough for this year.

It could definitely do with some sort of prediction algorithm that uses the available choices left to see what is possible to not ruin the end result without this mess of functions that probably has a lot of holes in it.

### Variable Names

I enjoy being cryptic.
Have fun figuring out what's happening, nothing is really any crazy logic but the way it is written makes it seem so.

## DB Choice

### Why Use a DB for this Project?

Because Next.JS, that's why

Really though, NextJS does not allow writing to a file during deployment, so the entries could be read but the updated data would not persist through the life of the project.

A simple `.json` file could be used such as the file `example.dblist.json` if a node.js backend or some non-serverless framework was used.

### AWS DynamoDB

There was an attempt to add [DynamoDB](https://aws.amazon.com/dynamodb/) to this project, with no luck.
Everything worked in local development but as soon as it was deployed to [Vercel](https://vercel.com/), there was a problem executing the lambda edge functions, saying the lambda function had no authorization to access the resources in the supplied AWS account.
Searching through previous commits would show how much trouble and time was spent trying to get this to work.

It is still unknown why this did not work with proper environment variables 

### FaunaDB with GraphQL

[FaunaDB](https://fauna.com/) was then chosen with a [GraphQL](https://graphql.org/) query layer on top.

This proved to be a much more simple setup, the `helpers/graphql.js` file shows how easy it is to get started.
All that was needed was the secret key provided by FaunaDB in the Settings options on a collection, denoted by `process.env.FAUNA_SECRET_KEY` in this file.
Also NOTE: Fauna likes to have the region in the URL as indicated by `https...graphql.***US***.fau...`

#### GraphQL

I am new to GraphQL, so I stuck with the default updateUser created by the Schema provided when making mutations.
Attempts were made to make a 
```graphql
type Mutation {
  updateChooser(id: ID!, data: [User]): User!
}
```
within the Schema but there was something about custom resolvers.
I attempted to solve this but then FaunaDB wanted me to write the custom functions in FQL and this was supposed to be a simple project so I passed on learning that for now.

## Getting Started

Fork/clone this repository to your local machine then install dependencies:

```bash
npm install
# or 
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/](http://localhost:3000/api/). This endpoint can be edited in `pages/api/index.js`. This will show the current status of all users in the DB. This is also the endpoint that allows **POST** requests to the DB.

[Dynamic API routes](https://nextjs.org/docs/api-routes/dynamic-api-routes) can be accessed on [http://localhost:3000/api/[santa_name]](http:3000/api/name). This endpoint can be edited in `pages/api/[slug].js`. This allows users to check who they picked after leaving the page.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
