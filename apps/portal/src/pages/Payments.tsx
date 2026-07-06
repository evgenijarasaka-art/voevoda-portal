import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPaymentOrders, type PaymentOrder } from '../api/payments';
import { PortalBreadcrumb } from '../components/PortalBreadcrumb';

const ANIM = `
@keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0}to{opacity:1} }
.pc{animation:fadeUp .3s ease both}
.pc:nth-child(2){animation-delay:.06s}
.pc:nth-child(3){animation-delay:.12s}
.prow:hover{background:#F8FAFF!important}
.pbtn:hover{background:#E5E7EB!important}
`;

type PayStatus = 'success' | 'pending' | 'failed';
type PayKind = 'course' | 'product' | 'deposit' | 'bonus';

interface Payment {
  id: number;
  title: string;
  subtitle: string;
  kind: PayKind;
  status: PayStatus;
  amount: number;
  date: string;
  method: string;
  orderId: string;
}

const ALL_PAYMENTS: Payment[] = [
  { id:1, title:'Курс Молодого Бойца V5', subtitle:'Обучение • Старт 10 апр', kind:'course', status:'success', amount:4900, date:'12 апр 2025', method:'Visa •••• 4242', orderId:'#ORD-00112' },
  { id:2, title:'Тактическая медицина для бойца', subtitle:'Обучение • Старт 1 апр', kind:'course', status:'success', amount:3200, date:'1 апр 2025', method:'МИР •••• 8877', orderId:'#ORD-00098' },
  { id:3, title:'Кобура ТТ', subtitle:'Каптёрка • Коричневый, СССР', kind:'product', status:'success', amount:500, date:'8 апр 2025', method:'СБП', orderId:'#ORD-00105' },
  { id:4, title:'Ускоренная военная подготовка', subtitle:'Обучение • Старт 15 мар', kind:'course', status:'success', amount:6100, date:'15 мар 2025', method:'Visa •••• 4242', orderId:'#ORD-00087' },
  { id:5, title:'Планшет полевой офицерский', subtitle:'Каптёрка • 340×150, Коричневый', kind:'product', status:'pending', amount:1600, date:'20 апр 2025', method:'Оплата не завершена', orderId:'#ORD-00120' },
  { id:6, title:'Разведывательно-штурмовая подготовка', subtitle:'Обучение • Старт 2 мар', kind:'course', status:'failed', amount:8500, date:'28 мар 2025', method:'Visa •••• 4242', orderId:'#ORD-00091' },
  { id:7, title:'Курс выживания в полевых условиях', subtitle:'Обучение • Старт 1 мая', kind:'course', status:'success', amount:5400, date:'25 апр 2025', method:'МИР •••• 8877', orderId:'#ORD-00130' },
  { id:8, title:'Берцы тактические', subtitle:'Военмаркет • р.42, Чёрный', kind:'product', status:'success', amount:4800, date:'18 апр 2025', method:'СБП', orderId:'#ORD-00115' },
];

const STATUS_CFG: Record<PayStatus, { label:string; bg:string; color:string }> = {
  success: { label:'Оплачено',   bg:'#F0FDF4', color:'#10B981' },
  pending: { label:'В обработке', bg:'#FFF7ED', color:'#F59E0B' },
  failed:  { label:'Ошибка',     bg:'#FEF2F2', color:'#EF4444' },
};

const KIND_CFG: Record<PayKind, { bg:string; color:string; icon:React.ReactNode }> = {
  course:  { bg:'#EBF1FF', color:'#375DFB', icon:<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></> },
  product: { bg:'#F0FDF4', color:'#10B981', icon:<><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></> },
  deposit: { bg:'#F0F9FF', color:'#0EA5E9', icon:<><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></> },
  bonus:   { bg:'#FFF7ED', color:'#F59E0B', icon:<><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></> },
};

function PayIcon({ kind }: { kind: PayKind }) {
  const { bg, color, icon } = KIND_CFG[kind];
  return (
    <div style={{ width:44, height:44, borderRadius:12, background:bg, color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">{icon}</svg>
    </div>
  );
}

function orderToPayment(order: PaymentOrder): Payment {
  const firstItem = order.items?.[0];
  const statusMap: Record<PaymentOrder['status'], PayStatus> = {
    new: 'pending',
    pending: 'pending',
    paid: 'success',
    canceled: 'failed',
    failed: 'failed',
  };
  const kind: PayKind = order.purpose === 'wallet_topup'
    ? 'deposit'
    : firstItem?.kind === 'course'
      ? 'course'
      : 'product';
  const title = order.purpose === 'wallet_topup'
    ? 'Пополнение баланса'
    : firstItem?.title || 'Заказ на платформе';
  const subtitle = order.purpose === 'wallet_topup'
    ? 'Кошелек Воеводы'
    : `${firstItem?.kind === 'course' ? 'Обучение' : 'Покупка'}${order.items && order.items.length > 1 ? ` • ${order.items.length} поз.` : ''}`;
  const paidDate = order.paid_at || order.created_at;

  return {
    id: Number(order.id.replace(/\D/g, '').slice(0, 9)) || Date.now(),
    title,
    subtitle,
    kind,
    status: statusMap[order.status],
    amount: Math.round(Number(order.total_amount)),
    date: new Date(paidDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }),
    method: order.yookassa_payment_id ? `ЮKassa • ${order.yookassa_status || order.status}` : 'ЮKassa',
    orderId: `#${order.id.slice(0, 8)}`,
  };
}

export function Payments() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | PayStatus | PayKind>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Payment | null>(null);
  const [payments, setPayments] = useState<Payment[]>(ALL_PAYMENTS);

  useEffect(() => {
    let mounted = true;
    listPaymentOrders()
      .then(orders => {
        if (!mounted || orders.length === 0) return;
        setPayments(orders.map(orderToPayment));
      })
      .catch(() => {
        if (mounted) setPayments(ALL_PAYMENTS);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const visible = payments.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter || p.kind === filter;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.orderId.includes(search);
    return matchFilter && matchSearch;
  });

  const totalPaid = payments.filter(p => p.status === 'success').reduce((s,p) => s + p.amount, 0);
  const totalCount = payments.filter(p => p.status === 'success').length;

  return (
    <div style={{ paddingTop:60, marginLeft:56, minHeight:'100vh', background:'#F8F9FB' }}>
      <style>{ANIM}</style>
      <div style={{ padding:'24px 24px 40px', maxWidth:960, margin:'0 auto' }}>

        <div className="pc" style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            <h1 style={{ fontSize:22, fontWeight:700, color:'#111', margin:0 }}>История платежей</h1>
          </div>
          <PortalBreadcrumb className="compact-breadcrumb" items={[{ label:'Главная', to:'/' }, { label:'Кошелёк', to:'/wallet' }, { label:'Платежи' }]} />
        </div>

        {/* Stats */}
        <div className="pc" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
          {[
            { label:'Всего потрачено', value:`${totalPaid.toLocaleString()} ₽`, icon:'card', bg:'#EBF1FF', color:'#375DFB' },
            { label:'Успешных оплат', value:String(totalCount), icon:'done', bg:'#F0FDF4', color:'#10B981' },
            { label:'В обработке', value:String(payments.filter(p=>p.status==='pending').length), icon:'pending', bg:'#FFF7ED', color:'#F59E0B' },
            { label:'Ошибок', value:String(payments.filter(p=>p.status==='failed').length), icon:'error', bg:'#FEF2F2', color:'#EF4444' },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', borderRadius:16, border:'1px solid #E5E7EB', padding:'16px 18px' }}>
              <div style={{ width:32, height:32, borderRadius:10, background:s.bg, color:s.color, marginBottom:8,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {s.icon === 'card' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>}
                {s.icon === 'done' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                {s.icon === 'pending' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>}
                {s.icon === 'error' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>}
              </div>
              <div style={{ fontSize:20, fontWeight:800, color:s.color, marginBottom:3 }}>{s.value}</div>
              <div style={{ fontSize:11, color:'#9CA3AF' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="pc" style={{ background:'#fff', borderRadius:20, border:'1px solid #E5E7EB' }}>
          {/* Toolbar */}
          <div style={{ padding:'16px 24px', borderBottom:'1px solid #F5F5F7', display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ position:'relative', flex:1, minWidth:200 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск по названию или номеру заказа" style={{ width:'100%', padding:'9px 14px 9px 36px', border:'1px solid #E5E7EB', borderRadius:10, fontSize:13, outline:'none', background:'#F9FAFB', boxSizing:'border-box' as const }} onFocus={e=>(e.target.style.borderColor='#375DFB')} onBlur={e=>(e.target.style.borderColor='#E5E7EB')} />
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {([
                ['all','Все'],['success','Оплачено'],['pending','В обработке'],['failed','Ошибки'],['course','Курсы'],['product','Товары'],
              ] as [typeof filter, string][]).map(([val, lbl]) => (
                <button key={val} onClick={()=>setFilter(val)} className="pbtn"
                  style={{ padding:'7px 14px', border:`1px solid ${filter===val?'#375DFB':'#E5E7EB'}`, borderRadius:8, background: filter===val?'#EBF1FF':'#F9FAFB', fontSize:12, fontWeight: filter===val?600:400, color: filter===val?'#375DFB':'#374151', cursor:'pointer', transition:'all .15s' }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div style={{ padding:'0 24px' }}>
            {visible.length === 0 && (
              <div style={{ padding:'48px 0', textAlign:'center', color:'#9CA3AF', fontSize:14 }}>Ничего не найдено</div>
            )}
            {visible.map((p, i) => {
              const st = STATUS_CFG[p.status];
              return (
                <div key={p.id} onClick={()=>setSelected(p)} className="prow"
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom: i<visible.length-1?'1px solid #F5F5F7':'none', borderRadius:8, margin:'0 -8px', cursor:'pointer', transition:'background .15s' }}>
                  <PayIcon kind={p.kind} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'#111', marginBottom:2 }}>{p.title}</div>
                    <div style={{ fontSize:12, color:'#9CA3AF' }}>{p.subtitle}</div>
                  </div>
                  <div style={{ textAlign:'center', minWidth:80 }}>
                    <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:4 }}>{p.date}</div>
                    <div style={{ fontSize:11, color:'#6B7280' }}>{p.orderId}</div>
                  </div>
                  <div style={{ minWidth:100, textAlign:'right' }}>
                    <div style={{ fontSize:15, fontWeight:700, color:'#111', marginBottom:4 }}>{p.amount.toLocaleString()} ₽</div>
                    <div style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, background:st.bg, color:st.color, fontSize:11, fontWeight:600 }}>{st.label}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div onClick={()=>setSelected(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000, padding:20, animation:'fadeIn .18s ease' }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:460, overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,.3)', animation:'fadeUp .2s ease' }}>
            <div style={{ padding:'18px 24px', borderBottom:'1px solid #F0F0F0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:16, fontWeight:700, color:'#111' }}>Детали платежа</span>
              <button onClick={()=>setSelected(null)} style={{ background:'#F3F4F6', border:'none', width:32, height:32, borderRadius:8, cursor:'pointer', fontSize:18, color:'#6B7280', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
            <div style={{ padding:'24px' }}>
              <div style={{ display:'flex', gap:14, marginBottom:20 }}>
                <PayIcon kind={selected.kind} />
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:'#111', marginBottom:3 }}>{selected.title}</div>
                  <div style={{ fontSize:13, color:'#9CA3AF' }}>{selected.subtitle}</div>
                </div>
              </div>
              {[
                ['Номер заказа', selected.orderId],
                ['Дата', selected.date],
                ['Способ оплаты', selected.method],
                ['Статус', STATUS_CFG[selected.status].label],
                ['Сумма', `${selected.amount.toLocaleString()} ₽`],
              ].map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F5F5F7' }}>
                  <span style={{ fontSize:13, color:'#9CA3AF' }}>{l}</span>
                  <span style={{ fontSize:13, fontWeight:600, color: l==='Сумма'?'#111':l==='Статус'?STATUS_CFG[selected.status].color:'#111' }}>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex', gap:10, marginTop:20 }}>
                {selected.status === 'failed' && (
                  <button onClick={() => navigate('/checkout', { state: { orderId: selected.orderId, title: selected.title, amount: selected.amount } })} style={{ flex:1, padding:'12px 0', background:'#375DFB', border:'none', borderRadius:12, color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer' }}>Повторить оплату</button>
                )}
                <button onClick={()=>setSelected(null)} style={{ flex:1, padding:'12px 0', background:'#F3F4F6', border:'none', borderRadius:12, color:'#374151', fontSize:14, cursor:'pointer' }}>Закрыть</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
