'use client';
import {useMemo,useState} from 'react';

type Lead={id:number,name:string,phone:string,course:string,status:string,source:string,next:string};
type Student={id:number,name:string,phone:string,course:string,batch:string,paid:number,fee:number,attendance:number};

const courses=[
 {name:"5 Days Basic AI Class",fee:999,color:"blue"},
 {name:"12 Days Complete Masterclass",fee:3999,color:"violet"}
];

const initialLeads:Lead[]=[
 {id:1,name:"Aarav Sharma",phone:"98XXXXXXXX",course:"5 Days Basic AI Class",status:"New",source:"Facebook Ads",next:"Today"},
 {id:2,name:"Sita Thapa",phone:"97XXXXXXXX",course:"12 Days Complete Masterclass",status:"Interested",source:"WhatsApp",next:"Today"},
 {id:3,name:"Rohan Yadav",phone:"98XXXXXXXX",course:"5 Days Basic AI Class",status:"Follow-up",source:"Walk-in",next:"Tomorrow"},
 {id:4,name:"Nisha KC",phone:"96XXXXXXXX",course:"12 Days Complete Masterclass",status:"Enrolled",source:"Instagram",next:"—"}
];
const initialStudents:Student[]=[
 {id:1,name:"Prakash Rai",phone:"98XXXXXXXX",course:"5 Days Basic AI Class",batch:"AI-0826-A",paid:999,fee:999,attendance:100},
 {id:2,name:"Anisha Gurung",phone:"97XXXXXXXX",course:"12 Days Complete Masterclass",batch:"MC-0826-A",paid:2500,fee:3999,attendance:92},
 {id:3,name:"Suman Shah",phone:"98XXXXXXXX",course:"5 Days Basic AI Class",batch:"AI-0826-A",paid:999,fee:999,attendance:80}
];

export default function Home(){
 const [page,setPage]=useState("Dashboard");
 const [leads,setLeads]=useState(initialLeads);
 const [students]=useState(initialStudents);
 const [search,setSearch]=useState("");
 const [showLead,setShowLead]=useState(false);
 const [toast,setToast]=useState("");
 const [newLead,setNewLead]=useState({name:"",phone:"",course:"5 Days Basic AI Class",source:"Facebook Ads"});
 const filtered=useMemo(()=>leads.filter(x=>(x.name+x.phone+x.course).toLowerCase().includes(search.toLowerCase())),[leads,search]);
 const enrolled=students.length;
 const revenue=students.reduce((a,s)=>a+s.paid,0);
 const pending=students.reduce((a,s)=>a+(s.fee-s.paid),0);
 function addLead(){
   if(!newLead.name||!newLead.phone)return;
   setLeads(v=>[{id:Date.now(),...newLead,status:"New",next:"Today"},...v]);
   setShowLead(false); setNewLead({name:"",phone:"",course:"5 Days Basic AI Class",source:"Facebook Ads"});
   setToast("Lead added successfully"); setTimeout(()=>setToast(""),2500);
 }
 return <div className="app">
  <aside className="sidebar">
   <div className="brand"><div className="brandmark">U</div><div><b>UNIQ TURN</b><span>CRM</span></div></div>
   <div className="location">CTC Mall · Sundhara, Kathmandu</div>
   <nav>{["Dashboard","Leads","Students","Courses","Batches","Payments","Follow-ups","Attendance","Certificates","Reports"].map(x=><button key={x} className={page===x?"nav active":"nav"} onClick={()=>setPage(x)}><span>{icon(x)}</span>{x}</button>)}</nav>
   <div className="sidebarBottom"><div className="avatar">A</div><div><b>Admin</b><small>Administrator</small></div><button className="dots">•••</button></div>
  </aside>
  <main className="main">
   <header><div><h1>{page}</h1><p>{page==="Dashboard"?"Business overview and today's activity":"Manage your "+page.toLowerCase()}</p></div><div className="headActions"><button className="wa" onClick={()=>window.open("https://wa.me/9779746585111","_blank")}>WhatsApp</button><button className="primary" onClick={()=>setShowLead(true)}>+ Add Lead</button></div></header>
   {page==="Dashboard" && <Dashboard enrolled={enrolled} revenue={revenue} pending={pending} leads={leads} setPage={setPage}/>}
   {page==="Leads" && <Leads leads={filtered} search={search} setSearch={setSearch} setShowLead={setShowLead}/>}
   {page==="Students" && <Students students={students}/>}
   {page==="Courses" && <Courses/>}
   {page==="Batches" && <Batches/>}
   {page==="Payments" && <Payments students={students}/>}
   {page==="Follow-ups" && <Followups leads={leads}/>}
   {page==="Attendance" && <Attendance students={students}/>}
   {page==="Certificates" && <Certificates students={students}/>}
   {page==="Reports" && <Reports leads={leads} students={students}/>}
   {page!=="Dashboard"&&page!=="Leads"&&page!=="Students"&&page!=="Courses"&&page!=="Batches"&&page!=="Payments"&&page!=="Follow-ups"&&page!=="Attendance"&&page!=="Certificates"&&page!=="Reports"&&null}
  </main>
  {showLead&&<div className="modalWrap"><div className="modal"><div className="modalHead"><h2>Add New Lead</h2><button onClick={()=>setShowLead(false)}>×</button></div><label>Name<input value={newLead.name} onChange={e=>setNewLead({...newLead,name:e.target.value})}/></label><label>Phone / WhatsApp<input value={newLead.phone} onChange={e=>setNewLead({...newLead,phone:e.target.value})}/></label><label>Course<select value={newLead.course} onChange={e=>setNewLead({...newLead,course:e.target.value})}>{courses.map(c=><option key={c.name}>{c.name}</option>)}</select></label><label>Lead source<select value={newLead.source} onChange={e=>setNewLead({...newLead,source:e.target.value})}><option>Facebook Ads</option><option>Instagram</option><option>WhatsApp</option><option>Walk-in</option><option>Referral</option><option>Website</option></select></label><button className="primary full" onClick={addLead}>Create Lead</button></div></div>}
  {toast&&<div className="toast">{toast}</div>}
 </div>
}

function Dashboard({enrolled,revenue,pending,leads,setPage}:any){return <div>
 <div className="cards"><Card title="New Leads" value={leads.filter((x:Lead)=>x.status==="New").length} sub="+12% this week"/><Card title="Follow-ups Today" value={leads.filter((x:Lead)=>x.next==="Today").length} sub="Needs attention"/><Card title="Enrolled Students" value={enrolled} sub="Active enrollments"/><Card title="Pending Payments" value={"Rs. "+pending.toLocaleString()} sub="Outstanding balance"/></div>
 <div className="grid2"><section className="panel"><div className="panelTitle"><h2>Course Overview</h2><button onClick={()=>setPage("Courses")}>View all</button></div>{courses.map(c=><div className="courseRow" key={c.name}><div className={"courseIcon "+c.color}>AI</div><div className="grow"><b>{c.name}</b><small>Current active course</small></div><strong>Rs. {c.fee.toLocaleString()}</strong></div>)}</section>
 <section className="panel"><div className="panelTitle"><h2>Recent Leads</h2><button onClick={()=>setPage("Leads")}>View all</button></div>{leads.slice(0,4).map((l:Lead)=><div className="leadRow" key={l.id}><div className="avatar sm">{l.name[0]}</div><div className="grow"><b>{l.name}</b><small>{l.course}</small></div><Status s={l.status}/></div>)}</section></div>
 <section className="panel"><div className="panelTitle"><h2>Lead Conversion Funnel</h2></div><div className="funnel">{["New","Contacted","Interested","Follow-up","Enrolled"].map((x,i)=><div key={x} className="funnelItem"><div className="funnelBar" style={{width:`${100-i*17}%`}}></div><span>{x}</span><b>{leads.filter((l:Lead)=>l.status===x).length}</b></div>)}</div></section>
 </div>}
function Card({title,value,sub}:any){return <div className="stat"><small>{title}</small><strong>{value}</strong><span>{sub}</span></div>}
function Leads({leads,search,setSearch,setShowLead}:any){return <section className="panel"><div className="toolbar"><input className="search" placeholder="Search name, phone or course..." value={search} onChange={e=>setSearch(e.target.value)}/><button className="primary" onClick={()=>setShowLead(true)}>+ Add Lead</button></div><Table headers={["Lead","Course","Source","Status","Next Follow-up",""]} rows={leads.map((l:Lead)=><tr key={l.id}><td><b>{l.name}</b><small>{l.phone}</small></td><td>{l.course}</td><td>{l.source}</td><td><Status s={l.status}/></td><td>{l.next}</td><td><button className="link">View</button></td></tr>)}/></section>}
function Students({students}:any){return <section className="panel"><div className="toolbar"><input className="search" placeholder="Search students..."/><button className="primary">+ Enroll Student</button></div><Table headers={["Student","Course","Batch","Paid","Balance","Attendance"]} rows={students.map((s:Student)=><tr key={s.id}><td><b>{s.name}</b><small>{s.phone}</small></td><td>{s.course}</td><td>{s.batch}</td><td>Rs. {s.paid.toLocaleString()}</td><td className={s.fee-s.paid?"danger":"success"}>Rs. {(s.fee-s.paid).toLocaleString()}</td><td>{s.attendance}%</td></tr>)}/></section>}
function Courses(){return <div className="courseGrid">{courses.map(c=><section className="panel courseCard" key={c.name}><div className={"courseIcon big "+c.color}>AI</div><h2>{c.name}</h2><p>Professional AI training course</p><div className="price">Rs. {c.fee.toLocaleString()}</div><div className="miniStats"><span>Duration<strong>{c.name.startsWith("5")?"5":"12"} Days</strong></span><span>Status<strong className="success">Active</strong></span></div></section>)}</div>}
function Batches(){return <section className="panel"><div className="toolbar"><div><h2>Active Batches</h2><small>Manage schedules and seats</small></div><button className="primary">+ Create Batch</button></div><Table headers={["Batch","Course","Schedule","Trainer","Seats","Status"]} rows={[["AI-0826-A","5 Days Basic AI Class","Aug 25–29 · 8:00 PM","Trainer 1","24 / 30","Active"],["MC-0826-A","12 Days Complete Masterclass","Sep 1–12 · 7:30 PM","Trainer 1","18 / 25","Upcoming"]].map((r,i)=><tr key={i}><td><b>{r[0]}</b></td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td><Status s={r[5]}/></td></tr>)}/></section>}
function Payments({students}:any){return <section className="panel"><div className="cards inner"><Card title="Collected" value={"Rs. "+students.reduce((a:number,s:Student)=>a+s.paid,0).toLocaleString()} sub="Current sample data"/><Card title="Outstanding" value={"Rs. "+students.reduce((a:number,s:Student)=>a+s.fee-s.paid,0).toLocaleString()} sub="Needs collection"/></div><Table headers={["Student","Course","Total Fee","Paid","Balance","Status"]} rows={students.map((s:Student)=><tr key={s.id}><td><b>{s.name}</b></td><td>{s.course}</td><td>Rs. {s.fee.toLocaleString()}</td><td>Rs. {s.paid.toLocaleString()}</td><td>Rs. {(s.fee-s.paid).toLocaleString()}</td><td><Status s={s.fee===s.paid?"Paid":"Partial"}/></td></tr>)}/></section>}
function Followups({leads}:any){return <section className="panel"><div className="panelTitle"><h2>Today's Follow-ups</h2><span>{leads.filter((l:Lead)=>l.next==="Today").length} due</span></div>{leads.filter((l:Lead)=>l.next==="Today").map((l:Lead)=><div className="followRow" key={l.id}><div className="avatar sm">{l.name[0]}</div><div className="grow"><b>{l.name}</b><small>{l.phone} · {l.course}</small></div><button className="wa" onClick={()=>window.open("https://wa.me/977"+l.phone.replace(/\D/g,""),"_blank")}>WhatsApp</button><button className="primary">Complete</button></div>)}</section>}
function Attendance({students}:any){return <section className="panel"><div className="panelTitle"><h2>Attendance</h2><button className="primary">Mark Attendance</button></div><Table headers={["Student","Course","Batch","Attendance","Today"]} rows={students.map((s:Student)=><tr key={s.id}><td><b>{s.name}</b></td><td>{s.course}</td><td>{s.batch}</td><td>{s.attendance}%</td><td><select><option>Present</option><option>Absent</option><option>Late</option></select></td></tr>)}/></section>}
function Certificates({students}:any){return <section className="panel"><div className="panelTitle"><h2>Certificates</h2><button className="primary">+ Issue Certificate</button></div><Table headers={["Student","Course","Status","Certificate No.","Action"]} rows={students.map((s:Student,i:number)=><tr key={s.id}><td><b>{s.name}</b></td><td>{s.course}</td><td><Status s={i===0?"Issued":"Pending"}/></td><td>{i===0?"UT-AI-2026-001":"—"}</td><td><button className="link">{i===0?"Download":"Issue"}</button></td></tr>)}/></section>}
function Reports({leads,students}:any){let total=leads.length,conv=leads.filter((l:Lead)=>l.status==="Enrolled").length;return <div className="cards"><Card title="Total Leads" value={total} sub="Current records"/><Card title="Conversion Rate" value={total?Math.round(conv/total*100)+"%":"0%"} sub="Lead → enrolled"/><Card title="Students" value={students.length} sub="Current records"/><Card title="Revenue" value={"Rs. "+students.reduce((a:number,s:Student)=>a+s.paid,0).toLocaleString()} sub="Collected"/></div>}
function Table({headers,rows}:any){return <div className="tableWrap"><table><thead><tr>{headers.map((h:string)=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows}</tbody></table></div>}
function Status({s}:{s:string}){return <span className={"status "+s.toLowerCase().replace(/[^a-z]/g,"")}>{s}</span>}
function icon(x:string){return ({Dashboard:"⌂",Leads:"◎",Students:"♙",Courses:"▣",Batches:"▦",Payments:"◫","Follow-ups":"◷",Attendance:"✓",Certificates:"▤",Reports:"◒"} as any)[x]||"•"}
