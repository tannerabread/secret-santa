import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import client from '../helpers/apolloClient';

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
`;

const RESET_CHOICES_MUTATION = gql`
  mutation {
    resetChoices
  }
`;

export default function Admin() {
  const { data, loading, error } = useQuery(ALL_USERS_QUERY, { client });
  const [resetChoices] = useMutation(RESET_CHOICES_MUTATION, { client });
  const [validationMessages, setValidationMessages] = useState([]);

  const handleReset = async () => {
    try {
      await resetChoices();
      setValidationMessages(["Choices have been reset!"]);
    } catch (error) {
      setValidationMessages(["Error resetting choices: " + error.message]);
    }
  };

  const validateChoices = () => {
    if (loading) return;
    if (error) {
      setValidationMessages(["Error fetching users: " + error.message]);
      return;
    }

    const users = data.allUsers;
    const chosenSet = new Set();
    const messages = [];

    for (let user of users) {
      if (!user.hasBeenChosen) {
        messages.push(`${user.name} has not been chosen.`);
      }
    
      if (user.name === user.choseeName || user.partnerId === user.choseeName) {
        messages.push(`${user.name} has chosen their partner or themselves.`);
      }
    
      if (user.choseeName) {
        chosenSet.add(user.choseeName);
      }
    }
    
    if (chosenSet.size < users.filter(user => user.choseeName).length) {
      messages.push("Some users have been chosen more than once.");
    }
    

    if (messages.length === 0) {
      messages.push("All validations passed!");
    }

    setValidationMessages(messages);
  };

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const buttonStyle = {
    padding: '10px 15px',
    margin: '10px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  };

  const listStyle = {
    listStyleType: 'none',
    padding: '0'
  };

  const listItemStyle = {
    padding: '5px',
    backgroundColor: '#e6e6e6',
    margin: '5px 0',
    borderRadius: '4px'
  };

  return (
    <div style={containerStyle}>
      <h1>Admin Panel</h1>
      <button style={buttonStyle} onClick={handleReset}>Reset All Choices</button>
      <button style={buttonStyle} onClick={validateChoices}>Validate Choices</button>
      <ul style={listStyle}>
        {validationMessages.map((message, index) => (
          <li key={index} style={listItemStyle}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
