import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  TextField, 
  Checkbox, 
  FormControlLabel,
  Card, 
  CardMedia, 
  MenuItem, 
  Button,
  Avatar
} from '@mui/material';

const API_URL = 'https://app.herofashion.com/order_panda/'; 

// --- DATE HELPER ---
const parseDateToDateObject = (dateString) => {
  if (!dateString || dateString === 'N/A') return null;
  let cleanDate = dateString.trim();
  // Support for DD-MM-YYYY format
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleanDate)) {
    const parts = cleanDate.split('-');
    cleanDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  const date = new Date(cleanDate);
  return isNaN(date.getTime()) ? null : date;
};

const hasValidImage = (img) => typeof img === 'string' && img.trim() !== '';
const hasValidu46 = (u46) => typeof u46 === 'string' && u46.trim() !== '' && u46 !== 'N/A';

// --- HIGHLIGHT HELPER ---
const HighlightedText = ({ text, highlight }) => {
  if (!text) return null;
  const textStr = String(text);
  if (!highlight) return <>{textStr}</>;
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = textStr.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} style={{ backgroundColor: 'yellow', fontWeight: 'bold', color: 'black' }}>{part}</span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

function FiveColumnDataTable() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [jobNoSearch, setJobNoSearch] = useState('');
  const [jobSeriesFilter, setJobSeriesFilter] = useState('ALL'); 
  const [showOnlyWithoutImage, setShowOnlyWithoutImage] = useState(false);
  const [u46Filter, setU46Filter] = useState('ALL'); 
  const [sortType, setSortType] = useState('date_asc');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Server Error: ${res.status}`);
        const result = await res.json();
        const data = (Array.isArray(result) ? result : [result])
          .map(item => ({
            jobno: String(item.jobno_oms || 'N/A'),
            image: item.mainimagepath,
            finaldelvdate: String(item.finaldelvdate || item.final_year_delivery1 || 'N/A'),
            pono: String(item.pono || 'N/A'),
            buyer: String(item.buyer_sh || 'N/A'),
            unit: String(item.punit_sh || 'N/A'),
            style: String(item.styleid || 'N/A'),
            qty: String(item.quantity || 'N/A'),
            u46: String(item.u46 || 'N/A'),
            styleno: String(item.styleno || 'N/A'),
            ourdeldate: String(item.ourdeldate || 'N/A'),
            date: String(item.date || 'N/A'),
            merch: String(item.merch || 'N/A'),
          }))
          .filter(item => item.jobno !== 'N/A');
        setRawData(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let temp = [...rawData];
    if (jobSeriesFilter === 'H') temp = temp.filter(item => item.jobno.toUpperCase().startsWith('H'));
    if (jobSeriesFilter === 'J') temp = temp.filter(item => item.jobno.toUpperCase().startsWith('J'));
    if (jobNoSearch) temp = temp.filter(item => item.jobno.toLowerCase().includes(jobNoSearch.toLowerCase()));
    if (showOnlyWithoutImage) temp = temp.filter(item => !hasValidImage(item.image));
    if (u46Filter === 'WITH') temp = temp.filter(item => hasValidu46(item.u46));
    if (u46Filter === 'WITHOUT') temp = temp.filter(item => !hasValidu46(item.u46));
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      temp = temp.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(s)));
    }

    temp.sort((a, b) => {
      const getPriority = (jobno) => {
        const char = jobno.trim().toUpperCase()[0];
        if (char === 'H') return 1;
        if (char === 'J') return 2;
        return 3;
      };
      const pA = getPriority(a.jobno);
      const pB = getPriority(b.jobno);
      if (pA !== pB) return pA - pB;

      const da = parseDateToDateObject(a.finaldelvdate);
      const db = parseDateToDateObject(b.finaldelvdate);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return sortType === 'date_asc' ? da - db : db - da;
    });
    return temp;
  }, [rawData, jobNoSearch, showOnlyWithoutImage, u46Filter, searchTerm, sortType, jobSeriesFilter]);

  const getUnitColor = (unitName) => {
    if (!unitName) return '#fff';
    const u = unitName;
    if (u.includes('U1')) return '#E3F2FD'; 
    if (u.includes('U2')) return '#E8F5E9'; 
    if (u.includes('U3')) return '#FCE4EC'; 
    if (u.includes('U4')) return '#F3E5F5'; 
    if (u.includes('U5')) return '#b4a9b66e'; 
    if (u.includes('HUMUS')) return '#FFF3E0'; 
    if (u.includes('TRILOK')) return '#FFFDE7'; 
    if (u.includes('Raj Kn')) return '#8fcfcca6'; 
    if (u.includes('RICHMO')) return '#E8EAF6'; 
    if (u.includes('Sample')) return '#eccb85a8'; 
    if (u.includes('Humus')) return '#f3b0b0a8'; 
    if (u.includes('Stock')) return '#f3949486'; 
    if (u.includes('Prime')) return '#F9FBE7'; 
    if (u.includes('Indoli')) return '#d4e2589a'; 
    return '#fff'; 
  };

  if (loading) return <Box p={5} textAlign="center"><CircularProgress /></Box>;
  if (error) return <Box p={2}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box>
      <Box 
        sx={{ 
          position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper',
          borderBottom: 1, borderColor: 'divider', p: 1, ml:3
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(12, 1fr)', md: 'repeat(8, 1fr)' },
            gap: 1,
            alignItems: 'center', 
          }}
        >
          <TextField
            size="small" label="Global Search" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            sx={{ gridColumn: { xs: 'span 3', md: 'auto' } }}
          />

          <Button 
            variant="outlined" size="small" 
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            sx={{ 
              gridColumn: 'span 3', height: '40px', minWidth: 0, fontSize: '0.7rem',
              display: { xs: 'block', md: 'none' } 
            }}
          >
            {showFiltersMobile ? 'HIDE' : 'SHOW'} 
          </Button>

          <TextField
            select size="small" label="Series" value={jobSeriesFilter}
            onChange={e => setJobSeriesFilter(e.target.value)}
            sx={{ 
              gridColumn: { xs: 'span 3', md: 'auto' },
              display: { xs: showFiltersMobile ? 'flex' : 'none', md: 'flex' }
            }}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="H">H</MenuItem>
            <MenuItem value="J">J</MenuItem>
          </TextField>

          <TextField
            size="small" label="Job No" value={jobNoSearch}
            onChange={e => setJobNoSearch(e.target.value)}
            sx={{ 
              gridColumn: { xs: 'span 3', md: 'auto' },
              display: { xs: showFiltersMobile ? 'flex' : 'none', md: 'flex' }
            }}
          />

          <TextField
            select size="small" label="U46" value={u46Filter}
            onChange={e => setU46Filter(e.target.value)}
            sx={{ 
              gridColumn: { xs: 'span 3', md: 'auto' },
              display: { xs: showFiltersMobile ? 'flex' : 'none', md: 'flex' }
            }}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="WITH">With</MenuItem>
            <MenuItem value="WITHOUT">W/O</MenuItem>
          </TextField>

          <TextField
            select size="small" label="Sort" value={sortType}
            onChange={e => setSortType(e.target.value)}
            sx={{ 
              gridColumn: { xs: 'span 3', md: 'auto' },
              display: { xs: showFiltersMobile ? 'flex' : 'none', md: 'flex' }
            }}
          >
            <MenuItem value="date_asc">Old</MenuItem>
            <MenuItem value="date_desc">New</MenuItem>
          </TextField>
          
          <FormControlLabel
            control={<Checkbox size="small" checked={showOnlyWithoutImage} onChange={e => setShowOnlyWithoutImage(e.target.checked)} />}
            label="No Img"
            sx={{ 
              gridColumn: { xs: 'span 3', md: 'auto' },
              display: { xs: showFiltersMobile ? 'flex' : 'none', md: 'flex' },
              ml: 0, '& .MuiFormControlLabel-label': { fontSize: {xs: '0.65rem', md: '1rem' }}
            }}
          />

          <Typography 
            sx={{ 
              textAlign: 'center', fontWeight: 'semibold', fontSize: { xs: '0.8rem', md: '1.5rem' },
              gridColumn: { xs: 'span 3', md: 'auto' }
            }}
          >
             {filteredAndSortedData.length}/{rawData.length}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 1 }}>
        <Box
          sx={{
            display: 'grid', gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }
          }}
        >
          {filteredAndSortedData.map((item, i) => {
            // --- CALCULATION LOGIC ---
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize today to midnight

            const finalDateObj = parseDateToDateObject(item.finaldelvdate);
            const poDateObj = parseDateToDateObject(item.date);

            const MS_PER_DAY = 1000 * 60 * 60 * 24;

            // finalDiff = finaldelvdate - today
            const finalDiff = finalDateObj 
              ? Math.ceil((finalDateObj - today) / MS_PER_DAY) 
              : null;

            // poDiff = podate - today
            const poDiff = poDateObj 
              ? Math.ceil((poDateObj - today) / MS_PER_DAY) 
              : null;

            return (
              <Card key={i} sx={{ display: 'flex', height: 160, bgcolor: getUnitColor(item.unit), position: 'relative' }}>
                {/* Serial Number Badge */}
                <Avatar 
                  sx={{ 
                    width: 20, height: 20, fontSize: '0.7rem', 
                    bgcolor: 'rgba(0,0,0,0.6)', color: 'white',
                    position: 'absolute', top: 5, right: 5, zIndex: 1
                  }}
                >
                  {i + 1}
                </Avatar>

                <Box sx={{ width: '35%', bgcolor: '#fff' }}>
                  {hasValidImage(item.image) ? (
                    <CardMedia component="img" image={item.image} sx={{ height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                      <Typography variant="caption">No Image</Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ width: '35%', p: 1, overflow: 'hidden'}}>
                  <Typography fontWeight="bold" variant="body2" noWrap fontSize={'1.2rem'}>
                    <HighlightedText text={item.jobno} highlight={searchTerm || jobNoSearch} />
                  </Typography>
                  <Typography variant="caption" display="block" noWrap fontSize={'0.9rem'}>PO: {item.pono}</Typography>
                  <Typography variant="caption" display="block" noWrap fontSize={'0.9rem'}>{item.buyer} </Typography>
                  <Typography variant="caption" display="block" fontSize={'0.9rem'}>UNIT: {item.unit}</Typography>
                  <Typography variant="caption" display="block" fontSize={'0.9rem'}>QTY: {item.qty}</Typography>
                  <Typography variant="caption" display="block" noWrap fontSize={'0.9rem'}>ST: {item.styleno}</Typography>
                </Box>

                <Box sx={{ width: '35%', p: 1, overflow: 'hidden' }}>

                  <Typography variant="caption" display="block" fontSize={'0.85rem'}>MERCH: {item.merch}</Typography>
                  <Typography variant="caption" display="block" noWrap fontSize={'0.82rem'}>OD: {item.ourdeldate}</Typography>
                  <Typography variant="caption" display="block" fontSize={'0.9rem'}>DT: {item.date}</Typography>
                  {poDiff !== null && (
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.85rem', color: 'green', fontWeight: 'bold' }}>
                      DT :{Math.abs(poDiff)} day
                    </Typography>
                  )}
                  <Typography variant="caption" display="block" fontSize={'0.9rem'}>FD: {item.finaldelvdate}</Typography>
                  {finalDiff !== null && (
                    <Typography variant="caption" sx={{ color: finalDiff < 0 ? 'red' : 'green', fontWeight: 'bold', display: 'block', fontSize: '0.85rem'  }}>
                      {finalDiff < 0 ? `Delayed: ${Math.abs(finalDiff)}day` : `Due: ${finalDiff}day`}
                    </Typography>
                  )}
                </Box>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default FiveColumnDataTable;