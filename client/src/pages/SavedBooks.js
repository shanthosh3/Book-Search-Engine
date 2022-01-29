import React, { useState, useEffect } from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import { REMOVE_BOOK } from '../utils/mutations';
import { GET_ME } from '../utils/queries';

const SavedBooks = () => {
  // query for 'me'
  const { loading, data } = useQuery(GET_ME);
  // hold the userData
  const [userData, setUserData] = useState({});
  console.log('user ', userData);

  // mutation to remove book from savedBooks
  const [removeBook] = useMutation(REMOVE_BOOK);

  // if there is data setUserData
  useEffect(() => {
    if (data) {
      setUserData(data.me)
    }
  }, [data, loading]);


  // deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const updatedUser = await removeBook({
        variables: { bookId },
      });
      // remove book's id from localStorage
      removeBookId(bookId);
      // set userData to updatedUser
      setUserData(updatedUser.removeBook);
    } catch (err) {
      console.error(err);
    }
  };

  // if not logged in return message
  if (!userData?.username) {
    return (
      <h4>
        You need to be logged in to see this page. Use the navigation links above to sign up of login!
      </h4>
    )
  }

  if (loading) {
    return <div>loading...</div>
  }
  
  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {userData.savedBooks.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;
