const router = require('express').Router();

router.use('/user', require('./user'));
router.use('/login', require('./login'));
router.use('/ip', require('./ip'));
router.use('/address', require('./address'));
router.use('/inventoryUpdate', require('./userInventoryUpdate'));
router.use('/history', require('./userHistory'));
router.use('/log', require('./log'));
router.use('/leave', require('./leave'));
router.use('/news', require('./news'));
router.use('/products', require('./products'));
router.use('/customers', require('./customers'));
router.use('/order', require('./orders'));
router.use('/expense', require('./expenses'));
module.exports = router;
