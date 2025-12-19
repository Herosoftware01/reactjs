import * as React from 'react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Checkbox,
  FormControlLabel,
  Container,
} from '@mui/material';

const API_URLS = {
  order_panda: 'https://app.herofashion.com/order_panda/',
  ordmatpen: 'https://app.herofashion.com/ordmatpen/',
  accessory: 'https://app.herofashion.com/accessory/',
  Allotpen: 'https://app.herofashion.com/Allotpen/',
  knitst: 'https://app.herofashion.com/knitst/',
  Fabst: 'https://app.herofashion.com/Fabst/',
  Fabyarn: 'https://app.herofashion.com/Fabyarn/',
};

// ---------- HELPERS ----------
const hasValidImage = (img) => typeof img === 'string' && img.trim() !== '';

const HighlightedText = ({ text, highlight }) => {
  if (!highlight || !text) return <>{text}</>;
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = String(text).split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} style={{ backgroundColor: '#ffeb3b', fontWeight: 700 }}>
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

// ---------- MAIN COMPONENT ----------
export default function GridSystem() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [jobNoSearch, setJobNoSearch] = useState('');
  const [showOnlyWithoutImage, setShowOnlyWithoutImage] = useState(false);

  // ---------- LAZY SCROLL ----------
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef(null);

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setVisibleCount((prev) => prev + 20);
    }
  }, []);

  useEffect(() => {
    const option = { root: null, rootMargin: '20px', threshold: 1.0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [handleObserver]);

  // ---------- FETCH ALL APIS ----------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const responses = await Promise.all(Object.values(API_URLS).map((url) => fetch(url)));
        for (let r of responses) if (!r.ok) throw new Error('Failed to fetch some API');

        const [
          orderJson,
          ordMatJson,
          accessoryJson,
          allotpenJson,
          knitstJson,
          fabstJson,
          fabyarnJson,
        ] = await Promise.all(responses.map((r) => r.json()));

        const orderArr = Array.isArray(orderJson) ? orderJson : [orderJson];
        const ordMatArr = Array.isArray(ordMatJson) ? ordMatJson : [ordMatJson];
        const accessoryArr = Array.isArray(accessoryJson) ? accessoryJson : [accessoryJson];
        const allotpenArr = Array.isArray(allotpenJson) ? allotpenJson : [allotpenJson];
        const knitstArr = Array.isArray(knitstJson) ? knitstJson : [knitstJson];
        const fabstArr = Array.isArray(fabstJson) ? fabstJson : [fabstJson];
        const fabyarnArr = Array.isArray(fabyarnJson) ? fabyarnJson : [fabyarnJson];

        const merged = orderArr
          .map((order) => {
            const jobno = order.jobno_oms || 'N/A';
            const ordMat = ordMatArr.find((o) => o.orderno === jobno);
            const accessory = accessoryArr.find((a) => a.orderno === jobno);
            const allotpen = allotpenArr.find((a) => a.jobno_oms === jobno);
            const knitst = knitstArr.find((k) => k.orderno === jobno);
            const fabst = fabstArr.find((f) => f.jobno_fabric_status === jobno);
            const fabyarn = fabyarnArr.find((f) => f.orderno === jobno);

            return {
              jobno,
              image: order.mainimagepath,
              data: order,
              ordMat,
              accessory,
              allotpen,
              knitst,
              fabst,
              fabyarn,
            };
          })
          .filter((i) => i.jobno !== 'N/A');

        setRawData(merged);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ---------- FILTER ----------
  const filteredData = useMemo(() => {
    let temp = [...rawData];
    const s = searchTerm.toLowerCase();
    const j = jobNoSearch.toLowerCase();

    if (j) temp = temp.filter((i) => i.jobno.toLowerCase().includes(j));
    if (s) {
      temp = temp.filter(
        (i) =>
          Object.values(i.data)
            .join(' ')
            .toLowerCase()
            .includes(s) ||
          [i.ordMat, i.accessory, i.allotpen, i.knitst, i.fabst, i.fabyarn]
            .map((obj) => (obj ? Object.values(obj).join(' ') : ''))
            .join(' ')
            .toLowerCase()
            .includes(s)
      );
    }
    if (showOnlyWithoutImage) temp = temp.filter((i) => !hasValidImage(i.image));

    return temp;
  }, [rawData, searchTerm, jobNoSearch, showOnlyWithoutImage]);

  const visibleData = filteredData.slice(0, visibleCount);
  const highlightValue = jobNoSearch || searchTerm;

  if (loading) return <Box p={5} textAlign="center"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    // Fluid Container that fills the screen
    <Container maxWidth={false} sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif', p: { xs: 1, sm: 2, md: 3 } }}>
      
      {/* SEARCH CONTROLS - Stack on mobile, Row on Desktop */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
        gap: 2, 
        mb: 4,
        bgcolor: 'white',
        p: 2,
        borderRadius: 2,
        boxShadow: 1
      }}>
        <TextField size="small" label="Global Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} fullWidth />
        <TextField size="small" label="Job No Search" value={jobNoSearch} onChange={(e) => setJobNoSearch(e.target.value)} fullWidth />
        <FormControlLabel
          control={<Checkbox checked={showOnlyWithoutImage} onChange={(e) => setShowOnlyWithoutImage(e.target.checked)} />}
          label="Only without image"
        />
      </Box>

      <Typography sx={{ mb: 2, fontWeight: 600, color: '#555' }}>
        Showing {visibleData.length} worksheets
      </Typography>

      {/* LIST OF SHEETS */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {visibleData.map((item, i) => (
          
          /* WHITE SHEET CARD - Responsive padding and width */
          <Box key={i} sx={{ 
            bgcolor: 'white', 
            // Padding changes based on screen size (tight on mobile, spacious on PC)
            p: { xs: 2, sm: 3, md: 4 }, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            width: '100%',
            position: 'relative',
            borderRadius: '4px'
          }}>
            
            {/* HEADER: Flex row, wraps on very small screens if needed */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ flex: 1, pr: 2 }}>
                {/* Title size adjusts for mobile */}
                <Typography variant="h4" sx={{ 
                  color: '#0066cc', 
                  fontWeight: 900, 
                  letterSpacing: '-0.5px',
                  fontFamily: '"Arial Black", Gadget, sans-serif',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}>
                  Worksheet on '{item.jobno}'
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '1rem' }, mt: 1 }}>
                  Full data report for Order {item.jobno}.
                </Typography>
              </Box>

              {/* LOGO BOX - Fixed size, stays in corner */}
              <Box sx={{ 
                width: { xs: 60, sm: 80 }, 
                height: { xs: 60, sm: 80 }, 
                bgcolor: '#007bff', 
                borderRadius: { xs: 2, sm: 3 }, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                 {hasValidImage(item.image) ? (
                  <img 
                    src={item.image} 
                    alt="Job" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                 ) : (
                   <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>Img</Typography>
                 )}
              </Box>
            </Box>

            {/* BOX 1: DATA GRID - Highly Responsive Columns */}
            <Box sx={{ border: '2px solid black', p: 2, mb: 4 }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 2, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', textDecoration:'underline' }}>
                Main Order Specifications
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                // 1 col (mobile) -> 2 col (sm) -> 3 col (md) -> 4 col (lg) -> 6 col (xl/PC)
                gridTemplateColumns: { 
                  xs: '1fr', 
                  sm: 'repeat(2, 1fr)', 
                  md: 'repeat(3, 1fr)', 
                  lg: 'repeat(4, 1fr)', 
                  xl: 'repeat(6, 1fr)' 
                }, 
                gap: 2,
                textAlign: 'center'
              }}>
                {Object.entries(item.data).map(([key, val]) => (
                  <Box key={key} sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    overflow:'hidden',
                    wordBreak: 'break-word' // Prevents long text from breaking layout
                  }}>
                     <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem', color: '#666' }}>{key}</Typography>
                     <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        <HighlightedText text={val} highlight={highlightValue} />
                     </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* BOX 2: LINED PAPER - Full width text */}
            <Box sx={{ border: '2px solid black', position: 'relative' }}>
               <Box sx={{ p: { xs: 2, md: 3 } }}>
                 <Typography component="div" sx={{
                   fontSize: { xs: '1rem', md: '1.1rem' },
                   lineHeight: '2.5rem',
                   fontWeight: 500,
                   fontFamily: 'Arial, sans-serif',
                   color: '#333',
                   // Background lines
                   backgroundImage: 'linear-gradient(transparent 96%, #ccc 96%)',
                   backgroundSize: '100% 2.5rem',
                   backgroundAttachment: 'local',
                   wordBreak: 'break-word' // Crucial for mobile to wrap long technical words
                 }}>
                    {['ordMat', 'accessory', 'allotpen', 'knitst', 'fabst', 'fabyarn'].map((apiKey) => {
                       const apiData = item[apiKey];
                       if (!apiData) return null;

                       return (
                         <span key={apiKey}>
                           <span style={{ fontWeight: 900, textTransform: 'uppercase', textDecoration: 'underline', color: '#0066cc' }}>
                              {apiKey} Report:
                           </span>
                           {' '}
                           {Object.entries(apiData).map(([k, v], idx, arr) => (
                             <span key={k}>
                                <strong>{k}:</strong> <HighlightedText text={v} highlight={highlightValue} />
                                {idx < arr.length - 1 ? ', ' : '. '}
                             </span>
                           ))}
                           <br />
                         </span>
                       );
                    })}
                    
                    {['ordMat', 'accessory', 'allotpen', 'knitst', 'fabst', 'fabyarn'].every(k => !item[k]) && (
                      <span>No additional related data reports available for this order number.</span>
                    )}
                 </Typography>
               </Box>
            </Box>

          </Box>
        ))}

        {/* Lazy load trigger */}
        <div ref={loadMoreRef} />
        {visibleData.length < filteredData.length && (
          <Box textAlign="center" py={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
    </Container>
  );
}