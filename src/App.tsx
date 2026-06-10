import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AccessibilityPanel } from './components/AccessibilityPanel';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Cart } from './pages/Cart';
import { Documents } from './pages/Documents';
import { EditProfile } from './pages/EditProfile';
import { Favorites } from './pages/Favorites';
import { ForgotPassword } from './pages/Forgotpassword';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Checkout } from './pages/Checkout';
import { MyCourses } from './pages/MyCourses';
import { MyPath } from './pages/MyPath';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { Register } from './pages/Register';
import { Stub } from './pages/Stub';
import { useAuth } from './hooks/useAuth';
import { CoursesPage } from './pages/CoursesPage';
import { JournalPage } from './pages/JournalPage';
import { ArticlePage } from './pages/ArticlePage';   // ← ДОБАВЛЕНО
import { CityPage } from './pages/CityPage';
import ScrollToTop from './components/ScrollToTop';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { Kaptorka } from './pages/Kaptorka';
import { Messages } from './pages/Messages';
import { Microblog } from './pages/Microblog';
import { Shop } from './pages/Shop';
import { Communities } from './pages/Communities';
import { Referral } from './pages/Referral';
import { FAQ } from './pages/FAQ';
import { Company } from './pages/Company';
import { Advertising } from './pages/Advertising';
import { CourseProgressPage } from './pages/CourseProgressPage';
import { LessonPage }   from './pages/LessonPage';
import { TestPage }     from './pages/TestPage';
import { HomeworkPage } from './pages/HomeworkPage';
import { Wallet }        from './pages/Wallet';
import { Payments }      from './pages/Payments';
import { Achievements }  from './pages/Achievements';
import { Subscriptions } from './pages/Subscriptions';
import { Subscribers }   from './pages/Subscribers';
import { Settings }      from './pages/Settings';
import { CourseLandingPage } from './pages/CourseLandingPage';
import { ProfessionalPage } from './pages/ProfessionalPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { UserAgreement } from './pages/UserAgreement';
import { Support } from './pages/Support';
import { Billing } from './pages/Billing';
import { RestorePassword } from './pages/RestorePassword';
import { TeachersPage } from './pages/TeachersPage';
import { CommandersPage } from './pages/CommandersPage';
import { MyCircle } from './pages/MyCircle';
import { MyJournal } from './pages/MyJournal';
import { LeadersPage } from './pages/Leaders';
import { CompetitionsPage } from './pages/Competitions';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Sidebar />
      <AccessibilityPanel />
      {children}
    </>
  );
}

function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{element}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/*"
          element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<UserAgreement />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/city/:slug" element={<CityPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/journal/:id" element={<ArticlePage />} />  {/* ← ДОБАВЛЕНО */}
                {/* Защищённые маршруты */}
                <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
                <Route path="/profile/edit" element={<ProtectedRoute element={<EditProfile />} />} />
                <Route path="/my-path" element={<ProtectedRoute element={<MyPath />} />} />
                <Route path="/my-courses" element={<ProtectedRoute element={<MyCourses />} />} />
                <Route path="/my-courses/:slug" element={<ProtectedRoute element={<CourseDetailPage />} />} />
                {/* Реализованные страницы */}
                <Route path="/kaptorka" element={<Kaptorka />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/dialogs" element={<Messages />} />
                <Route path="/microblog" element={<Microblog />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/market" element={<Shop />} />
                <Route path="/communities"  element={<Communities />} />
                <Route path="/referral" element={<Referral />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/qa" element={<FAQ />} />
                <Route path="/company" element={<Company />} />
                <Route path="/about" element={<Company />} />
                <Route path="/advertise" element={<Advertising />} />
                <Route path="/ads" element={<Advertising />} />
                <Route path="/my-circle" element={<MyCircle />} />
                <Route path="/my-journal" element={<MyJournal />} />
                <Route path="/leaders" element={<LeadersPage />} />
                <Route path="/cities" element={<Navigate to="/city/Москва" replace />} />
                <Route path="/competitions" element={<CompetitionsPage />} />
                <Route path="/my-courses/:slug/progress" element={<CourseProgressPage />} />
                <Route path="/lessons/:id"  element={<LessonPage />} />
                <Route path="/tests/:id"    element={<TestPage />} />
                <Route path="/homework/:id" element={<HomeworkPage />} />
                <Route path="/wallet"        element={<Wallet />} />
                <Route path="/payments"      element={<Payments />} />
                <Route path="/achievements"  element={<ProtectedRoute element={<Achievements />} />} />
                <Route path="/subscriptions" element={<ProtectedRoute element={<Subscriptions />} />} />
                <Route path="/subscribers"   element={<ProtectedRoute element={<Subscribers />} />} />
                <Route path="/settings"      element={<ProtectedRoute element={<Settings />} />} />
                <Route path="/courses/:slug" element={<CourseLandingPage />} />
                <Route path="/professional" element={<ProfessionalPage />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                {/* Новые страницы */}
                <Route path="/support" element={<Support />} />
                <Route path="/billing" element={<ProtectedRoute element={<Billing />} />} />
                <Route path="/restore" element={<ProtectedRoute element={<RestorePassword />} />} />
                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/commanders" element={<CommandersPage />} />
                {/* Catch-all */}
                <Route path="*" element={<Stub title="Страница не найдена" />} />
              </Routes>
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
