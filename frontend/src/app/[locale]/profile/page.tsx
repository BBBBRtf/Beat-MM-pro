import { Locale } from '@/i18n-config';
import { getDictionary } from '@/lib/dictionary';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';

export default async function ProfilePage({ params: { locale } }: { params: { locale: Locale }}) {
  const dict = await getDictionary(locale);
  return (
    <Container className="mt-5">
      <Row>
        <Col md={4}>
          {/* Placeholder for profile picture */}
          <Image src="https://via.placeholder.com/150" alt="User profile picture" roundedCircle fluid className="mb-3" />
          <Card>
            <Card.Header>User Information</Card.Header>
            <Card.Body>
              <Card.Text><strong>Username:</strong> User123</Card.Text>
              <Card.Text><strong>Email:</strong> user@example.com</Card.Text>
              <Card.Text><strong>Joined:</strong> January 1, 2024</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <h2>User Profile</h2>
          <p>This is the user profile page. Locale: {locale}.</p>
          <p>{dict.greeting} - This is a placeholder for more profile content.</p>
          {/* More profile sections can be added here */}
        </Col>
      </Row>
    </Container>
  );
}
