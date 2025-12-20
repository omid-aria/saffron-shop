
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
// Fix: Import Chart from chart.js/auto to resolve the global Chart reference
import Chart from 'chart.js/auto';

// Types
type Role = 'Owner' | 'Team Leader' | 'Helpdesk' | 'Employee';

interface User {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  points: number;
}

interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Solved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  creatorId: number;
  creatorName: string;
  assignedTo?: number;
  assignedName?: string;
  createdAt: string;
  resolvedAt?: string;
  pointsAwarded?: number;
}

interface Item {
  id: number;
  name: string;
  cost: number;
  stock: number;
}

// Mock initial data
const MOCK_USERS: User[] = [
  { id: 1, username: 'owner', fullName: 'System Admin', role: 'Owner', points: 0 },
  { id: 2, username: 'leader', fullName: 'Sarah TeamLead', role: 'Team Leader', points: 100 },
  { id: 3, username: 'help1', fullName: 'John Support', role: 'Helpdesk', points: 250 },
  { id: 4, username: 'emp1', fullName: 'Alice Smith', role: 'Employee', points: 500 },
];

const MOCK_TICKETS: Ticket[] = [
  { id: 101, subject: 'Internet connection slow', description: 'I cannot access the internal tools.', status: 'Open', priority: 'High', creatorId: 4, creatorName: 'Alice Smith', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 102, subject: 'Printer setup', description: 'Need help connecting to PR-04.', status: 'Solved', priority: 'Low', creatorId: 4, creatorName: 'Alice Smith', assignedTo: 3, assignedName: 'John Support', createdAt: new Date(Date.now() - 86400000).toISOString(), resolvedAt: new Date(Date.now() - 82800000).toISOString(), pointsAwarded: 50 },
];

const MOCK_ITEMS: Item[] = [
  { id: 1, name: 'Gift Card $10', cost: 100, stock: 10 },
  { id: 2, name: 'Company T-Shirt', cost: 200, stock: 5 },
  { id: 3, name: 'Mechanical Keyboard', cost: 1000, stock: 2 },
];

// Main App Component
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [items, setItems] = useState<Item[]>(MOCK_ITEMS);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = MOCK_USERS.find(u => u.username === loginData.username);
    if (foundUser) {
      setUser(foundUser);
      setView('dashboard');
    } else {
      alert('Invalid username. Try: owner, leader, help1, or emp1');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  // Logic for Points
  const calculatePoints = (createdAt: string, resolvedAt: string) => {
    const start = new Date(createdAt).getTime();
    const end = new Date(resolvedAt).getTime();
    const diffHours = (end - start) / (1000 * 60 * 60);

    if (diffHours < 2) return 50;
    if (diffHours < 24) return 20;
    return 5;
  };

  const solveTicket = (ticketId: number) => {
    const resolvedAt = new Date().toISOString();
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const points = calculatePoints(t.createdAt, resolvedAt);
        // In real app, update helpdesk user points here
        return { ...t, status: 'Solved', resolvedAt, pointsAwarded: points };
      }
      return t;
    }));
  };

  const assignTicket = (ticketId: number, helpdeskId: number) => {
    const helpdesk = MOCK_USERS.find(u => u.id === helpdeskId);
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, assignedTo: helpdeskId, assignedName: helpdesk?.fullName, status: 'In Progress' } : t
    ));
  };

  const createTicket = (subject: string, description: string, priority: any) => {
    const newTicket: Ticket = {
      id: Math.floor(Math.random() * 1000) + 200,
      subject,
      description,
      priority,
      status: 'Open',
      creatorId: user!.id,
      creatorName: user!.fullName,
      createdAt: new Date().toISOString()
    };
    setTickets([newTicket, ...tickets]);
    setView('tickets');
  };

  if (!user) {
    return (
      <div className="login-container">
        <div className="card shadow-lg" style={{ width: '400px' }}>
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <h1 className="h4 text-gray-900 font-bold">Welcome Back!</h1>
              <p className="text-muted small">Please login to your Helpdesk account</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input 
                  type="text" 
                  className="form-control form-control-user" 
                  placeholder="Username" 
                  value={loginData.username}
                  onChange={e => setLoginData({...loginData, username: e.target.value})}
                />
              </div>
              <div className="form-group">
                <input 
                  type="password" 
                  className="form-control form-control-user" 
                  placeholder="Password" 
                  value={loginData.password}
                  onChange={e => setLoginData({...loginData, password: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block py-2">Login</button>
            </form>
            <hr />
            <div className="text-center">
              <button className="btn btn-light btn-sm"><i className="fab fa-google mr-2"></i> Login with Google</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 d-flex">
      {/* Sidebar */}
      <nav className="sidebar col-md-2 d-none d-md-block p-0">
        <div className="p-4 text-center">
          <h5 className="font-weight-bold">HELP-POINT</h5>
          <div className="mt-3">
             <div className="avatar mb-2 bg-white text-primary">
               <i className="fas fa-user"></i>
             </div>
             <div className="small font-weight-bold">{user.fullName}</div>
             <div className="badge badge-light mt-1">{user.role}</div>
             {user.role === 'Employee' && <div className="mt-2"><span className="points-badge">{user.points} Pts</span></div>}
          </div>
        </div>
        <ul className="nav flex-column mt-3">
          <li className="nav-item">
            <a className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} href="#" onClick={() => setView('dashboard')}>
              <i className="fas fa-fw fa-tachometer-alt mr-2"></i> Dashboard
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${view === 'tickets' ? 'active' : ''}`} href="#" onClick={() => setView('tickets')}>
              <i className="fas fa-fw fa-ticket-alt mr-2"></i> Tickets
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${view === 'redemption' ? 'active' : ''}`} href="#" onClick={() => setView('redemption')}>
              <i className="fas fa-fw fa-gift mr-2"></i> Redemption
            </a>
          </li>
          {(user.role === 'Team Leader' || user.role === 'Owner') && (
            <li className="nav-item">
              <a className={`nav-link ${view === 'reports' ? 'active' : ''}`} href="#" onClick={() => setView('reports')}>
                <i className="fas fa-fw fa-chart-bar mr-2"></i> Reports
              </a>
            </li>
          )}
          <li className="nav-item mt-auto">
            <a className="nav-link text-warning" href="#" onClick={handleLogout}>
              <i className="fas fa-fw fa-sign-out-alt mr-2"></i> Logout
            </a>
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main id="main-content" className="col-md-10 ml-sm-auto">
        {view === 'dashboard' && <Dashboard user={user} tickets={tickets} />}
        {view === 'tickets' && <TicketList user={user} tickets={tickets} onAssign={assignTicket} onSolve={solveTicket} onCreate={() => setView('create_ticket')} />}
        {view === 'create_ticket' && <CreateTicketForm onCreate={createTicket} onCancel={() => setView('tickets')} />}
        {view === 'redemption' && <RedemptionStore user={user} items={items} />}
        {view === 'reports' && <Reports tickets={tickets} />}
      </main>
    </div>
  );
};

// Sub-components

const Dashboard = ({ user, tickets }: { user: User, tickets: Ticket[] }) => {
  const stats = useMemo(() => {
    return {
      open: tickets.filter(t => t.status === 'Open').length,
      progress: tickets.filter(t => t.status === 'In Progress').length,
      solved: tickets.filter(t => t.status === 'Solved').length,
      total: tickets.length
    };
  }, [tickets]);

  return (
    <div>
      <h2 className="mb-4 font-weight-bold text-gray-800">Dashboard</h2>
      <div className="row">
        <DashboardCard title="Open Tickets" value={stats.open} color="danger" icon="fa-exclamation-circle" />
        <DashboardCard title="In Progress" value={stats.progress} color="primary" icon="fa-spinner" />
        <DashboardCard title="Solved" value={stats.solved} color="success" icon="fa-check-circle" />
        <DashboardCard title="Your Points" value={user.points} color="warning" icon="fa-coins" />
      </div>

      <div className="mt-5">
        <div className="card">
          <div className="card-header">Recent Activity</div>
          <div className="card-body">
            <ul className="list-group list-group-flush">
              {tickets.slice(0, 5).map(t => (
                <li key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <span className="font-weight-bold">{t.subject}</span>
                    <p className="mb-0 small text-muted">Created by {t.creatorName} • {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge badge-${t.status === 'Open' ? 'danger' : t.status === 'Solved' ? 'success' : 'primary'}`}>
                    {t.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, color, icon }: any) => (
  <div className="col-xl-3 col-md-6 mb-4">
    <div className={`card border-left-${color} shadow h-100 py-2`}>
      <div className="card-body">
        <div className="row no-gutters align-items-center">
          <div className="col mr-2">
            <div className={`text-xs font-weight-bold text-${color} text-uppercase mb-1`}>{title}</div>
            <div className="h5 mb-0 font-weight-bold text-gray-800">{value}</div>
          </div>
          <div className="col-auto">
            <i className={`fas ${icon} fa-2x text-gray-300`}></i>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TicketList = ({ user, tickets, onAssign, onSolve, onCreate }: any) => {
  const [filter, setFilter] = useState('All');
  
  const filtered = tickets.filter((t: Ticket) => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="font-weight-bold text-gray-800">Tickets</h2>
        {user.role === 'Employee' && (
          <button className="btn btn-primary" onClick={onCreate}>
            <i className="fas fa-plus mr-2"></i> New Ticket
          </button>
        )}
      </div>

      <div className="mb-4">
        <div className="btn-group btn-group-sm">
          {['All', 'Open', 'In Progress', 'Solved'].map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="thead-light">
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Created By</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t: Ticket) => (
                <tr key={t.id} className={t.status === 'Open' ? 'ticket-status-open' : t.status === 'Solved' ? 'ticket-status-solved' : 'ticket-status-progress'}>
                  <td className="font-weight-bold">#{t.id}</td>
                  <td>{t.subject}</td>
                  <td><span className={`badge badge-${t.priority === 'High' ? 'danger' : t.priority === 'Medium' ? 'warning' : 'info'}`}>{t.priority}</span></td>
                  <td>{t.creatorName}</td>
                  <td>{t.assignedName || <span className="text-muted italic">Unassigned</span>}</td>
                  <td><span className="small font-weight-bold">{t.status}</span></td>
                  <td>
                    {user.role === 'Team Leader' && t.status === 'Open' && (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => onAssign(t.id, 3)}>Assign John</button>
                    )}
                    {user.role === 'Helpdesk' && t.status === 'In Progress' && (
                      <button className="btn btn-sm btn-success" onClick={() => onSolve(t.id)}>Resolve</button>
                    )}
                    <button className="btn btn-sm btn-light ml-1"><i className="fas fa-eye"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CreateTicketForm = ({ onCreate, onCancel }: any) => {
  const [form, setForm] = useState({ subject: '', description: '', priority: 'Medium' });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onCreate(form.subject, form.description, form.priority);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="card">
        <div className="card-header">Create New Support Request</div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Subject</label>
              <input type="text" className="form-control" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" rows={4} required value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select className="form-control" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light mr-2" onClick={onCancel}>Cancel</button>
              <button type="submit" className="btn btn-primary px-4">Create Ticket</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const RedemptionStore = ({ user, items }: { user: User, items: Item[] }) => {
  return (
    <div>
      <h2 className="mb-4 font-weight-bold text-gray-800">Redemption Shop</h2>
      <div className="alert alert-info d-flex align-items-center">
        <i className="fas fa-star mr-3"></i>
        <span>You have <strong>{user.points}</strong> points available to spend.</span>
      </div>
      <div className="row mt-4">
        {items.map(item => (
          <div key={item.id} className="col-md-4 mb-4">
            <div className="card h-100 border-bottom-warning">
              <div className="card-body text-center">
                <div className="mb-3 text-warning">
                  <i className="fas fa-gift fa-3x"></i>
                </div>
                <h5 className="font-weight-bold">{item.name}</h5>
                <p className="text-muted small">Stock: {item.stock}</p>
                <div className="h4 font-weight-bold text-warning mb-4">{item.cost} Pts</div>
                <button 
                  className="btn btn-warning btn-block font-weight-bold"
                  disabled={user.points < item.cost}
                >
                  {user.points < item.cost ? 'Insufficient Points' : 'Redeem Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Reports = ({ tickets }: { tickets: Ticket[] }) => {
  useEffect(() => {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    if (ctx) {
      // Fix: Use Modern Chart.js (v3+) configuration to resolve the global 'Chart' reference error
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Solved', 'In Progress', 'Open'],
          datasets: [{
            data: [
              tickets.filter(t => t.status === 'Solved').length,
              tickets.filter(t => t.status === 'In Progress').length,
              tickets.filter(t => t.status === 'Open').length
            ],
            backgroundColor: ['#1cc88a', '#4e73df', '#e74a3b'],
            hoverBackgroundColor: ['#17a673', '#2e59d9', '#be2617'],
            hoverBorderColor: "rgba(234, 236, 244, 1)",
          }],
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              backgroundColor: "rgb(255,255,255)",
              bodyColor: "#858796",
              borderColor: '#dddfeb',
              borderWidth: 1,
              padding: 15,
              displayColors: false,
              caretPadding: 10,
            },
            legend: {
              display: false
            }
          },
          cutout: '80%',
        } as any,
      });
    }
  }, [tickets]);

  return (
    <div>
      <h2 className="mb-4 font-weight-bold text-gray-800">Helpdesk Statistics</h2>
      <div className="row">
        <div className="col-xl-8 col-lg-7">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Overview</h6>
              <button className="btn btn-sm btn-success"><i className="fas fa-file-excel mr-1"></i> Export Excel</button>
            </div>
            <div className="card-body">
              <div className="chart-area" style={{ height: '300px' }}>
                <canvas id="myChart"></canvas>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-lg-5">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Resolution Summary</h6>
            </div>
            <div className="card-body">
              <p>Total Tickets: {tickets.length}</p>
              <p>Avg Response Time: 1.5 hrs</p>
              <p>Points Issued: {tickets.reduce((acc, t) => acc + (t.pointsAwarded || 0), 0)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
