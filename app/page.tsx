'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Users, BookOpen, GraduationCap, DollarSign, PlusCircle, 
  UserPlus, RefreshCw, Trash2, UserCheck
} from 'lucide-react';

export default function CRMDashboard() {
  const [activeTab, setActiveTab] = useState('leads');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [leads, setLeads] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);

  // Modal States
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Form States
  const [newLead, setNewLead] = useState({ name: '', phone: '', source: 'Facebook Ads', status: 'New' });
  const [newBatch, setNewBatch] = useState({ name: '', course_id: '', schedule: '', trainer: '', total_seats: 30 });
  const [newEnrollment, setNewEnrollment] = useState({ name: '', phone: '', course_id: '', batch_id: '', total_fee: 999, paid_amount: 999 });

  // Fetch data including Joined Student info for Payments
  const fetchAllData = async () => {
    setLoading(true);
    const [leadsRes, studentsRes, batchesRes, coursesRes, paymentsRes] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('students').select('*').order('created_at', { ascending: false }),
      supabase.from('batches').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*, students(name)').order('created_at', { ascending: false })
    ]);

    if (leadsRes.data) setLeads(leadsRes.data);
    if (studentsRes.data) setStudents(studentsRes.data);
    if (batchesRes.data) setBatches(batchesRes.data);
    if (coursesRes.data) setCourses(coursesRes.data);
    if (paymentsRes.data) setPayments(paymentsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handlers for Adding Data
  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.phone) return alert('Please enter name and phone');

    const { error } = await supabase.from('leads').insert([newLead]);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      setIsLeadModalOpen(false);
      setNewLead({ name: '', phone: '', source: 'Facebook Ads', status: 'New' });
      fetchAllData();
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!newBatch.name) return alert('Please enter batch name');
    
    const { error } = await supabase.from('batches').insert([newBatch]);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      setIsBatchModalOpen(false);
      setNewBatch({ name: '', course_id: '', schedule: '', trainer: '', total_seats: 30 });
      fetchAllData();
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!newEnrollment.name || !newEnrollment.phone) {
      return alert('Please fill in required fields');
    }

    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([{
        name: newEnrollment.name,
        phone: newEnrollment.phone,
        course_id: newEnrollment.course_id || null,
        batch_id: newEnrollment.batch_id || null
      }])
      .select()
      .single();

    if (studentError) return alert('Student Error: ' + studentError.message);

    const status = Number(newEnrollment.paid_amount) >= Number(newEnrollment.total_fee) ? 'Paid' : 'Partial';
    const { error: paymentError } = await supabase
      .from('payments')
      .insert([{
        student_id: student.id,
        total_fee: newEnrollment.total_fee,
        paid_amount: newEnrollment.paid_amount,
        status: status
      }]);

    if (paymentError) return alert('Payment Error: ' + paymentError.message);

    setIsEnrollModalOpen(false);
    setNewEnrollment({ name: '', phone: '', course_id: '', batch_id: '', total_fee: 999, paid_amount: 999 });
    fetchAllData();
  };

  // Generic Delete Handler
  const handleDelete = async (table, id) => {
    if (!confirm(`Are you sure you want to delete this record?`)) return;

    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      alert('Delete failed: ' + error.message);
    } else {
      fetchAllData();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-sans antialiased tracking-tight">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Uniq Turn CRM</h1>
          <p className="text-neutral-400 text-sm font-normal">Supabase Backend Connected</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsLeadModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <UserCheck className="w-4 h-4" /> Add Lead
          </button>
          <button 
            onClick={() => setIsBatchModalOpen(true)}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <PlusCircle className="w-4 h-4" /> Create Batch
          </button>
          <button 
            onClick={() => setIsEnrollModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <UserPlus className="w-4 h-4" /> Enroll Student
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">Total Leads</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight">{leads.length}</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">Active Batches</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight">{batches.length}</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">Students Enrolled</span>
            <GraduationCap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight">{students.length}</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight">
            Rs. {payments.reduce((acc, p) => acc + Number(p.paid_amount || 0), 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-neutral-800 mb-6">
        {['leads', 'batches', 'students', 'payments'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 text-sm font-medium capitalize transition border-b-2 ${
              activeTab === tab 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Data Tables */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-400 flex justify-center items-center gap-2 text-sm font-medium">
            <RefreshCw className="w-4 h-4 animate-spin" /> Fetching database records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'leads' && (
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 uppercase text-xs font-semibold tracking-wider">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-neutral-800/50">
                      <td className="p-4 font-medium text-white">{l.name}</td>
                      <td className="p-4 font-mono text-xs text-neutral-300">{l.phone}</td>
                      <td className="p-4">{l.source}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-blue-900/40 text-blue-400 rounded-md text-xs font-medium">{l.status}</span></td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete('leads', l.id)} className="p-1 hover:text-rose-400 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'batches' && (
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 uppercase text-xs font-semibold tracking-wider">
                  <tr>
                    <th className="p-4">Batch Name</th>
                    <th className="p-4">Schedule</th>
                    <th className="p-4">Trainer</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {batches.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-800/50">
                      <td className="p-4 font-medium text-white">{b.name}</td>
                      <td className="p-4">{b.schedule}</td>
                      <td className="p-4">{b.trainer}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-emerald-900/40 text-emerald-400 rounded-md text-xs font-medium">{b.status || 'Active'}</span></td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete('batches', b.id)} className="p-1 hover:text-rose-400 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'students' && (
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 uppercase text-xs font-semibold tracking-wider">
                  <tr>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-800/50">
                      <td className="p-4 font-medium text-white">{s.name}</td>
                      <td className="p-4 font-mono text-xs text-neutral-300">{s.phone}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete('students', s.id)} className="p-1 hover:text-rose-400 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'payments' && (
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 uppercase text-xs font-semibold tracking-wider">
                  <tr>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Total Fee</th>
                    <th className="p-4">Paid</th>
                    <th className="p-4">Balance</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-800/50">
                      <td className="p-4 font-medium text-white">{p.students?.name || 'Unknown Student'}</td>
                      <td className="p-4 font-medium">Rs. {p.total_fee}</td>
                      <td className="p-4 text-emerald-400 font-medium">Rs. {p.paid_amount}</td>
                      <td className="p-4 text-amber-400 font-medium">Rs. {p.balance_amount || (p.total_fee - p.paid_amount)}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-amber-900/40 text-amber-400 rounded-md text-xs font-medium">{p.status}</span></td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete('payments', p.id)} className="p-1 hover:text-rose-400 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ADD LEAD MODAL */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-semibold tracking-tight mb-4">Add New Lead</h2>
            <form onSubmit={handleAddLead} className="space-y-4">
              <input 
                type="text" 
                placeholder="Lead Name" 
                className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm focus:outline-none focus:border-blue-500 font-normal"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
              />
              <input 
                type="text" 
                placeholder="Phone Number" 
                className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm focus:outline-none focus:border-blue-500 font-normal"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
              />
              <select 
                className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm focus:outline-none focus:border-blue-500 font-normal"
                value={newLead.source}
                onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
              >
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram</option>
                <option value="Walk-in">Walk-in</option>
              </select>
              <select 
                className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm focus:outline-none focus:border-blue-500 font-normal"
                value={newLead.status}
                onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
              >
                <option value="New">New</option>
                <option value="Interested">Interested</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Enrolled">Enrolled</option>
              </select>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setIsLeadModalOpen(false)} className="px-4 py-2 text-sm text-neutral-400 font-medium hover:text-white transition">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition">Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE BATCH MODAL */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-semibold tracking-tight mb-4">Create New Batch</h2>
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <input 
                type="text" 
                placeholder="Batch Name (e.g. AI-0901-A)" 
                className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm focus:outline-none focus:border-emerald-500 font-normal"
                value={newBatch.name}
                onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
              />
              <input 
                type="text" 
                placeholder="Schedule (e.g. Sep 1–12 · 7:30 PM)" 
                className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm focus:outline-none focus:border-emerald-500 font-normal"
                value={newBatch.schedule}
                onChange={(e) => setNewBatch({ ...newBatch, schedule: e.target.value })}
              />
              <input 
                type="text" 
                placeholder="Trainer Name" 
                className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm focus:outline-none focus:border-emerald-500 font-normal"
                value={newBatch.trainer}
                onChange={(e) => setNewBatch({ ...newBatch, trainer: e.target.value })}
              />
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setIsBatchModalOpen(false)} className="px-4 py-2 text-sm text-neutral-400 font-medium hover:text-white transition">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition">Save Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLL STUDENT MODAL */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-semibold tracking-tight mb-4">Enroll New Student</h2>
            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <input 
                type="text" 
                placeholder="Student Name" 
                className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm focus:outline-none focus:border-emerald-500 font-normal"
                value={newEnrollment.name}
                onChange={(e) => setNewEnrollment({ ...newEnrollment, name: e.target.value })}
              />
              <input 
                type="text" 
                placeholder="Phone Number" 
                className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm focus:outline-none focus:border-emerald-500 font-normal"
                value={newEnrollment.phone}
                onChange={(e) => setNewEnrollment({ ...newEnrollment, phone: e.target.value })}
              />
              
              {/* Fee and Payment Section */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Total Fee (Rs.)</label>
                  <input 
                    type="number" 
                    placeholder="Total Fee" 
                    className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm focus:outline-none focus:border-emerald-500 font-normal"
                    value={newEnrollment.total_fee}
                    onChange={(e) => setNewEnrollment({ ...newEnrollment, total_fee: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Paid Amount (Rs.)</label>
                  <input 
                    type="number" 
                    placeholder="Paid Amount" 
                    className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm focus:outline-none focus:border-emerald-500 font-normal"
                    value={newEnrollment.paid_amount}
                    onChange={(e) => setNewEnrollment({ ...newEnrollment, paid_amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setIsEnrollModalOpen(false)} className="px-4 py-2 text-sm text-neutral-400 font-medium hover:text-white transition">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition">Enroll Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
