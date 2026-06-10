import { useAuth } from '../hooks/useAuth';
import { Hero } from '../components/Hero';
import { Path } from '../components/Path';
import { PeopleSection } from '../components/PeopleSection';
import { JournalPreview } from '../components/JournalPreview';
import { Courses } from '../components/Courses';
import { BottomSection } from '../components/BottomSection';
import { Footer } from '../components/Footer';
import { ProfessionalCourses } from '../components/ProfessionalCourses';

export function Home() {
  const { isAuthenticated } = useAuth();
  return (
    <div style={{ paddingTop: 60, marginLeft: 56, background: '#F8F9FB', minHeight: '100vh' }}>
      <Hero isAuthorized={isAuthenticated} />
      <Path />
      <PeopleSection />
      <JournalPreview />
      <Courses />
      <ProfessionalCourses />
      <BottomSection />
      <Footer />
    </div>
  );
}