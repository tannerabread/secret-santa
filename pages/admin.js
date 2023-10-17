import { useMutation, gql } from '@apollo/client';
import client from '../helpers/apolloClient';

const RESET_CHOICES_MUTATION = gql`
  mutation {
    resetChoices
  }
`;

export default function Admin() {
  const [resetChoices] = useMutation(RESET_CHOICES_MUTATION, { client });

  const handleReset = async () => {
    try {
      await resetChoices();
      alert("Choices have been reset!");
    } catch (error) {
      alert("Error resetting choices: " + error.message);
    }
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <button onClick={handleReset}>Reset All Choices</button>
      {/* Add more admin functionalities as needed */}
    </div>
  );
}
