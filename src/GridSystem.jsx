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
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  InputAdornment,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';

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
          <span key={i} style={{ backgroundColor: '#fff59d', fontWeight: 700, borderRadius: '2px', padding: '0 2px' }}>
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
export default function ModernGridSystem() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [jobNoSearch, setJobNoSearch] = useState('');
  const [showOnlyWithoutImage, setShowOnlyWithoutImage] = useState(false);

  // Responsive Hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    const option = { root: null, rootMargin: '400px', threshold: 0 };
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

  if (loading) return (
    <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#f4f6f8' }}>
      <CircularProgress thickness={4} />
    </Box>
  );
  
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 8 }}>
      
      {/* --- STICKY HEADER SEARCH --- */}
      <Paper 
        elevation={0}
        sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 100, 
          py: 2, 
          px: { xs: 2, md: 4 },
          borderBottom: '1px solid #e0e0e0',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255,255,255,0.9)'
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, 
            gap: 2, 
            alignItems: 'center'
          }}>
             <TextField 
                placeholder="Search everything..." 
                variant="outlined" 
                size="small" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon color="action"/></InputAdornment>,
                  sx: { borderRadius: 3, bgcolor: '#f8f9fa' }
                }}
             />
             <TextField 
                placeholder="Search Job No..." 
                variant="outlined" 
                size="small" 
                value={jobNoSearch}
                onChange={(e) => setJobNoSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><AssignmentIcon color="action"/></InputAdornment>,
                  sx: { borderRadius: 3, bgcolor: '#f8f9fa' }
                }}
             />
             <FormControlLabel
              control={<Checkbox checked={showOnlyWithoutImage} onChange={(e) => setShowOnlyWithoutImage(e.target.checked)} color="primary" />}
              label={<Typography variant="body2" fontWeight={500}>No Images</Typography>}
            />
          </Box>
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
            Found {filteredData.length} records
          </Typography>
        </Container>
      </Paper>

      {/* --- CONTENT GRID --- */}
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
          {visibleData.map((item, i) => (
            
            <Card key={i} elevation={0} sx={{ 
              borderRadius: 4, 
              border: '1px solid #eef0f2',
              boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 0 }}>
                
                {/* 1. HEADER SECTION */}
                <Box sx={{ 
                  p: { xs: 2, md: 3 }, 
                  display: 'flex', 
                  flexDirection: { xs: 'column-reverse', md: 'row' }, // Stack image on top mobile, right on desktop
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', md: 'center' },
                  gap: 2
                }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Chip label="ORDER" size="small" color="primary" sx={{ fontWeight: 700, borderRadius: 1 }} />
                      <Typography variant="h5" fontWeight={800} color="#1a202c">
                         <HighlightedText text={item.jobno} highlight={highlightValue} />
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                       Comprehensive data report across {Object.keys(API_URLS).length} systems.
                    </Typography>
                  </Box>

                  {/* IMAGE THUMBNAIL */}
                  <Box sx={{ 
                    width: { xs: '100%', md: 100 }, 
                    height: { xs: 200, md: 100 }, 
                    borderRadius: 3, 
                    overflow: 'hidden',
                    bgcolor: '#f0f2f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: { xs: 'stretch', md: 'auto' }
                  }}>
                     {hasValidImage(item.image) ? (
                        <img src={item.image} alt="Ref" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                     ) : (
                        <ImageNotSupportedIcon sx={{ color: '#cbd5e0', fontSize: 40 }} />
                     )}
                  </Box>
                </Box>

                <Divider />

                {/* 2. MAIN SPECS GRID (Gray Background) */}
                <Box sx={{ bgcolor: '#fafafa', p: { xs: 2, md: 3 } }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>
                    Primary Order Data
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' }, 
                    gap: 2 
                  }}>
                    {Object.entries(item.data).map(([key, val]) => (
                      <Box key={key}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem' }}>
                          {key.replace(/_/g, ' ').toUpperCase()}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ wordBreak: 'break-word' }}>
                          <HighlightedText text={val} highlight={highlightValue} />
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Divider />

                {/* 3. RELATED REPORTS (White Background) */}
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>
                     Production Reports
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gap: 3 }}>
                    {['ordMat', 'accessory', 'allotpen', 'knitst', 'fabst', 'fabyarn'].map((apiKey) => {
                       const apiData = item[apiKey];
                       if (!apiData) return null;

                       return (
                         <Box key={apiKey} sx={{ 
                           p: 2, 
                           borderRadius: 2, 
                           border: '1px solid #f0f0f0',
                           bgcolor: '#fff',
                           '&:hover': { bgcolor: '#fcfcfc', borderColor: '#e0e0e0' }
                         }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#e3f2fd', color: '#1976d2' }}>
                                {apiKey.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                                {apiKey} Report
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {Object.entries(apiData).map(([k, v]) => (
                                <Chip 
                                  key={k} 
                                  size="small" 
                                  variant="outlined"
                                  label={
                                    <span>
                                      <strong style={{ opacity: 0.6 }}>{k}: </strong>
                                      <HighlightedText text={v} highlight={highlightValue} />
                                    </span>
                                  } 
                                  sx={{ borderRadius: 1, borderColor: '#e0e0e0', bgcolor: 'transparent' }}
                                />
                              ))}
                            </Box>
                         </Box>
                       );
                    })}
                     
                    {/* Empty State */}
                    {['ordMat', 'accessory', 'allotpen', 'knitst', 'fabst', 'fabyarn'].every(k => !item[k]) && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No additional production reports linked to this order.
                      </Typography>
                    )}
                  </Box>
                </Box>

              </CardContent>
            </Card>
          ))}
        </Box>
        
        {/* Loading Spinner at Bottom */}
        <div ref={loadMoreRef} style={{ height: '20px', marginTop: '20px' }} />
        {visibleData.length < filteredData.length && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Container>
    </Box>
  );
}