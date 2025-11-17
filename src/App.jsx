import { useMemo, useState } from 'react';
import './App.css';

const makeId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2, 9)}`;

const seedPhotographers = [
  {
    id: makeId(),
    name: 'Ava Carter',
    specialties: ['Weddings', 'Editorial'],
    hourlyRate: 185,
    location: 'New York, NY',
    email: 'ava@northlight.studio',
    photoUrl:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80',
    availability: [
      {
        id: makeId(),
        date: '2025-11-18',
        start: '09:00',
        end: '13:00',
        location: 'Brooklyn Loft',
        status: 'open',
        notes: 'Prefers natural light near windows',
      },
      {
        id: makeId(),
        date: '2025-11-20',
        start: '15:00',
        end: '19:00',
        location: 'Chelsea Studio',
        status: 'booked',
        notes: 'Editorial for Luna Magazine',
      },
    ],
  },
  {
    id: makeId(),
    name: 'Maya Liang',
    specialties: ['Lifestyle', 'Product'],
    hourlyRate: 150,
    location: 'Los Angeles, CA',
    email: 'maya@sunsetcollective.com',
    photoUrl:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80',
    availability: [
      {
        id: makeId(),
        date: '2025-11-19',
        start: '10:00',
        end: '14:00',
        location: 'Downtown Arts District',
        status: 'open',
        notes: 'Ideal for lifestyle look-books',
      },
      {
        id: makeId(),
        date: '2025-11-21',
        start: '08:00',
        end: '11:30',
        location: 'Culver City Studio',
        status: 'hold',
        notes: 'Product shoot tentative',
      },
    ],
  },
  {
    id: makeId(),
    name: 'Leo Mercado',
    specialties: ['Events', 'Corporate', 'Documentary'],
    hourlyRate: 210,
    location: 'Chicago, IL',
    email: 'leo@fieldnotes.studio',
    photoUrl:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80',
    availability: [
      {
        id: makeId(),
        date: '2025-11-18',
        start: '16:00',
        end: '22:00',
        location: 'River North',
        status: 'booked',
        notes: 'Tech client product launch',
      },
      {
        id: makeId(),
        date: '2025-11-22',
        start: '07:30',
        end: '12:30',
        location: 'West Loop',
        status: 'open',
        notes: 'Documentary-style availability',
      },
    ],
  },
];

const statusLabels = {
  open: 'Open to book',
  hold: 'Soft hold',
  booked: 'Confirmed booking',
};

const statusOrder = ['open', 'hold', 'booked'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    amount,
  );

const combineDateTime = (slot) => new Date(`${slot.date}T${slot.start}`);

const sortSlots = (slots) =>
  [...slots].sort((a, b) => combineDateTime(a).getTime() - combineDateTime(b).getTime());

function App() {
  const [photographers, setPhotographers] = useState(seedPhotographers);
  const [photographerForm, setPhotographerForm] = useState({
    name: '',
    specialties: '',
    location: '',
    hourlyRate: '',
    email: '',
    photoUrl: '',
  });
  const [slotForm, setSlotForm] = useState({
    photographerId: seedPhotographers[0]?.id ?? '',
    date: '',
    start: '09:00',
    end: '13:00',
    location: '',
    status: 'open',
    notes: '',
  });
  const [filters, setFilters] = useState({
    specialty: 'all',
    status: 'all',
    date: '',
  });

  const allSlots = useMemo(() => {
    const flattened = photographers.flatMap((photographer) =>
      (photographer.availability ?? []).map((slot) => ({
        ...slot,
        photographer,
        sortKey: combineDateTime(slot).getTime(),
      })),
    );
    return flattened.sort((a, b) => a.sortKey - b.sortKey);
  }, [photographers]);

  const specialtyOptions = useMemo(() => {
    const bucket = new Set();
    photographers.forEach((photographer) => {
      photographer.specialties.forEach((specialty) => bucket.add(specialty));
    });
    return Array.from(bucket).sort();
  }, [photographers]);

  const filteredSlots = useMemo(() => {
    return allSlots.filter((slot) => {
      const matchesSpecialty =
        filters.specialty === 'all' || slot.photographer.specialties.includes(filters.specialty);
      const matchesStatus = filters.status === 'all' || slot.status === filters.status;
      const matchesDate = !filters.date || slot.date === filters.date;
      return matchesSpecialty && matchesStatus && matchesDate;
    });
  }, [allSlots, filters]);

  const timelineSlots = useMemo(() => {
    const source = filteredSlots.length ? filteredSlots : allSlots;
    return source.slice(0, 5);
  }, [allSlots, filteredSlots]);

  const summaryStats = useMemo(() => {
    const open = allSlots.filter((slot) => slot.status === 'open').length;
    const booked = allSlots.filter((slot) => slot.status === 'booked').length;
    const rateAverage =
      photographers.length === 0
        ? 0
        : Math.round(
            photographers.reduce((sum, photographer) => sum + (photographer.hourlyRate ?? 0), 0) /
              photographers.length,
          );
    return {
      photographers: photographers.length,
      openSlots: open,
      bookedSlots: booked,
      avgRate: rateAverage,
    };
  }, [allSlots, photographers]);

  const handlePhotographerSubmit = (event) => {
    event.preventDefault();
    if (!photographerForm.name.trim()) return;

    const specialties = photographerForm.specialties
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const newPhotographer = {
      id: makeId(),
      name: photographerForm.name.trim(),
      specialties: specialties.length ? specialties : ['General'],
      hourlyRate: Number(photographerForm.hourlyRate) || 0,
      location: photographerForm.location.trim() || 'Remote',
      email: photographerForm.email.trim(),
      photoUrl:
        photographerForm.photoUrl.trim() ||
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      availability: [],
    };

    setPhotographers((prev) => [...prev, newPhotographer]);
    setPhotographerForm({
      name: '',
      specialties: '',
      location: '',
      hourlyRate: '',
      email: '',
      photoUrl: '',
    });

    if (!slotForm.photographerId) {
      setSlotForm((prev) => ({ ...prev, photographerId: newPhotographer.id }));
    }
  };

  const handleSlotSubmit = (event) => {
    event.preventDefault();
    if (!slotForm.photographerId || !slotForm.date) return;

    const newSlot = {
      id: makeId(),
      date: slotForm.date,
      start: slotForm.start,
      end: slotForm.end,
      location: slotForm.location.trim() || 'TBD',
      status: slotForm.status,
      notes: slotForm.notes.trim(),
    };

    setPhotographers((prev) =>
      prev.map((photographer) =>
        photographer.id === slotForm.photographerId
          ? { ...photographer, availability: sortSlots([...photographer.availability, newSlot]) }
          : photographer,
      ),
    );

    setSlotForm((prev) => ({
      ...prev,
      date: '',
      location: '',
      notes: '',
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotographerInput = (field, value) => {
    setPhotographerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSlotInput = (field, value) => {
    setSlotForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Photographer Availability Control</h1>
        <p>
          Track roster bandwidth, release open slots, and book coverage across locations — all from a
          single command screen.
        </p>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <h3>Photographers</h3>
          <strong>{summaryStats.photographers}</strong>
          <span>Active on roster</span>
        </article>
        <article className="stat-card">
          <h3>Open Slots</h3>
          <strong>{summaryStats.openSlots}</strong>
          <span>Ready to assign</span>
        </article>
        <article className="stat-card">
          <h3>Booked Shoots</h3>
          <strong>{summaryStats.bookedSlots}</strong>
          <span>Confirmed this week</span>
        </article>
        <article className="stat-card">
          <h3>Avg. Rate</h3>
          <strong>{formatCurrency(summaryStats.avgRate)}</strong>
          <span>Per hour</span>
        </article>
      </section>

      <div className="layout-grid">
        <div className="glass-panel">
          <div className="panel-title">
            <h3>Roster intake</h3>
            <span>{photographers.length} total</span>
          </div>
          <form onSubmit={handlePhotographerSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                placeholder="eg. Elena Martinez"
                value={photographerForm.name}
                onChange={(event) => handlePhotographerInput('name', event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="specialties">Specialties</label>
              <input
                id="specialties"
                type="text"
                placeholder="Weddings, Editorial"
                value={photographerForm.specialties}
                onChange={(event) => handlePhotographerInput('specialties', event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Home base</label>
              <input
                id="location"
                type="text"
                placeholder="City, State"
                value={photographerForm.location}
                onChange={(event) => handlePhotographerInput('location', event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="hourlyRate">Hourly rate</label>
              <input
                id="hourlyRate"
                type="number"
                min="0"
                placeholder="180"
                value={photographerForm.hourlyRate}
                onChange={(event) => handlePhotographerInput('hourlyRate', event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Contact email</label>
              <input
                id="email"
                type="email"
                placeholder="hello@studio.com"
                value={photographerForm.email}
                onChange={(event) => handlePhotographerInput('email', event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="photoUrl">Avatar URL (optional)</label>
              <input
                id="photoUrl"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={photographerForm.photoUrl}
                onChange={(event) => handlePhotographerInput('photoUrl', event.target.value)}
              />
            </div>
            <button type="submit" className="primary-btn">
              Save to roster
            </button>
          </form>

          <hr />

          <div className="panel-title">
            <h3>Drop availability</h3>
            <span>Send slots to sales</span>
          </div>
          <form onSubmit={handleSlotSubmit}>
            <div className="form-group">
              <label htmlFor="photographerId">Photographer</label>
              <select
                id="photographerId"
                value={slotForm.photographerId}
                onChange={(event) => handleSlotInput('photographerId', event.target.value)}
              >
                <option value="">Select</option>
                {photographers.map((photographer) => (
                  <option key={photographer.id} value={photographer.id}>
                    {photographer.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={slotForm.date}
                onChange={(event) => handleSlotInput('date', event.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Window</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="time"
                  value={slotForm.start}
                  onChange={(event) => handleSlotInput('start', event.target.value)}
                />
                <input
                  type="time"
                  value={slotForm.end}
                  onChange={(event) => handleSlotInput('end', event.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="slotLocation">Location / client</label>
              <input
                id="slotLocation"
                type="text"
                placeholder="Venue or client name"
                value={slotForm.location}
                onChange={(event) => handleSlotInput('location', event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={slotForm.status}
                onChange={(event) => handleSlotInput('status', event.target.value)}
              >
                {statusOrder.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Lighting callouts, gear needs, etc."
                value={slotForm.notes}
                onChange={(event) => handleSlotInput('notes', event.target.value)}
              />
            </div>
            <button type="submit" className="primary-btn">
              Publish slot
            </button>
          </form>

          <hr />

          <div className="panel-title">
            <h3>Roster overview</h3>
            <span>Capabilities</span>
          </div>
          <div className="roster-list">
            {photographers.map((photographer) => (
              <article className="photographer-card" key={photographer.id}>
                <img
                  className="photographer-avatar"
                  src={photographer.photoUrl}
                  alt={photographer.name}
                  loading="lazy"
                />
                <div>
                  <h4>{photographer.name}</h4>
                  <p style={{ margin: '0.2rem 0', color: 'var(--slate-500)' }}>
                    {photographer.location} • {formatCurrency(photographer.hourlyRate)}/hr
                  </p>
                  <div className="chip-group">
                    {photographer.specialties.map((specialty) => (
                      <span className="chip" key={specialty}>
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-title">
            <h3>Live availability</h3>
            <span>{filteredSlots.length} slots visible</span>
          </div>

          <div className="filters">
            <div className="form-group">
              <label htmlFor="filterSpecialty">Specialty</label>
              <select
                id="filterSpecialty"
                value={filters.specialty}
                onChange={(event) => handleFilterChange('specialty', event.target.value)}
              >
                <option value="all">All specialties</option>
                {specialtyOptions.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="filterStatus">Status</label>
              <select
                id="filterStatus"
                value={filters.status}
                onChange={(event) => handleFilterChange('status', event.target.value)}
              >
                <option value="all">All statuses</option>
                {statusOrder.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="filterDate">Date</label>
              <input
                id="filterDate"
                type="date"
                value={filters.date}
                onChange={(event) => handleFilterChange('date', event.target.value)}
              />
            </div>
          </div>

          {filteredSlots.length ? (
            <table className="availability-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Photographer</th>
                  <th>Window</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.map((slot) => (
                  <tr key={slot.id}>
                    <td>{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                    <td>{slot.photographer.name}</td>
                    <td>
                      {slot.start} - {slot.end}
                    </td>
                    <td>{slot.location}</td>
                    <td>
                      <span className={`status-pill status-${slot.status}`}>{slot.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No availability matches the current filters.</p>
              <p>Adjust specialty, status, or date above to see more.</p>
            </div>
          )}

          <div className="panel-title" style={{ marginTop: '2rem' }}>
            <h3>Next bookings</h3>
            <span>Top of funnel</span>
          </div>
          {timelineSlots.length ? (
            <div className="timeline">
              {timelineSlots.map((slot) => (
                <div className="timeline-item" key={`timeline-${slot.id}`}>
                  <div className="timeline-time">
                    {new Date(slot.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                    <br />
                    <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                      {slot.start} - {slot.end}
                    </span>
                  </div>
                  <div className="timeline-card">
                    <strong>{slot.photographer.name}</strong>
                    <p style={{ margin: '0.2rem 0', color: 'var(--slate-500)' }}>
                      {slot.location} • {slot.photographer.specialties.join(', ')}
                    </p>
                    <span className={`status-pill status-${slot.status}`}>{slot.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No upcoming shoots logged.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
