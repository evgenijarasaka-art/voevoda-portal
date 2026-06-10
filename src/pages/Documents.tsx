import { useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

type Section = { id: string; title: string; shortTitle?: string; };

const SECTIONS: Section[] = [
  { id: 'privacy', title: 'Политика конфиденциальности' },
  { id: 'agreement', title: 'Соглашение' },
  { id: 'intellectual', title: 'Интеллектуальная собственность' },
  { id: 'admin-rights', title: 'Права администрации' },
  { id: 'terms', title: 'Условия использования' },
  { id: 'basic-info', title: 'Основные сведения' },
  { id: 'structure', title: 'Структура и органы управления образовательной организацией', shortTitle: 'Структура и органы управления о...' },
  { id: 'documents', title: 'Документы' },
  { id: 'education', title: 'Образование' },
  { id: 'management', title: 'Руководство' },
  { id: 'teaching-staff', title: 'Педагогический состав' },
  { id: 'material', title: 'Материально-техническое обеспечение и оснащённость', shortTitle: 'Материально-техническое обесп...' },
  { id: 'paid-services', title: 'Платные образовательные услуги' },
  { id: 'financial', title: 'Финансово-хозяйственная деятельность', shortTitle: 'Финансово-хозяйственная деятель...' },
  { id: 'vacancies', title: 'Вакантные места для приема (перевода)', shortTitle: 'Вакантные места для приема (пер...' },
  { id: 'scholarships', title: 'Стипендии и меры поддержки обучающихся', shortTitle: 'Стипендии и меры поддержки об...' },
  { id: 'international', title: 'Международное сотрудничество' },
  { id: 'catering', title: 'Организация питания в образовательной организации', shortTitle: 'Организация питания в образоват...' },
];

function PdfRow({ name }: { name: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 0', borderBottom:'1px solid #F0F0F0' }}>
      <div style={{ flexShrink:0, width:40, height:40, borderRadius:8, background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:10, fontWeight:700, color:'#6B7280', letterSpacing:0.5 }}>PDF</span>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:15, color:'#111', fontWeight:400 }}>{name}</div>
        <div style={{ fontSize:13, color:'#9CA3AF', marginTop:2 }}>224 мб</div>
      </div>
      <button onClick={() => {
        const blob = new Blob([`Документ: ${name}\n\nДемо-файл для проверки скачивания.`], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }} style={{ flexShrink:0, width:36, height:36, borderRadius:8, border:'1px solid #E5E7EB', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
    </div>
  );
}

function SectionContent({ id }: { id: string }) {
  const h1 = { fontSize:32, fontWeight:700, color:'#111', margin:'0 0 32px', lineHeight:1.2 } as const;
  const h2 = { fontSize:20, fontWeight:700, color:'#111', margin:'32px 0 12px', lineHeight:1.3 } as const;
  const p  = { fontSize:15, color:'#374151', lineHeight:1.7, margin:'0 0 10px' } as const;

  if (id === 'privacy') return (
    <div>
      <h1 style={h1}>Политика конфиденциальности</h1>
      <h2 style={h2}>1. Общие положения</h2>
      <p style={p}>Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. № 152-ФЗ «О персональных данных» (далее — Закон о персональных данных) и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые УТЦ "Воевода" (далее — Оператор).</p>
      <p style={p}>1.1. Оператор ставит своей важнейшей целью и условием осуществления своей деятельности соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в том числе защиты прав на неприкосновенность частной жизни, личную и семейную тайну.</p>
      <p style={p}>1.2. Настоящая политика Оператора в отношении обработки персональных данных (далее — Политика) применяется ко всей информации, которую Оператор может получить о посетителях веб-сайта https://voevoda.ru/.</p>
      <h2 style={h2}>2. Основные понятия, используемые в политике</h2>
      <p style={p}>2.1. Автоматизированная обработка персональных данных — обработка персональных данных с помощью средств вычислительной техники.</p>
      <p style={p}>2.2. Блокирование персональных данных — временное прекращение обработки персональных данных (за исключением случаев, если обработка необходима для уточнения персональных данных).</p>
      <p style={p}>2.3. Веб-сайт — совокупность графических и информационных материалов, а также программ для ЭВМ и баз данных, обеспечивающих их доступность в сети интернет по сетевому адресу https://voevoda.ru/.</p>
      <p style={p}>2.4. Информационная система персональных данных — совокупность содержащихся в базах данных персональных данных и обеспечивающих их обработку информационных технологий и технических средств.</p>
      <h2 style={h2}>3. Основные права и обязанности Оператора</h2>
      <p style={p}>3.1. Оператор имеет право получать от субъекта персональных данных достоверную информацию и/или документы, содержащие персональные данные.</p>
      <p style={p}>3.2. В случае отзыва субъектом персональных данных согласия на обработку персональных данных Оператор вправе продолжить обработку персональных данных без согласия субъекта персональных данных при наличии оснований, указанных в Законе о персональных данных.</p>
      <p style={p}>3.3. Оператор обязан в тридцатидневный срок с даты поступления обращения или запроса субъекта персональных данных направить ему ответ.</p>
    </div>
  );

  if (id === 'agreement') return (
    <div>
      <h1 style={h1}>Соглашение</h1>
      <h2 style={h2}>Пользовательское соглашение</h2>
      <p style={p}>Настоящее Пользовательское соглашение регулирует отношения между УТЦ «Воевода» и пользователями информационного ресурса — порталом voevoda.ru.</p>
      <p style={p}>Использование Портала означает полное и безоговорочное принятие настоящего Соглашения и указанных в нём условий использования Портала.</p>
      <h2 style={h2}>1. Предмет соглашения</h2>
      <p style={p}>1.1. Администрация предоставляет пользователю право пользования Порталом в соответствии с его функциональным назначением.</p>
      <p style={p}>1.2. Портал предназначен для обеспечения образовательной деятельности, включая размещение учебных материалов, прохождение курсов военной и тактической подготовки.</p>
    </div>
  );

  if (id === 'intellectual') return (
    <div>
      <h1 style={h1}>Интеллектуальная собственность</h1>
      <h2 style={h2}>Права на контент Портала</h2>
      <p style={p}>Весь контент, размещённый на Портале «Воевода», включая тексты, изображения, видеоматериалы, учебные программы, логотипы и иные объекты, является собственностью ООО ВПТЦ «ВОЕВОДА» или используется на основании соответствующих лицензий.</p>
      <p style={p}>Запрещается воспроизведение, распространение, публичный показ, переработка или иное использование содержимого Портала без письменного согласия правообладателя.</p>
      <h2 style={h2}>Использование материалов</h2>
      <p style={p}>Пользователи Портала вправе использовать размещённые материалы исключительно в личных некоммерческих целях в рамках образовательного процесса.</p>
    </div>
  );

  if (id === 'admin-rights') return (
    <div>
      <h1 style={h1}>Права администрации</h1>
      <h2 style={h2}>Полномочия администрации портала</h2>
      <p style={p}>Администрация Портала «Воевода» оставляет за собой право вносить изменения в настоящие правила, а также в любое время изменять, удалять или дополнять контент Портала без предварительного уведомления пользователей.</p>
      <p style={p}>Администрация вправе без объяснения причин удалять аккаунты пользователей, нарушающих правила Портала.</p>
      <h2 style={h2}>Ограничение ответственности</h2>
      <p style={p}>Администрация не несёт ответственности за содержимое материалов, размещённых пользователями.</p>
    </div>
  );

  if (id === 'terms') return (
    <div>
      <h1 style={h1}>Условия использования</h1>
      <h2 style={h2}>Общие условия</h2>
      <p style={p}>Доступ к Порталу предоставляется пользователям на условиях, изложенных в настоящем документе.</p>
      <p style={p}>Используя Портал, вы подтверждаете своё согласие с настоящими условиями в полном объёме.</p>
      <h2 style={h2}>Регистрация и доступ</h2>
      <p style={p}>Для получения доступа к функциям Портала пользователь обязан пройти процедуру регистрации, указав достоверные персональные данные.</p>
    </div>
  );

  if (id === 'basic-info') return (
    <div>
      <h1 style={h1}>Основные сведения</h1>
      <h2 style={h2}>Сведения об образовательной организации</h2>
      <p style={p}><strong>Полное наименование:</strong> Общество с ограниченной ответственностью Военно-патриотический тренировочный центр «ВОЕВОДА»</p>
      <p style={p}><strong>Сокращённое наименование:</strong> ООО ВПТЦ «ВОЕВОДА»</p>
      <p style={p}><strong>ИНН:</strong> 7713799300</p>
      <p style={p}><strong>Дата создания:</strong> 2018 год</p>
      <p style={p}><strong>Место нахождения:</strong> г. Москва</p>
      <p style={p}><strong>Режим работы:</strong> Пн–Пт: 09:00–18:00, Сб–Вс: по расписанию занятий</p>
      <p style={p}><strong>Контактный телефон:</strong> +7 (495) 000-00-00</p>
      <p style={p}><strong>Адрес электронной почты:</strong> info@voevoda.ru</p>
      <p style={p}><strong>Адрес официального сайта:</strong> https://voevoda.ru/</p>
    </div>
  );

  if (id === 'structure') return (
    <div>
      <h1 style={h1}>Структура и органы управления образовательной организацией</h1>
      <h2 style={h2}>Органы управления</h2>
      <p style={p}>Управление ООО ВПТЦ «ВОЕВОДА» осуществляется в соответствии с законодательством Российской Федерации и Уставом организации.</p>
      <div style={{ margin:'24px 0', overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead>
            <tr style={{ background:'#F9FAFB' }}>
              {['Должность','ФИО','Полномочия'].map(h=>(
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', borderBottom:'1px solid #E5E7EB', fontWeight:600, color:'#374151' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Генеральный директор','Иванов Иван Иванович','Общее руководство деятельностью организации'],
              ['Заместитель директора по учебной работе','Петров Пётр Петрович','Организация образовательного процесса'],
              ['Главный инструктор','Сидоров Сидор Сидорович','Методическое руководство учебными курсами'],
            ].map((row,i)=>(
              <tr key={i} style={{ borderBottom:'1px solid #F0F0F0' }}>
                {row.map((cell,j)=>(
                  <td key={j} style={{ padding:'14px 16px', color:'#374151' }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', margin:'24px 0' }}>
        {['/prikaz.png','/prikaz.png','/prikaz.png'].map((src,i)=>(
          <div key={i} style={{ width:180, border:'3px solid #375DFB', borderRadius:8, overflow:'hidden' }}>
            <img src={src} alt="" style={{ width:'100%', display:'block' }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}} />
          </div>
        ))}
      </div>
    </div>
  );

  if (id === 'documents') return (
    <div>
      <h1 style={h1}>Документы</h1>
      <h2 style={h2}>Учредительные и регистрационные документы</h2>
      <PdfRow name="Устав ООО ВПТЦ «ВОЕВОДА»" />
      <PdfRow name="Свидетельство о государственной регистрации" />
      <PdfRow name="Свидетельство о постановке на налоговый учёт" />
      <h2 style={h2}>Лицензии и разрешения</h2>
      <PdfRow name="Лицензия на осуществление образовательной деятельности" />
      <PdfRow name="Программа развития образовательной организации" />
    </div>
  );

  if (id === 'education') return (
    <div>
      <h1 style={h1}>Образование</h1>
      <h2 style={h2}>Реализуемые образовательные программы</h2>
      <p style={p}>ООО ВПТЦ «ВОЕВОДА» реализует дополнительные образовательные программы в области военно-тактической и физической подготовки.</p>
      <PdfRow name="Курс молодого бойца (КМБ)" />
      <PdfRow name="Разведывательно-штурмовая подготовка" />
      <PdfRow name="Курс командира отделения" />
      <PdfRow name="Общевойсковой снайпер" />
      <PdfRow name="Ускоренная военная подготовка" />
    </div>
  );

  if (id === 'management') return (
    <div>
      <h1 style={h1}>Руководство</h1>
      <h2 style={h2}>Руководящий состав</h2>
      <p style={p}>Руководство ООО ВПТЦ «ВОЕВОДА» осуществляется опытными специалистами в области военной подготовки и образовательной деятельности.</p>
      <PdfRow name="Сведения о руководителе организации" />
      <PdfRow name="Сведения о заместителях руководителя" />
    </div>
  );

  if (id === 'teaching-staff') return (
    <div>
      <h1 style={h1}>Педагогический состав</h1>
      <h2 style={h2}>Инструкторы и преподаватели</h2>
      <p style={p}>Обучение в УТЦ «Воевода» проводят опытные инструкторы — ветераны спецназа и ЧВК с боевым опытом.</p>
      <div style={{ display:'flex', flexDirection:'column', gap:16, marginTop:24 }}>
        {[
          { name:'Александр Р.', callsign:'Торнадо', role:'Главный инструктор', exp:'Ветеран спецназа, 15 лет опыта', photo:'/teacher1-main.jpg' },
          { name:'Владислав А.', callsign:'Стрелок', role:'Инструктор по огневой подготовке', exp:'Снайпер ВС РФ, 12 лет опыта', photo:'/teacher2-main.jpg' },
          { name:'Виктор В.', callsign:'Танк', role:'Инструктор по тактической подготовке', exp:'Ветеран ЧВК, 10 лет опыта', photo:'/teacher3-main.jpg' },
        ].map((t,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'16px', border:'1px solid #E5E7EB', borderRadius:12, background:'#FAFAFA' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#E5E7EB', flexShrink:0, overflow:'hidden' }}>
              <img src={t.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}} />
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:'#111' }}>{t.name} <span style={{ fontSize:13, color:'#9CA3AF', fontWeight:400 }}>({t.callsign})</span></div>
              <div style={{ fontSize:14, color:'#375DFB', fontWeight:500 }}>{t.role}</div>
              <div style={{ fontSize:13, color:'#6B7280' }}>{t.exp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (id === 'material') return (
    <div>
      <h1 style={h1}>Материально-техническое обеспечение и оснащённость</h1>
      <h2 style={h2}>Учебно-материальная база</h2>
      <p style={p}>Учебный центр располагает современной материально-технической базой, необходимой для проведения теоретических и практических занятий по военной и тактической подготовке.</p>
      <h2 style={h2}>Полигоны и учебные площадки</h2>
      <p style={p}>Для проведения практических занятий используются специализированные полигоны, оснащённые необходимым оборудованием для отработки тактических приёмов и огневой подготовки.</p>
      <PdfRow name="Сведения о материально-техническом обеспечении" />
    </div>
  );

  if (id === 'paid-services') return (
    <div>
      <h1 style={h1}>Платные образовательные услуги</h1>
      <h2 style={h2}>Перечень платных услуг</h2>
      <p style={p}>ООО ВПТЦ «ВОЕВОДА» оказывает платные образовательные услуги на основании договора об образовании, заключаемого с каждым обучающимся.</p>
      <div style={{ margin:'24px 0', overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead>
            <tr style={{ background:'#F9FAFB' }}>
              {['Наименование услуги','Стоимость','Продолжительность'].map(h=>(
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', borderBottom:'1px solid #E5E7EB', fontWeight:600, color:'#374151' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Курс молодого бойца V5','35 000 ₽','3 месяца'],
              ['Разведывательно-штурмовая подготовка','42 000 ₽','3 месяца'],
              ['Курс командира отделения','38 000 ₽','2 месяца'],
              ['Общевойсковой снайпер','45 000 ₽','4 месяца'],
            ].map((row,i)=>(
              <tr key={i} style={{ borderBottom:'1px solid #F0F0F0' }}>
                {row.map((cell,j)=>(
                  <td key={j} style={{ padding:'14px 16px', color:'#374151' }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PdfRow name="Договор об оказании платных образовательных услуг" />
    </div>
  );

  if (id === 'financial') return (
    <div>
      <h1 style={h1}>Финансово-хозяйственная деятельность</h1>
      <p style={p}>В соответствии с требованиями законодательства об образовании, ООО ВПТЦ «ВОЕВОДА» обеспечивает открытость и доступность информации о финансово-хозяйственной деятельности организации.</p>
      <p style={p}>а) о поступлении финансовых и материальных средств по итогам финансового года;</p>
      <p style={p}>б) о расходовании финансовых и материальных средств по итогам финансового года.</p>
      <div style={{ margin:'24px 0', border:'1px solid #E5E7EB', borderRadius:8, overflow:'hidden' }}>
        <img src="/plan.png" alt="План финансово-хозяйственной деятельности" style={{ width:'100%', display:'block', maxHeight:480, objectFit:'contain', background:'#F9FAFB' }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}} />
      </div>
      <p style={p}>План финансово-хозяйственной деятельности образовательной организации</p>
    </div>
  );

  if (id === 'vacancies') return (
    <div>
      <h1 style={h1}>Вакантные места для приёма (перевода)</h1>
      <p style={p}>Информация о вакантных местах для приёма (перевода) обучающихся по каждой образовательной программе, профессии, специальности с указанием формы обучения и условий приёма.</p>
      <div style={{ margin:'24px 0', overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead>
            <tr style={{ background:'#F9FAFB' }}>
              {['Образовательная программа','Форма обучения','Вакантных мест'].map(h=>(
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', borderBottom:'1px solid #E5E7EB', fontWeight:600, color:'#374151' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['«Курс молодого бойца»','Очная','15'],
              ['«Разведывательно-штурмовая подготовка»','Очная','10'],
              ['«Курс командира отделения»','Очная','8'],
              ['«Общевойсковой снайпер»','Очная','6'],
            ].map((row,i)=>(
              <tr key={i} style={{ borderBottom:'1px solid #F0F0F0' }}>
                {row.map((cell,j)=>(
                  <td key={j} style={{ padding:'14px 16px', color:'#374151' }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (id === 'scholarships') return (
    <div>
      <h1 style={h1}>Стипендии и меры поддержки обучающихся</h1>
      <p style={p}>В ООО ВПТЦ «ВОЕВОДА» предусмотрены следующие меры поддержки обучающихся:</p>
      <h2 style={h2}>Льготы и скидки</h2>
      <ul style={{ paddingLeft:20, margin:'0 0 16px' }}>
        <li style={{ fontSize:15, color:'#374151', lineHeight:1.7, marginBottom:4 }}>Скидка 10% для участников боевых действий и ветеранов</li>
        <li style={{ fontSize:15, color:'#374151', lineHeight:1.7, marginBottom:4 }}>Скидка 5% при оплате за несколько курсов сразу</li>
        <li style={{ fontSize:15, color:'#374151', lineHeight:1.7, marginBottom:4 }}>Рассрочка платежа на срок до 6 месяцев</li>
      </ul>
      <h2 style={h2}>Партнёрская программа</h2>
      <p style={p}>Обучающиеся могут участвовать в партнёрской программе и получать бонусные рубли за привлечение новых участников.</p>
    </div>
  );

  if (id === 'international') return (
    <div>
      <h1 style={h1}>Международное сотрудничество</h1>
      <p style={p}>ООО ВПТЦ «ВОЕВОДА» осуществляет международное сотрудничество в сфере образования и подготовки специалистов.</p>
      <h2 style={h2}>Направления сотрудничества</h2>
      <p style={p}>В рамках международного взаимодействия организация развивает контакты с образовательными учреждениями государств — участников СНГ (Беларусь, Казахстан и другие) в области обмена методическими материалами и опытом подготовки специалистов.</p>
    </div>
  );

  if (id === 'catering') return (
    <div>
      <h1 style={h1}>Организация питания в образовательной организации</h1>
      <p style={p}>Специализированное структурное образовательное подразделение ООО ВПТЦ «ВОЕВОДА» не организует питание обучающихся непосредственно в учебном заведении.</p>
      <p style={p}>В непосредственной близости от учебного центра расположены объекты общественного питания, в которых обучающиеся могут получить горячее питание во время перерывов.</p>
      <p style={p}>При проведении выездных практических занятий питание обучающихся организуется организаторами мероприятия в соответствии с программой подготовки.</p>
    </div>
  );

  const section = SECTIONS.find(s => s.id === id);
  return (
    <div>
      <h1 style={h1}>{section?.title || 'Раздел'}</h1>
      <p style={p}>Информация по разделу доступна в открытых документах портала. Для уточнения реквизитов и формулировок обратитесь в поддержку или к ответственному менеджеру.</p>
    </div>
  );
}

export function Documents() {
  const [active, setActive] = useState('privacy');

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />
      <Sidebar />

      {/*
        Ключевое исправление:
        - marginTop: 60  → контент не уходит под фиксированный Header (height: 60px)
        - marginLeft: 260 → контент не уходит под фиксированный Sidebar (width: 260px)
        Оба значения должны совпадать с реальными размерами Header и Sidebar.
      */}
      <div style={{
        marginTop: 60,
        marginLeft: 260,
        display: 'flex',
        minHeight: 'calc(100vh - 60px)',
      }}>

        {/* Левая навигация по разделам */}
        <div style={{
          width: 280,
          flexShrink: 0,
          borderRight: '1px solid #F0F0F0',
          paddingTop: 16,
          paddingBottom: 32,
          overflowY: 'auto',
          height: 'calc(100vh - 60px)',
          position: 'sticky',
          top: 60,
        }}>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 20px',
                background: active === s.id ? '#F3F4FF' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                color: active === s.id ? '#375DFB' : '#374151',
                fontWeight: active === s.id ? 600 : 400,
                borderLeft: active === s.id ? '3px solid #375DFB' : '3px solid transparent',
                lineHeight: 1.4,
              }}
            >
              {s.shortTitle || s.title}
            </button>
          ))}
        </div>

        {/* Основной контент */}
        <div style={{
          flex: 1,
          padding: '40px 60px',
          overflowY: 'auto',
          maxWidth: 900,
        }}>
          <SectionContent id={active} />
        </div>

      </div>
    </div>
  );
}
