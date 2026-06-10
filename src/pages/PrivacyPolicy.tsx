import { useNavigate } from 'react-router-dom';

const sections = [
  {
    title: '1. Какие данные обрабатываются',
    text: [
      'ФИО, телефон, электронная почта, город, данные личного кабинета, сведения о выбранных курсах, оплатах, прогрессе обучения, домашних заданиях и обращениях в поддержку.',
      'Технические данные: IP-адрес, тип устройства, браузер, дата и время входа, действия в интерфейсе, необходимые для стабильной работы портала.',
    ],
  },
  {
    title: '2. Для чего используются данные',
    text: [
      'Для регистрации и входа в личный кабинет, записи на курсы, отображения расписания, сохранения прогресса, обработки домашних заданий и связи с пользователем.',
      'Для проведения платежей, выдачи документов, поддержки пользователя, улучшения сервиса и соблюдения требований законодательства.',
    ],
  },
  {
    title: '3. Передача третьим лицам',
    text: [
      'Данные могут передаваться только тем сервисам, которые нужны для работы портала: платежному оператору, сервисам почтовых уведомлений, хостингу и технической поддержке.',
      'Данные не продаются и не передаются для сторонней рекламы.',
    ],
  },
  {
    title: '4. Хранение и защита',
    text: [
      'Доступ к данным ограничен ответственными сотрудниками и техническими подрядчиками, которым он необходим для выполнения рабочих задач.',
      'Данные хранятся столько, сколько требуется для оказания услуг, бухгалтерского учета, поддержки и выполнения требований закона.',
    ],
  },
  {
    title: '5. Права пользователя',
    text: [
      'Пользователь может запросить уточнение, удаление или ограничение обработки своих данных, если это не противоречит закону и действующим обязательствам.',
      'Для обращения используйте почту: info@voevoda.ru.',
    ],
  },
];

export function PrivacyPolicy() {
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
          <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.15, fontWeight: 900 }}>Политика конфиденциальности</h1>
          <p style={{ margin: '14px 0 0', maxWidth: 760, color: 'rgba(255,255,255,.72)', fontSize: 15, lineHeight: 1.7 }}>
            Документ описывает, какие персональные данные обрабатываются на портале УТЦ «ВОЕВОДА», зачем они нужны и как пользователь может обратиться по вопросам обработки данных.
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
