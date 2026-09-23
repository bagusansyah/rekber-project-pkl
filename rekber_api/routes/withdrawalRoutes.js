const express = require('express');
const router = express.Router();

// IMPORT HARUS PAKAI KURUNG KURAWAL DAN NAMANYA HARUS SAMA PERSIS
const { getAllWithdrawals, updateWithdrawalStatus } = require('../controllers/withdrawalController');

// PANGGIL RUTENYA
router.get('/', getAllWithdrawals);
router.put('/:id', updateWithdrawalStatus);

// WAJIB ADA DI PALING BAWAH
module.exports = router;