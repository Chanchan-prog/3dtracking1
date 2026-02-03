import Table from "../../components/Table.jsx";
import Modal from "../../components/Modal.jsx";

function ClassScheduleIndex(){
  const DAY_OPTIONS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const [schedules,setSchedules]=React.useState([]);
  const [archivedSchedules,setArchivedSchedules]=React.useState([]);
  const [rooms,setRooms]=React.useState([]);
  const [offerings,setOfferings]=React.useState([]);
  const [teachers,setTeachers]=React.useState([]);
  const [semesters,setSemesters]=React.useState([]);
  const [showModal,setShowModal]=React.useState(false);
  const [editingSchedule, setEditingSchedule] = React.useState(null);
  const [form,setForm]=React.useState({ room_id:'', offering_id:'', day_of_week:'monday', start_time:'', end_time:'', user_id:'' });
  const [loading,setLoading]=React.useState(false);
  const [error,setError]=React.useState('');
  const [importing, setImporting] = React.useState(false);
  const [importSummary, setImportSummary] = React.useState(null);
  const [importErrors, setImportErrors] = React.useState([]);
  const [importAlreadyExist, setImportAlreadyExist] = React.useState([]);
  const [showImportPreview, setShowImportPreview] = React.useState(false);
  const [importPreviewRows, setImportPreviewRows] = React.useState([]);
  const [showArchived, setShowArchived] = React.useState(false);
  const [substituteEnabled, setSubstituteEnabled] = React.useState(false);
  const [substituteUserId, setSubstituteUserId] = React.useState('');
  const [substituteDate, setSubstituteDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [loadedSubstitution, setLoadedSubstitution] = React.useState(null);
  const fileInputRef = React.useRef(null);

  React.useEffect(()=>{
    (async ()=>{
      try{
        const [s,r,o,t,sem] = await Promise.all([
          apiGet('class-schedules'),
          apiGet('rooms'),
          apiGet('subject-offerings'),
          apiGet('teachers'),
          apiGet('semesters')
        ]);
        const roomsArr = Array.isArray(r)?r:[];
        const offeringsArr = Array.isArray(o)?o:[];
        const teachersArr = Array.isArray(t)?t:[];
        const semArr = Array.isArray(sem)?sem:[];
        setRooms(roomsArr);
        setOfferings(offeringsArr);
        setTeachers(teachersArr);
        setSemesters(semArr);

        const todayStr = new Date().toISOString().slice(0,10);
        const enhanced = (Array.isArray(s)?s:[]).map(row=>{
          const off = offeringsArr.find(v=> String(v.offering_id) === String(row.offering_id));
          const semester = off ? semArr.find(se=> String(se.semester_id) === String(off.semester_id)) : null;
          const isArchived = semester ? (semester.end_date && semester.end_date < todayStr) : false;
          const semesterId = semester?.semester_id || off?.semester_id || null;
          return {
            ...row,
            isArchived,
            semester_id: semesterId,
            semester_term: semester?.term || '',
            semester_end_date: semester?.end_date || null
          };
        });
        setSchedules(enhanced.filter(r=> !r.isArchived));
        setArchivedSchedules(enhanced.filter(r=> r.isArchived));
      }catch(e){
        console.error(e);
        setError('Failed to load schedules');
      }
    })();
  }, []);

  const openModal=(schedule=null)=>{
    setError('');
    setEditingSchedule(schedule);
    if (schedule) {
      const off = offerings.find(o => String(o.offering_id) === String(schedule.offering_id));
      setForm({
        room_id: schedule.room_id || '',
        offering_id: schedule.offering_id || '',
        day_of_week: schedule.day_of_week || 'monday',
        start_time: schedule.start_time ? String(schedule.start_time).slice(0,5) : '',
        end_time: schedule.end_time ? String(schedule.end_time).slice(0,5) : '',
        user_id: off?.user_id ?? ''
      });
    } else {
      setForm({
        room_id: rooms[0]?.room_id || '',
        offering_id: offerings[0]?.offering_id || '',
        day_of_week: 'monday',
        start_time: '',
        end_time: '',
        user_id: offerings[0]?.user_id ?? ''
      });
    }
    setShowModal(true);
    if (!schedule) {
      setSubstituteEnabled(false);
      setSubstituteUserId('');
      setSubstituteDate(new Date().toISOString().slice(0, 10));
      setLoadedSubstitution(null);
    }
  };

  React.useEffect(() => {
    if (!importSummary && !importErrors.length) return;
    const t = setTimeout(() => {
      setImportSummary(null);
      setImportErrors([]);
      setError('');
    }, 10000);
    return () => clearTimeout(t);
  }, [importSummary, importErrors]);

  React.useEffect(() => {
    if (!showModal || !editingSchedule?.schedule_id) return;
    (async () => {
      try {
        const list = await apiGet(`substitutions?schedule_id=${editingSchedule.schedule_id}`);
        const arr = Array.isArray(list) ? list : [];
        const first = arr[0] || null;
        setLoadedSubstitution(first);
        setSubstituteEnabled(!!first);
        setSubstituteUserId(first?.substitute_user_id ?? '');
        setSubstituteDate(first?.date ? String(first.date).slice(0, 10) : new Date().toISOString().slice(0, 10));
      } catch (e) {
        setLoadedSubstitution(null);
        setSubstituteEnabled(false);
        setSubstituteUserId('');
        setSubstituteDate(new Date().toISOString().slice(0, 10));
      }
    })();
  }, [showModal, editingSchedule?.schedule_id]);

  const closeModal=()=>{ setShowModal(false); setEditingSchedule(null); setLoadedSubstitution(null); };
  const handleChange=(e)=>{
    const name = e.target.name;
    const value = e.target.value;
    if (name === 'offering_id') {
      const off = offerings.find(o => String(o.offering_id) === String(value));
      setForm(p => ({ ...p, offering_id: value, user_id: off?.user_id ?? '' }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };
  const runWithFallback = async (primary, fallback) => {
    try {
      return await primary();
    } catch (err) {
      if (err?.status === 405 || err?.status === 500) {
        return await fallback();
      }
      throw err;
    }
  };
  const handleSubmit=async(e)=>{
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = {
      room_id: Number(form.room_id),
      offering_id: Number(form.offering_id),
      day_of_week: form.day_of_week,
      start_time: form.start_time,
      end_time: form.end_time
    };
    try{
      if (editingSchedule) {
        await runWithFallback(
          () => apiPut(`class-schedules/${editingSchedule.schedule_id}`, payload),
          () => apiPost(`class-schedules/${editingSchedule.schedule_id}/update`, payload)
        );
      } else {
        await apiPost('class-schedules', payload);
      }
      const offeringId = Number(form.offering_id);
      if (offeringId && !editingSchedule) {
        const teacherId = (form.user_id !== '' && form.user_id != null) ? Number(form.user_id) : 0;
        try {
          await apiPut(`subject-offerings/${offeringId}`, { user_id: teacherId });
        } catch (err) {
          console.warn('Could not update offering teacher', err);
        }
      }
      if (editingSchedule?.schedule_id) {
        const absentId = (form.user_id !== '' && form.user_id != null) ? Number(form.user_id) : null;
        if (substituteEnabled && substituteUserId && absentId) {
          try {
            await apiPost('substitutions', {
              schedule_id: editingSchedule.schedule_id,
              substitute_user_id: Number(substituteUserId),
              absent_user_id: absentId,
              date: substituteDate,
            });
          } catch (err) {
            console.warn('Could not save substitute teacher', err);
          }
        } else if (!substituteEnabled && loadedSubstitution?.substitution_id) {
          try {
            await apiDelete(`substitutions/${loadedSubstitution.substitution_id}`);
          } catch (err) {
            console.warn('Could not remove substitution', err);
          }
        }
      }
      const [s, o] = await Promise.all([apiGet('class-schedules'), apiGet('subject-offerings')]);
      if (Array.isArray(o)) setOfferings(o);
      const todayStr = new Date().toISOString().slice(0,10);
      const enhanced = (Array.isArray(s)?s:[]).map(row=>{
        const off = offerings.find(v=> String(v.offering_id) === String(row.offering_id));
        const semester = off ? semesters.find(se=> String(se.semester_id) === String(off.semester_id)) : null;
        const isArchived = semester ? (semester.end_date && semester.end_date < todayStr) : false;
        const semesterId = semester?.semester_id || off?.semester_id || null;
        return {
          ...row,
          isArchived,
          semester_id: semesterId,
          semester_term: semester?.term || '',
          semester_end_date: semester?.end_date || null
        };
      });
      setSchedules(enhanced.filter(r=> !r.isArchived));
      setArchivedSchedules(enhanced.filter(r=> r.isArchived));
      closeModal();
    }catch(err){
      console.error(err);
      setError(err.body?.error || err.message || 'Network error');
    } finally{ setLoading(false); }
  };

  const handleDelete = async (schedule) => {
    if (!schedule?.schedule_id) return;
    const ok = window.confirm('Delete this schedule?');
    if (!ok) return;
    setError('');
    try {
      await runWithFallback(
        () => apiDelete(`class-schedules/${schedule.schedule_id}`),
        () => apiPost(`class-schedules/${schedule.schedule_id}/delete`, {})
      );
      const s = await apiGet('class-schedules');
      const todayStr = new Date().toISOString().slice(0,10);
      const enhanced = (Array.isArray(s)?s:[]).map(row=>{
        const off = offerings.find(v=> String(v.offering_id) === String(row.offering_id));
        const semester = off ? semesters.find(se=> String(se.semester_id) === String(off.semester_id)) : null;
        const isArchived = semester ? (semester.end_date && semester.end_date < todayStr) : false;
        const semesterId = semester?.semester_id || off?.semester_id || null;
        return {
          ...row,
          isArchived,
          semester_id: semesterId,
          semester_term: semester?.term || '',
          semester_end_date: semester?.end_date || null
        };
      });
      setSchedules(enhanced.filter(r=> !r.isArchived));
      setArchivedSchedules(enhanced.filter(r=> r.isArchived));
    } catch (err) {
      console.error(err);
      const code = (err && (err.code || err.body?.error || err.message)) || '';
      // Backend returns "schedule_in_use" when there are dependent records;
      // show a friendly message instead of a generic network error.
      if (String(code).includes('schedule_in_use')) {
        setError('This schedule cannot be deleted because it is already in use (e.g. attendance records exist).');
      } else {
        setError(err.body?.error || err.message || 'Failed to delete schedule');
      }
    }
  };

  const getFileArrayBuffer = (file) => {
    if (file.arrayBuffer) return file.arrayBuffer();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const parseSpreadsheet = async (file) => {
    if (!window.XLSX) throw new Error('Spreadsheet parser is not available. Please reload the page.');
    const buffer = await getFileArrayBuffer(file);
    const workbook = window.XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames && workbook.SheetNames[0];
    if (!sheetName) return [];
    const worksheet = workbook.Sheets[sheetName];
    const rows = window.XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
    return Array.isArray(rows) ? rows : [];
  };

  const handleImportFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportSummary(null);
    setImportErrors([]);
    setError('');
    try {
      const rows = await parseSpreadsheet(file);
      const cleaned = rows.filter(r => Object.values(r || {}).some(v => String(v ?? '').trim() !== ''));
      if (!cleaned.length) {
        setError('No data rows found in the spreadsheet.');
        return;
      }
      // Store preview rows and open preview modal; actual import happens on confirm
      setImportPreviewRows(cleaned);
      setShowImportPreview(true);
    } catch (err) {
      console.error(err);
      setError(err.body?.error || err.message || 'Failed to import spreadsheet');
    } finally {
      setImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  const cancelImportPreview = () => {
    setShowImportPreview(false);
    setImportPreviewRows([]);
  };

  const confirmImport = async () => {
    if (!importPreviewRows.length) {
      setShowImportPreview(false);
      return;
    }
    setImporting(true);
    setImportSummary(null);
    setImportErrors([]);
    setImportAlreadyExist([]);
    setError('');
    try {
      const result = await apiPost('class-schedules', { rows: importPreviewRows });
      setImportSummary({
        inserted: Number(result?.inserted || 0),
        skipped: Number(result?.skipped || 0),
        total: importPreviewRows.length,
      });
      const errs = Array.isArray(result?.errors) ? result.errors : [];
      setImportErrors(errs);
      const alreadyExist = Array.isArray(result?.already_exist) ? result.already_exist : [];
      setImportAlreadyExist(alreadyExist);
      if (errs.length) setError('Some rows failed to import. See details below.');
      const s = await apiGet('class-schedules');
      const todayStr = new Date().toISOString().slice(0,10);
      const enhanced = (Array.isArray(s)?s:[]).map(row=>{
        const off = offerings.find(v=> String(v.offering_id) === String(row.offering_id));
        const semester = off ? semesters.find(se=> String(se.semester_id) === String(off.semester_id)) : null;
        const isArchived = semester ? (semester.end_date && semester.end_date < todayStr) : false;
        const semesterId = semester?.semester_id || off?.semester_id || null;
        return {
          ...row,
          isArchived,
          semester_id: semesterId,
          semester_term: semester?.term || '',
          semester_end_date: semester?.end_date || null
        };
      });
      setSchedules(enhanced.filter(r=> !r.isArchived));
      setArchivedSchedules(enhanced.filter(r=> r.isArchived));
      setShowImportPreview(false);
      setImportPreviewRows([]);
    } catch (err) {
      console.error(err);
      setError(err.body?.error || err.message || 'Failed to import spreadsheet');
    } finally {
      setImporting(false);
    }
  };

  const scheduleColumns=[
    { key:'schedule_id', label:'ID' },
    { key:'day_of_week', label:'Day' },
    { key:'time', label:'Time', render:(s)=>`${s.start_time?.slice(0,5)||''} - ${s.end_time?.slice(0,5)||''}` },
    { key:'room_name', label:'Room' },
    { key:'subject', label:'Subject / Section', render:(s)=> `${s.subject_code} - ${s.section_name}` },
    { key:'teacher', label:'Teacher', render:(s)=> {
      const fn = s.teacher_first_name || '';
      const ln = s.teacher_last_name || '';
      const full = [fn, ln].filter(Boolean).join(' ').trim();
      return full || '—';
    } },
    {
      key:'actions',
      label:'Actions',
      actions: [
        { label:'Edit', onClick: (row)=> openModal(row) },
        { label:'Delete', variant:'danger', onClick: (row)=> handleDelete(row) }
      ]
    }
  ];

  const archivedSemesterRows = React.useMemo(()=>{
    if (!archivedSchedules.length) return [];
    const bySem = new Map();
    archivedSchedules.forEach(s=>{
      const semId = s.semester_id || 'unknown';
      if (!bySem.has(semId)) {
        const sem = semesters.find(se=> String(se.semester_id) === String(semId));
        bySem.set(semId, {
          semester_id: semId,
          term: sem?.term || s.semester_term || 'Unknown',
          start_date: sem?.start_date || '',
          end_date: sem?.end_date || s.semester_end_date || '',
          count: 0,
        });
      }
      const rec = bySem.get(semId);
      rec.count += 1;
    });
    return Array.from(bySem.values());
  }, [archivedSchedules, semesters]);

  const [archivedDetail, setArchivedDetail] = React.useState(null);
  const archivedColumns=[
    { key:'semester_id', label:'Semester ID' },
    { key:'term', label:'Term' },
    { key:'start_date', label:'Start' },
    { key:'end_date', label:'End' },
    { key:'count', label:'Archived schedules' },
    {
      key:'actions',
      label:'Actions',
      actions: [
        { label:'View', onClick:(row)=> setArchivedDetail(row) }
      ]
    }
  ];

  const archivedDetailColumns = [
    { key:'schedule_id', label:'ID' },
    { key:'day_of_week', label:'Day' },
    { key:'time', label:'Time', render:(s)=>`${s.start_time?.slice(0,5)||''} - ${s.end_time?.slice(0,5)||''}` },
    { key:'room_name', label:'Room' },
    { key:'subject', label:'Subject / Section', render:(s)=> `${s.subject_code} - ${s.section_name}` },
    { key:'teacher', label:'Faculty instructor', render:(s)=> {
      const fn = s.teacher_first_name || '';
      const ln = s.teacher_last_name || '';
      const full = [fn, ln].filter(Boolean).join(' ').trim();
      return full || '—';
    } },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
          padding: 20,
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>Class Schedule Management</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
              View, import, and manage class schedules for all rooms and sections.
            </p>
          </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={importing}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: '1px solid #4b5563',
                background: '#ffffff',
                color: '#111827',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span className="bi bi-upload" /> {importing ? 'Importing…' : 'Import Spreadsheet'}
            </button>
            <button
              onClick={() => openModal()}
              disabled={importing}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: 'none',
                background: '#22c55e',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Add New Schedule
            </button>
            <button
              type="button"
              onClick={() => setShowArchived(s => !s)}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: '1px solid #d1d5db',
                background: showArchived ? '#111827' : '#ffffff',
                color: showArchived ? '#ffffff' : '#111827',
                fontSize: 13,
              }}
            >
              {showArchived ? 'Show current schedules' : 'View archived (ended semesters)'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 12,
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#b91c1c',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {importSummary && (
          <div
            style={{
              marginBottom: 8,
              padding: '6px 10px',
              borderRadius: 8,
              border: `1px solid ${importErrors.length ? '#facc15' : '#bbf7d0'}`,
              background: importErrors.length ? '#fef9c3' : '#ecfdf3',
              color: importErrors.length ? '#854d0e' : '#166534',
              fontSize: 13,
            }}
          >
            Import summary: {importSummary.inserted} inserted, {importSummary.skipped} skipped,{' '}
            {importSummary.total} total rows.
          </div>
        )}

        {importAlreadyExist.length > 0 && (
          <div
            style={{
              marginBottom: 12,
              border: '1px solid #b8daff',
              background: '#cce5ff',
              color: '#004085',
              padding: 10,
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              Already exist ({importAlreadyExist.length} row(s) – not imported)
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {importAlreadyExist.slice(0, 20).map((item, idx) => (
                <li key={`exist-${item.row ?? idx}-${idx}`}>
                  Row {item.row}: {item.message}
                  {item.room && ` – ${item.room}`}
                  {item.offering && ` | ${item.offering}`}
                  {item.day && ` | ${item.day} ${item.time || ''}`}
                </li>
              ))}
            </ul>
            {importAlreadyExist.length > 20 && (
              <div style={{ marginTop: 6 }}>And {importAlreadyExist.length - 20} more…</div>
            )}
          </div>
        )}

        {importErrors.length > 0 && (
          <div
            style={{
              marginBottom: 12,
              border: '1px solid #f5c6cb',
              background: '#f8d7da',
              color: '#721c24',
              padding: 10,
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              Import errors (first {Math.min(importErrors.length, 20)} rows)
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {importErrors.slice(0, 20).map((err, idx) => (
                <li key={`${err.row || idx}-${idx}`}>
                  Row {err.row || idx + 1}: {err.message || err.error || 'Invalid data'}
                </li>
              ))}
            </ul>
            {importErrors.length > 20 && (
              <div style={{ marginTop: 6 }}>And {importErrors.length - 20} more…</div>
            )}
          </div>
        )}

{/* <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
          Template columns supported: <strong>Campus (room)</strong>, <strong>Code</strong>,{' '}
          <strong>Subject Name</strong>, <strong>Section Name</strong>, <strong>Schedule</strong>{' '}
          (day/time), <strong>Teacher</strong> / <strong>Final Faculty</strong> (matched to users; if not found, schedule is still imported and a warning is shown). Other columns are ignored.
        </div> */}

        <Table
          columns={showArchived ? archivedColumns : scheduleColumns}
          data={showArchived ? archivedSemesterRows : schedules}
        />
      </div>
      <Modal
        show={showModal}
        title={editingSchedule ? 'Edit Class Schedule' : 'Add New Class Schedule'}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Room</label>
            <select
              name="room_id"
              value={form.room_id}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
            >
              <option value="">Select room</option>
              {rooms.map(r=> <option key={r.room_id} value={r.room_id}>{r.room_name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>
              Subject Offering
            </label>
            <select
              name="offering_id"
              value={form.offering_id}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
            >
              <option value="">Select offering</option>
              {offerings.map(o=> <option key={o.offering_id} value={o.offering_id}>{o.subject_code} - {o.section_name}</option>)}
            </select>
          </div>
          {editingSchedule ? (
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Assigned teacher</label>
              <p style={{ margin: 0, padding: '8px 10px', background: '#f1f5f9', borderRadius: 8, fontSize: 13, color: '#334155' }}>
                {[editingSchedule.teacher_first_name, editingSchedule.teacher_last_name].filter(Boolean).join(' ').trim() || '—'}
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Teacher / Faculty</label>
              <select
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
              >
                <option value="">— No teacher —</option>
                {teachers.map(t => (
                  <option key={t.user_id} value={t.user_id}>
                    {[t.first_name, t.last_name].filter(Boolean).join(' ').trim() || `User #${t.user_id}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Day of Week</label>
            <select
              name="day_of_week"
              value={form.day_of_week}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
            >
              {DAY_OPTIONS.map(d=> <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Start Time</label>
            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>End Time</label>
            <input
              type="time"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
            />
          </div>
          {editingSchedule && (
            <div style={{ marginBottom: 14, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={substituteEnabled}
                  onChange={(e) => setSubstituteEnabled(e.target.checked)}
                />
                <span>Substitute for this day / schedule</span>
              </label>
              {substituteEnabled && (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#64748b' }}>Substitute teacher (all faculty)</label>
                    <select
                      value={substituteUserId}
                      onChange={(e) => setSubstituteUserId(e.target.value)}
                      style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
                    >
                      <option value="">— Select substitute —</option>
                      {teachers.map(t => (
                        <option key={t.user_id} value={t.user_id}>
                          {[t.first_name, t.last_name].filter(Boolean).join(' ').trim() || `User #${t.user_id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: '#64748b' }}>For date</label>
                    <input
                      type="date"
                      value={substituteDate}
                      onChange={(e) => setSubstituteDate(e.target.value)}
                      style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={closeModal}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: '1px solid #d1d5db',
                background: '#ffffff',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: 'none',
                background: '#22c55e',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              {loading ? 'Saving...' : editingSchedule ? 'Update Schedule' : 'Save Schedule'}
            </button>
          </div>
        </form>
      </Modal>
      {/* Import preview modal */}
      <Modal
        show={showImportPreview}
        title="Preview Schedule Import"
        size="lg"
        onClose={cancelImportPreview}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <p style={{ fontSize: 14, marginTop: 0, marginBottom: 10 }}>
            Review the schedule rows detected in your spreadsheet. When you are ready, click <strong>Import</strong> to save them, or <strong>Cancel import</strong> to discard.
          </p>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <thead>
              <tr>
                {Object.keys(importPreviewRows[0] || {}).map((key) => (
                  <th
                    key={key}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      padding: '6px 8px',
                      textAlign: 'left',
                      background: '#f9fafb',
                      fontWeight: 600,
                    }}
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {importPreviewRows.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    background: idx % 2 ? '#f9fafb' : '#ffffff',
                  }}
                >
                  {Object.keys(importPreviewRows[0] || {}).map((key) => (
                    <td
                      key={key}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        padding: '4px 8px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {String(row[key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
          <button
            type="button"
            onClick={cancelImportPreview}
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              border: '1px solid #d1d5db',
              background: '#ffffff',
              fontSize: 13,
            }}
          >
            Cancel import
          </button>
          <button
            type="button"
            onClick={confirmImport}
            disabled={importing || !importPreviewRows.length}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              border: 'none',
              background: importing || !importPreviewRows.length ? '#9ca3af' : '#22c55e',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {importing ? 'Importing…' : 'Import'}
          </button>
        </div>
      </Modal>
      {/* Archived semester detail modal */}
      <Modal
        show={Boolean(archivedDetail)}
        title={archivedDetail ? `Archived schedules - ${archivedDetail.term}` : ''}
        size="lg"
        onClose={()=> setArchivedDetail(null)}
      >
        <Table
          columns={archivedDetailColumns}
          data={archivedDetail
            ? archivedSchedules.filter(s=> String(s.semester_id || '') === String(archivedDetail.semester_id || ''))
            : []}
        />
      </Modal>
    </div>
  );
}

export default ClassScheduleIndex;
