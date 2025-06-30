import { Locale } from '@/i18n-config';
// import { getDictionary } from '@/lib/dictionary'; // Commented out as dict is not used yet
import { Container, Card, Form, Button } from 'react-bootstrap';
import Link from 'next/link'; // Import Link

export default async function RegisterPage({ params: { locale } }: { params: { locale: Locale }}) {
  // const dict = await getDictionary(locale);
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">Register</Card.Title>
          <Form>
            <Form.Group className="mb-3" controlId="formRegisterUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Choose a username" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRegisterEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRegisterPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Create a password" />
            </Form.Group>
            <Button variant="success" type="submit" className="w-100">
              Register
            </Button>
          </Form>
          <div className="mt-3 text-center">
             <p>Already have an account? <Link href={`/${locale}/login`}>Login</Link></p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
