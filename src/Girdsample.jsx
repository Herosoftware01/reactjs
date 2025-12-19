import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  CircularProgress, 
  Alert, 
  TextField, 
  Checkbox, 
  FormControlLabel,
  Grid
} from '@mui/material';

// Your provided API endpoint
const API_URL = 'https://app.herofashion.com/order_panda/'; 

// --- NEW COMPONENT: HighlightedText ---
// This component takes text and a search term, and highlights all non-overlapping matches.
const HighlightedText = ({ text, highlight }) => {
  if (!highlight || highlight.length === 0) {
    return <>{text}</>;
  }

  // Escape special regex characters in the highlight string
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create a global, case-insensitive regular expression
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  
  // Split the text by the search term, capturing the delimiter (the search term)
  const parts = text.split(regex);

  return (
    <Typography component="span" variant="body2" sx={{ display: 'inline' }}>
      {parts.map((part, index) => 
        // Check if the part matches the search term (case-insensitive)
        regex.test(part) ? (
          <Box
            key={index}
            component="span"
            sx={{ 
              backgroundColor: 'yellow', 
              fontWeight: 'bold', // Optional: make it bold too
              padding: '2px 0', 
              borderRadius: '2px'
            }}
          >
            {part}
          </Box>
        ) : (
          <React.Fragment key={index}>
            {part}
          </React.Fragment>
        )
      )}
    </Typography>
  );
};
// ----------------------------------------


function FiveColumnDataTable() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [showOnlyWithImage, setShowOnlyWithImage] = useState(false); 

  // 1. Define the 5 columns for the header
  const columnConfig = [
    { label: 'Job No', key: 'jobno_oms', searchable: true },
    { label: 'Image', key: 'image_order', searchable: false },
    { label: 'Final Del Date', key: 'finaldelvdate', searchable: false },
    { label: 'PO No', key: 'pono', searchable: true },
    { label: 'Reference', key: 'reference', searchable: true },
  ];
  
  // 2. Data Fetching Logic (Unchanged)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json(); 
        const dataArray = Array.isArray(result) ? result : [result]; 
        
        const processedData = dataArray.map(item => ({
          jobno: item.jobno_oms || 'N/A',
          image: item.mainimagepath,
          finaldelvdate: item.finaldelvdate || 'N/A',
          pono: item.pono || 'N/A',
          reference: item.reference || 'N/A',
        })).filter(item => item.jobno !== 'N/A');

        setRawData(processedData); 
      } catch (e) {
        console.error("Fetching error:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 3. Filtering and Searching Logic (Unchanged)
  const filteredData = useMemo(() => {
    let temp = rawData;

    if (showOnlyWithImage) {
      temp = temp.filter(item => item.image);
    }

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      temp = temp.filter(item => 
        item.jobno.toLowerCase().includes(lowerCaseSearch) ||
        item.pono.toLowerCase().includes(lowerCaseSearch) ||
        item.reference.toLowerCase().includes(lowerCaseSearch)
      );
    }

    return temp;
  }, [rawData, searchTerm, showOnlyWithImage]); 

  // 4. Render Logic
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px" sx={{ width: '100%' }}>
        <CircularProgress />
        <Typography ml={2}>Loading data...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ width: '100%' }}>Failed to load data from API: {error}</Alert>;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2, width: '100%', maxWidth: '100%' }}>
      
      {/* --- FILTER AND OPTIONS BAR --- */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2, p: 1, border: '1px solid #ddd', borderRadius: 1, bgcolor: '#fafafa' }}>
        
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Search (Job No, PO No, Reference)"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showOnlyWithImage}
                onChange={(e) => setShowOnlyWithImage(e.target.checked)}
              />
            }
            label="Only show records with Image"
          />
        </Grid>
      </Grid>
      
      {/* --- DATA TABLE CONTAINER --- */}
      <TableContainer component={Box} sx={{ border: '1px solid #ddd', borderRadius: 1, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }} aria-label="Order Data Table">
          
          {/* --- TABLE HEADER (Unchanged) --- */}
          <TableHead>
            <TableRow sx={{ bgcolor: '#e0e0e0' }}>
              {columnConfig.map((col) => (
                <TableCell key={col.label} sx={{ fontWeight: 'bold' }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* --- TABLE BODY (DATA ROWS) --- */}
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" p={2}>No results found matching the current filters.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                <TableRow 
                  key={index} 
                  sx={{ 
                    '&:hover': { bgcolor: '#f5f5f5' },
                    '&:last-child td, &:last-child th': { border: 0 } 
                  }}
                >
                  
                  {/* Job No Column (Using HighlightedText) */}
                  <TableCell component="th" scope="row">
                    <HighlightedText text={item.jobno} highlight={searchTerm} />
                  </TableCell>
                  
                  {/* Image Column (Unchanged) */}
                  <TableCell align="left">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={`Job No: ${item.jobno}`}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </Box>
                  </TableCell>
                  
                  {/* Final Del Date Column (Unchanged) */}
                  <TableCell>
                    {item.finaldelvdate}
                  </TableCell>
                  
                  {/* PO No Column (Using HighlightedText) */}
                  <TableCell>
                    <HighlightedText text={item.pono} highlight={searchTerm} />
                  </TableCell>
                  
                  {/* Reference Column (Using HighlightedText) */}
                  <TableCell>
                    <HighlightedText text={item.reference} highlight={searchTerm} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default FiveColumnDataTable;