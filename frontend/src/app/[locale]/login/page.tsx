// import { Locale } from '@/i18n-config'; // Temporarily removed
// import { getDictionary } from '@/lib/dictionary'; // Temporarily removed
import { Container, Card, Form, Button } from 'react-bootstrap';
import Link from 'next/link';

// Simplified props, not using Locale directly from i18n-config for this test
type LoginPageProps = {
  params: { locale: string }; // Using simple string for locale
};

// Removed async, not fetching dictionary for this test
export default function LoginPage({ params }: LoginPageProps) {
  const { locale } = params;
  // const dict = await getDictionary(locale);
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">Login (Locale: {locale})</Card.Title>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
          <div className="mt-3 text-center">
            <p>Don&apos;t have an account? <Link href={`/${locale}/register`}>Sign Up</Link></p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
