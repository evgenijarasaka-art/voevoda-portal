import { useNavigate } from 'react-router-dom';

const sections = [
  {
    title: '1. Общие условия',
    text: [
      'Пользователь получает доступ к порталу, личному кабинету, курсам, расписанию, материалам, домашним заданиям, журналу и сервисам взаимодействия с группой.',
      'Использование портала означает согласие с условиями настоящего соглашения.',
    ],
  },
  {
    title: '2. Аккаунт пользователя',
    text: [
      'Пользователь отвечает за корректность данных, сохранность логина и пароля, а также за действия, совершенные в личном кабинете.',
      'Если пользователь заметил несанкционированный доступ, необходимо сразу обратиться в поддержку.',
    ],
  },
  {
    title: '3. Курсы, материалы и домашние задания',
    text: [
      'Материалы курсов предназначены для личного использования в рамках обучения. Их нельзя распространять, продавать или публиковать без разрешения правообладателя.',
      'Прогресс просмотра уроков, результаты тестов и статус домашних заданий сохраняются в личном кабинете.',
    ],
  },
  {
    title: '4. Оплата и возвраты',
    text: [
      'Оплата курсов проводится через подключенного платежного оператора. После успешной оплаты пользователь получает доступ к выбранной программе или инструкции по дальнейшим действиям.',
      'Условия возврата зависят от оплаченной услуги, даты обращения и фактического объема оказанных услуг.',
    ],
  },
  {
    title: '5. Ограничения',
    text: [
      'Запрещено пытаться нарушить работу портала, получать доступ к чужим данным, публиковать недостоверные сведения, оскорбления, спам или материалы, нарушающие закон.',
      'Администрация может ограничить доступ при нарушении соглашения или требований безопасности.',
    ],
  },
  {
    title: '6. Контакты',
    text: [
      'По вопросам доступа, оплаты, документов и технической поддержки пользователь может обратиться по почте: info@voevoda.ru.',
    ],
  },
];

export function UserAgreement() {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, minHeight: '100vh', background: '#F4F6FB' }}>
      <div style={{ padding: '28px 32px 48px', maxWidth: 1120, margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ border: '1px solid #E5E7EB', background: '#fff', borderRadius: 10, padding: '9px 14px', fontSize: 13, color: '#374151', cursor: 'pointer', marginBottom: 18 }}
        >
          Назад
        </button>

        <div style={{ background: '#0E1424', borderRadius: 18, padding: '34px 38px', marginBottom: 18, color: '#fff', boxShadow: '0 18px 45px rgba(17,24,39,.16)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#AFC2FF', marginBottom: 10, textTransform: 'uppercase', letterSpacing: .5 }}>Правовая информация</div>
          <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.15, fontWeight: 900 }}>Пользовательское соглашение</h1>
          <p style={{ margin: '14px 0 0', maxWidth: 760, color: 'rgba(255,255,255,.72)', fontSize: 15, lineHeight: 1.7 }}>
            Условия использования портала УТЦ «ВОЕВОДА»: личного кабинета, курсов, материалов, домашних заданий, оплат и коммуникаций внутри сервиса.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
          {sections.map((section) => (
            <section key={section.title} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 24px' }}>
              <h2 style={{ margin: '0 0 12px', fontSize: 19, fontWeight: 800, color: '#111827' }}>{section.title}</h2>
              {section.text.map((paragraph) => (
                <p key={paragraph} style={{ margin: '0 0 10px', fontSize: 15, color: '#374151', lineHeight: 1.75 }}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <div style={{ marginTop: 18, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '18px 24px', color: '#6B7280', fontSize: 13, lineHeight: 1.6 }}>
          Редакция для демонстрационного портала. Перед публикацией заказчик должен сверить реквизиты, контакты и юридические формулировки с ответственным юристом.
        </div>
      </div>
    </div>
  );
}
