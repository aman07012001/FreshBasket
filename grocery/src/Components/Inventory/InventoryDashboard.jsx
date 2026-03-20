import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Tabs, Tab, Badge } from '@mui/material';
import { Search, Add, Edit, Refresh, TrendingDown, Inventory } from '@mui/icons-material';
import { useInventory } from '../../context/InventoryContext';
import LoadingWrapper from '../LoadingWrapper/LoadingWrapper';
import ErrorAlert from '../ErrorAlert/ErrorAlert';

const InventoryDashboard = () => {
  const { 
    inventory, 
    loading, 
    error, 
    lowStockProducts,
    loadInventory,
    updateInventory,
    restockProduct,
    updateThreshold
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    quantity: 0,
    reason: '',
    threshold: 10
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOpenDialog = (product) => {
    setSelectedProduct(product);
    setFormData({
      quantity: product.quantity,
      reason: '',
      threshold: product.lowStockThreshold
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateInventory = async () => {
    if (!selectedProduct) return;

    const result = await updateInventory(selectedProduct.productId, formData.quantity, formData.reason);
    if (result.success) {
      handleCloseDialog();
    }
  };

  const handleRestock = async () => {
    if (!selectedProduct) return;

    const result = await restockProduct(selectedProduct.productId, formData.quantity, formData.reason);
    if (result.success) {
      handleCloseDialog();
    }
  };

  const handleUpdateThreshold = async () => {
    if (!selectedProduct) return;

    const result = await updateThreshold(selectedProduct.productId, formData.threshold);
    if (result.success) {
      handleCloseDialog();
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.productId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (product) => {
    if (product.quantity === 0) {
      return { label: 'Out of Stock', color: 'error' };
    } else if (product.quantity < product.lowStockThreshold) {
      return { label: 'Low Stock', color: 'warning' };
    } else {
      return { label: 'In Stock', color: 'success' };
    }
  };

  return (
    <main className="min-h-screen pt-20 pb-9">
      <ErrorAlert message={error} open={!!error} onClose={() => {}} />

      <Container>
        <Box className="mb-6">
          <Typography variant="h4" component="h1" className="font-bold text-gray-800">
            Inventory Management
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Manage product stock levels and monitor inventory
          </Typography>
        </Box>

        <Box className="mb-4">
          <Tabs value={selectedTab} onChange={handleTabChange} aria-label="inventory tabs">
            <Tab label="All Products" icon={<Inventory />} />
            <Tab 
              label="Low Stock" 
              icon={
                <Badge badgeContent={lowStockProducts.length} color="error">
                  <TrendingDown />
                </Badge>
              } 
            />
          </Tabs>
        </Box>

        <LoadingWrapper loading={loading}>
          {selectedTab === 0 ? (
            <>
              <Box className="mb-4 flex flex-col sm:flex-row gap-3">
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search className="mr-2" />
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => loadInventory()}
                  startIcon={<Refresh />}
                >
                  Refresh
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product ID</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Reserved</TableCell>
                      <TableCell>Low Stock Threshold</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Updated</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInventory.map((product) => {
                      const status = getStockStatus(product);
                      return (
                        <TableRow key={product.productId}>
                          <TableCell>{product.productId}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell>{product.reserved}</TableCell>
                          <TableCell>{product.lowStockThreshold}</TableCell>
                          <TableCell>
                            <Chip 
                              label={status.label} 
                              color={status.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(product.lastUpdated).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleOpenDialog(product)}
                              color="primary"
                            >
                              <Edit />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredInventory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="textSecondary">
                            No products found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Grid container spacing={3}>
              {lowStockProducts.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="success">
                    No low stock products! Your inventory is well managed.
                  </Alert>
                </Grid>
              ) : (
                lowStockProducts.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={product.productId}>
                      <Paper className="p-4">
                        <Box className="flex justify-between items-start">
                          <Box>
                            <Typography variant="h6" className="font-semibold">
                              {product.productId}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Current: {product.quantity} | Threshold: {product.lowStockThreshold}
                            </Typography>
                          </Box>
                          <Chip 
                            label={status.label} 
                            color={status.color}
                            size="small"
                          />
                        </Box>
                        <Box className="mt-3">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenDialog(product)}
                            startIcon={<Edit />}
                          >
                            Manage
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })
              )}
            </Grid>
          )}
        </LoadingWrapper>

        {}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Manage Inventory - {selectedProduct?.productId}</DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Quantity"
                  type="number"
                  value={selectedProduct?.quantity || 0}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Reserved Quantity"
                  type="number"
                  value={selectedProduct?.reserved || 0}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleFormChange('quantity', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Low Stock Threshold"
                  type="number"
                  value={formData.threshold}
                  onChange={(e) => handleFormChange('threshold', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason/Notes"
                  multiline
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => handleFormChange('reason', e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleUpdateInventory} variant="contained" color="primary">
              Update Inventory
            </Button>
            <Button onClick={handleRestock} variant="contained" color="success">
              Restock
            </Button>
            <Button onClick={handleUpdateThreshold} variant="outlined" color="secondary">
              Update Threshold
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </main>
  );
};

export default InventoryDashboard;