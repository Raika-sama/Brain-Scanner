import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TablePagination,
  TableSortLabel
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

const StudentsTab = ({ 
  classData, // Per filtrare per classe specifica
  onEditStudent, // Callback per la modifica
  showActions = true // Per mostrare/nascondere le azioni
}) => {
  const { state } = useApp();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [orderBy, setOrderBy] = React.useState('cognome');
  const [order, setOrder] = React.useState('asc');

  // Filtra e ordina gli studenti
  const filteredStudents = useMemo(() => {
    let students = classData 
      ? state.students.filter(student => student.classe?._id === classData._id)
      : state.students;

    // Ordinamento
    return students.sort((a, b) => {
      const isAsc = order === 'asc';
      switch (orderBy) {
        case 'nome':
          return isAsc ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome);
        case 'cognome':
          return isAsc ? a.cognome.localeCompare(b.cognome) : b.cognome.localeCompare(a.cognome);
        case 'sezione':
          return isAsc ? a.sezione.localeCompare(b.sezione) : b.sezione.localeCompare(a.sezione);
        default:
          return 0;
      }
    });
  }, [state.students, classData, order, orderBy]);

  // Gestione della paginazione
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Gestione dell'ordinamento
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Colonne della tabella
  const columns = [
    { id: 'nome', label: 'Nome' },
    { id: 'cognome', label: 'Cognome' },
    { id: 'sezione', label: 'Sezione' },
    { id: 'dataNascita', label: 'Data di Nascita' },
    ...(showActions ? [{ id: 'actions', label: 'Azioni' }] : [])
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
        {classData ? `Studenti della classe ${classData.number}${classData.section}` : 'Lista Studenti'}
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    {column.id !== 'actions' ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((student) => (
                  <TableRow
                    hover
                    key={student._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{student.nome}</TableCell>
                    <TableCell>{student.cognome}</TableCell>
                    <TableCell>{student.sezione}</TableCell>
                    <TableCell>
                      {new Date(student.dataNascita).toLocaleDateString('it-IT')}
                    </TableCell>
                    {showActions && (
                      <TableCell>
                        <Tooltip title="Modifica studente">
                          <IconButton
                            size="small"
                            onClick={() => onEditStudent(student)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length} 
                    align="center"
                    sx={{ py: 3 }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Nessuno studente trovato
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Righe per pagina"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} di ${count}`
          }
        />
      </Paper>
    </Box>
  );
};

export default StudentsTab;