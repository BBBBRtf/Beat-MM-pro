import { Locale } from '@/i18n-config';
import { getDictionary } from '@/lib/dictionary';
import { Container, Form, Button, Card, ProgressBar } from 'react-bootstrap';

export default async function UploadPage({ params: { locale } }: { params: { locale: Locale }}) {
  const dict = await getDictionary(locale);
  // Placeholder state for upload progress (in a real app, this would use React state)
  const uploadProgress = 65; // Example progress

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header as="h2">Upload Music</Card.Header>
        <Card.Body>
          <p>This is the music upload page. Locale: {locale}.</p>
          <p>{dict.greeting}</p>

          <Form>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Select your music file (MP3, WAV, etc.)</Form.Label>
              <Form.Control type="file" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formMusicTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" placeholder="Enter music title" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formMusicArtist">
              <Form.Label>Artist Name (optional)</Form.Label>
              <Form.Control type="text" placeholder="Enter artist name" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formMusicGenre">
              <Form.Label>Genre (optional)</Form.Label>
              <Form.Control type="text" placeholder="e.g., Pop, Rock, Jazz" />
            </Form.Group>

            <Button variant="primary" type="submit" className="mb-3">
              Upload File
            </Button>
          </Form>

          {/* Placeholder for upload progress */}
          {uploadProgress > 0 && (
            <div>
              <h5>Upload Progress:</h5>
              <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} animated />
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
