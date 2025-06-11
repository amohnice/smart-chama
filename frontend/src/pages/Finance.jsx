import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { financeService } from '../services/api';
import useApi from '../hooks/useApi';

const Finance = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const { data: transactions, isLoading: isLoadingTransactions } = useApi(
    financeService.getTransactions,
    { autoFetch: true }
  );

  const { data: loans, isLoading: isLoadingLoans } = useApi(
    financeService.getLoans,
    { autoFetch: true }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (transaction = null) => {
    setSelectedTransaction(transaction);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedTransaction(null);
    setOpenDialog(false);
  };

  const formik = useFormik({
    initialValues: {
      type: selectedTransaction?.type || 'contribution',
      amount: selectedTransaction?.amount || '',
      description: selectedTransaction?.description || '',
      date: selectedTransaction?.date || new Date().toISOString().split('T')[0],
    },
    validationSchema: Yup.object({
      type: Yup.string().required('Type is required'),
      amount: Yup.number()
        .required('Amount is required')
        .positive('Amount must be positive'),
      description: Yup.string().required('Description is required'),
      date: Yup.date().required('Date is required'),
    }),
    onSubmit: async (values) => {
      try {
        if (selectedTransaction) {
          await financeService.updateTransaction(selectedTransaction._id, values);
        } else {
          await financeService.createTransaction(values);
        }
        handleCloseDialog();
      } catch (error) {
        console.error('Error saving transaction:', error);
      }
    },
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MoneyIcon color="primary" sx={{ mr: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Total Contributions
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              KES {transactions?.filter(t => t.type === 'contribution')
                .reduce((acc, curr) => acc + curr.amount, 0) || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CreditCardIcon color="primary" sx={{ mr: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Active Loans
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              KES {loans?.filter(l => l.status === 'active')
                .reduce((acc, curr) => acc + curr.amount, 0) || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Total Balance
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              KES {transactions?.reduce((acc, curr) => acc + curr.amount, 0) || 0}
            </Typography>
          </Paper>
        </Grid>

        {/* Transactions and Loans Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Transactions" />
                <Tab label="Loans" />
              </Tabs>
            </Box>

            {/* Transactions Tab */}
            {tabValue === 0 && (
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Recent Transactions</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                  >
                    Add Transaction
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions?.map((transaction) => (
                        <TableRow key={transaction._id}>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{transaction.type}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell align="right">
                            KES {transaction.amount}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(transaction)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => financeService.deleteTransaction(transaction._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Loans Tab */}
            {tabValue === 1 && (
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Active Loans</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog({ type: 'loan' })}
                  >
                    Add Loan
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Member</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Interest Rate</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loans?.map((loan) => (
                        <TableRow key={loan._id}>
                          <TableCell>{loan.member.name}</TableCell>
                          <TableCell>KES {loan.amount}</TableCell>
                          <TableCell>{loan.interestRate}%</TableCell>
                          <TableCell>{loan.status}</TableCell>
                          <TableCell>
                            {new Date(loan.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(loan)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => financeService.deleteLoan(loan._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Transaction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  name="type"
                  label="Type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  helperText={formik.touched.type && formik.errors.type}
                >
                  <MenuItem value="contribution">Contribution</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                  <MenuItem value="loan">Loan</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="amount"
                  label="Amount"
                  type="number"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="date"
                  label="Date"
                  type="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedTransaction ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Finance; 