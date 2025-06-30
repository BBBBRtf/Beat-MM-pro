import { getDictionary } from '@/lib/dictionary';
import { Locale } from '@/i18n-config';
import { Container, Button } from 'react-bootstrap';

export default async function HomePage({ params: { locale } }: { params: { locale: Locale }}) {
  const dict = await getDictionary(locale);
  return (
    <Container className="mt-5">
      <h1>{dict.greeting} from BeatMM Pro!</h1>
      <p>Current locale: {locale}</p>
      <p>This is the main page content.</p>
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary" className="ms-2">Secondary Button</Button>
    </Container>
  );
}
