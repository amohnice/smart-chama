import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { financeService } from '../../services/api';

// Transaction Thunks
export const fetchTransactions = createAsyncThunk(
  'finance/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await financeService.getTransactions();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'finance/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await financeService.createTransaction(transactionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create transaction');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'finance/updateTransaction',
  async ({ id, transactionData }, { rejectWithValue }) => {
    try {
      const response = await financeService.updateTransaction(id, transactionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'finance/deleteTransaction',
  async (id, { rejectWithValue }) => {
    try {
      await financeService.deleteTransaction(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete transaction');
    }
  }
);

// Loan Thunks
export const fetchLoans = createAsyncThunk(
  'finance/fetchLoans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await financeService.getLoans();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch loans');
    }
  }
);

export const createLoan = createAsyncThunk(
  'finance/createLoan',
  async (loanData, { rejectWithValue }) => {
    try {
      const response = await financeService.createLoan(loanData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create loan');
    }
  }
);

export const updateLoan = createAsyncThunk(
  'finance/updateLoan',
  async ({ id, loanData }, { rejectWithValue }) => {
    try {
      const response = await financeService.updateLoan(id, loanData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update loan');
    }
  }
);

export const deleteLoan = createAsyncThunk(
  'finance/deleteLoan',
  async (id, { rejectWithValue }) => {
    try {
      await financeService.deleteLoan(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete loan');
    }
  }
);

export const approveLoan = createAsyncThunk(
  'finance/approveLoan',
  async (id, { rejectWithValue }) => {
    try {
      const response = await financeService.approveLoan(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve loan');
    }
  }
);

export const rejectLoan = createAsyncThunk(
  'finance/rejectLoan',
  async (id, { rejectWithValue }) => {
    try {
      const response = await financeService.rejectLoan(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject loan');
    }
  }
);

export const repayLoan = createAsyncThunk(
  'finance/repayLoan',
  async ({ id, repaymentData }, { rejectWithValue }) => {
    try {
      const response = await financeService.repayLoan(id, repaymentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process loan repayment');
    }
  }
);

// Report Thunks
export const fetchFinancialReport = createAsyncThunk(
  'finance/fetchFinancialReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await financeService.getFinancialReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch financial report');
    }
  }
);

const initialState = {
  transactions: [],
  loans: [],
  reports: null,
  loading: false,
  error: null,
  success: false,
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    resetFinanceState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearReports: (state) => {
      state.reports = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.push(action.payload);
        state.success = true;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter(t => t._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Loans
      .addCase(fetchLoans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.loading = false;
        state.loans = action.payload;
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLoan.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createLoan.fulfilled, (state, action) => {
        state.loading = false;
        state.loans.push(action.payload);
        state.success = true;
      })
      .addCase(createLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(updateLoan.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateLoan.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.loans.findIndex(l => l._id === action.payload._id);
        if (index !== -1) {
          state.loans[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(deleteLoan.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteLoan.fulfilled, (state, action) => {
        state.loading = false;
        state.loans = state.loans.filter(l => l._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(approveLoan.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(approveLoan.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.loans.findIndex(l => l._id === action.payload._id);
        if (index !== -1) {
          state.loans[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(approveLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(rejectLoan.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(rejectLoan.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.loans.findIndex(l => l._id === action.payload._id);
        if (index !== -1) {
          state.loans[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(rejectLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(repayLoan.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(repayLoan.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.loans.findIndex(l => l._id === action.payload._id);
        if (index !== -1) {
          state.loans[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(repayLoan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Reports
      .addCase(fetchFinancialReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchFinancialReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetFinanceState, clearReports } = financeSlice.actions;

export default financeSlice.reducer; 